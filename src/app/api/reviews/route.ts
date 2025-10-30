import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Create Supabase client for server-side operations
function createSupabaseClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: any) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value, ...options })
        },
        async remove(name: string, options: any) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    const { appointment_id, rating, comment } = body

    if (!appointment_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Missing required fields: appointment_id and rating (1-5)' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        specialist_id,
        status,
        users!appointments_client_id_fkey(name, email),
        specialists!inner(
          users!inner(name, email)
        )
      `)
      .eq('id', appointment_id)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check if user is the client for this appointment
    if (user.id !== appointment.client_id) {
      return NextResponse.json(
        { error: 'Only the client can review this appointment' },
        { status: 403 }
      )
    }

    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only review completed appointments' },
        { status: 400 }
      )
    }

    // Check if review already exists
    const { data: existingReview, error: existingReviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('appointment_id', appointment_id)
      .eq('reviewer_id', user.id)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this appointment' },
        { status: 400 }
      )
    }

    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        appointment_id: appointment_id,
        reviewer_id: user.id,
        rating: rating,
        comment: comment || null
      })
      .select()
      .single()

    if (reviewError) {
      console.error('Error creating review:', reviewError)
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      )
    }

    // Log the review creation
    await supabase
      .from('logs')
      .insert({
        user_id: user.id,
        action: 'review_created',
        metadata: {
          appointment_id: appointment_id,
          specialist_id: appointment.specialist_id,
          rating: rating,
          has_comment: !!comment
        }
      })

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        appointment_id: review.appointment_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at
      }
    })

  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/reviews?specialist_id=xxx OR for current user's appointments
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    const specialistId = searchParams.get('specialist_id')

    // Get current user for client filtering
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let query = supabase
      .from('reviews')
      .select(`
        id,
        appointment_id,
        rating,
        comment,
        created_at,
        appointments!inner(
          id,
          client_id,
          specialist_id
        )
      `)

    // If specialist_id is provided, get reviews for that specialist
    if (specialistId) {
      query = query.eq('appointments.specialist_id', specialistId)
    } else {
      // Otherwise, get reviews for current user's appointments
      query = query.eq('appointments.client_id', user.id)
    }

    const { data: reviews, error: reviewsError } = await query.order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      reviews: reviews || []
    })

  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
