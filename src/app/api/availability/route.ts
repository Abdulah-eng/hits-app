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

// GET /api/availability - Get availability for a specialist
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    const specialist_id = searchParams.get('specialist_id')
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let query = supabase.from('availability').select('*')

    // If specialist_id is provided, filter by it
    if (specialist_id) {
      // Check if current user owns this specialist profile
      const { data: specialist } = await supabase
        .from('specialists')
        .select('user_id')
        .eq('user_id', specialist_id)
        .single()

      if (specialist && specialist.user_id !== user.id) {
        // If not the owner, check if user is admin
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (userData?.role !== 'admin') {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          )
        }
      }

      query = query.eq('specialist_id', specialist_id)
    } else {
      // Get user's specialist profile
      const { data: specialist } = await supabase
        .from('specialists')
        .select('id, user_id')
        .eq('user_id', user.id)
        .single()

      if (!specialist) {
        return NextResponse.json(
          { error: 'Not a specialist' },
          { status: 403 }
        )
      }

      query = query.eq('specialist_id', user.id)
    }

    const { data: availability, error: availabilityError } = await query.order('day', { ascending: true })

    if (availabilityError) {
      return NextResponse.json(
        { error: 'Failed to fetch availability' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      availability
    })

  } catch (error) {
    console.error('Get availability error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/availability - Add new availability slot
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    
    const { day, start_time, end_time, is_active = true } = body

    // Validate required fields
    if (!day || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Check if user is a specialist
    const { data: specialist } = await supabase
      .from('specialists')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single()

    if (!specialist) {
      return NextResponse.json(
        { error: 'Only specialists can set availability' },
        { status: 403 }
      )
    }

    // Create availability
    const { data: availability, error: availabilityError } = await supabase
      .from('availability')
      .insert({
        specialist_id: user.id,
        day,
        start_time,
        end_time,
        is_active
      })
      .select()
      .single()

    if (availabilityError) {
      return NextResponse.json(
        { error: 'Failed to create availability' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      availability
    })

  } catch (error) {
    console.error('Create availability error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/availability - Update availability
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    
    const { id, day, start_time, end_time, is_active } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Availability ID required' },
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

    // Check ownership
    const { data: existingAvailability } = await supabase
      .from('availability')
      .select('specialist_id')
      .eq('id', id)
      .single()

    if (!existingAvailability || existingAvailability.specialist_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (day !== undefined) updateData.day = day
    if (start_time !== undefined) updateData.start_time = start_time
    if (end_time !== undefined) updateData.end_time = end_time
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: availability, error: updateError } = await supabase
      .from('availability')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update availability' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      availability
    })

  } catch (error) {
    console.error('Update availability error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/availability - Delete availability
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Availability ID required' },
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

    // Check ownership
    const { data: existingAvailability } = await supabase
      .from('availability')
      .select('specialist_id')
      .eq('id', id)
      .single()

    if (!existingAvailability || existingAvailability.specialist_id !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { error: deleteError } = await supabase
      .from('availability')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete availability' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Delete availability error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

