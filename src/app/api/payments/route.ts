import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'

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

// POST /api/payments - Create Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    
    const { specialist_id, date, start_time, end_time, description, client_phone } = body

    // Validate required fields
    if (!specialist_id || !date || !start_time || !end_time || !description) {
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

    // Verify user is a client
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'client') {
      return NextResponse.json(
        { error: 'Only clients can book appointments' },
        { status: 403 }
      )
    }

    // Check if specialist exists and is verified
    const { data: specialist, error: specialistError } = await supabase
      .from('specialists')
      .select(`
        id,
        verified,
        hourly_rate,
        users!inner(name, email)
      `)
      .eq('user_id', specialist_id)
      .single()

    if (specialistError || !specialist) {
      return NextResponse.json(
        { error: 'Specialist not found' },
        { status: 404 }
      )
    }

    if (!specialist.verified) {
      return NextResponse.json(
        { error: 'Specialist is not verified' },
        { status: 400 }
      )
    }

    // Check availability
    const appointmentDate = new Date(date)
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    
    const { data: availability, error: availabilityError } = await supabase
      .from('availability')
      .select('*')
      .eq('specialist_id', specialist_id)
      .eq('day', dayOfWeek)
      .eq('is_active', true)
      .single()

    if (availabilityError || !availability) {
      return NextResponse.json(
        { error: 'Specialist not available on this day' },
        { status: 400 }
      )
    }

    // Check if requested time slot is within availability
    if (start_time < availability.start_time || end_time > availability.end_time) {
      return NextResponse.json(
        { error: 'Requested time slot is outside specialist availability' },
        { status: 400 }
      )
    }

    // Check for existing appointments at the same time
    const { data: existingAppointments, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .eq('specialist_id', specialist_id)
      .eq('date', date)
      .in('status', ['pending', 'confirmed'])
      .or(`and(start_time.lt.${end_time},end_time.gt.${start_time})`)

    if (conflictError) {
      return NextResponse.json(
        { error: 'Error checking for conflicts' },
        { status: 500 }
      )
    }

    if (existingAppointments && existingAppointments.length > 0) {
      return NextResponse.json(
        { error: 'Time slot is already booked' },
        { status: 400 }
      )
    }

    // Calculate cost
    const startTime = new Date(`2000-01-01T${start_time}`)
    const endTime = new Date(`2000-01-01T${end_time}`)
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    const hourlyRate = specialist.hourly_rate || 50 // Default $50/hour
    const totalCost = durationHours * hourlyRate

    // Create appointment with pending status (will be confirmed after payment)
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        client_id: user.id,
        specialist_id: specialist_id,
        date,
        start_time,
        end_time,
        status: 'pending',
        total_cost: totalCost,
        description
      })
      .select(`
        id,
        date,
        start_time,
        end_time,
        total_cost,
        description,
        status,
        users!appointments_client_id_fkey(name, email),
        specialists(
          users(name, email)
        )
      `)
      .single()

    if (appointmentError) {
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        appointment_id: appointment.id,
        amount: totalCost,
        status: 'pending',
        method: 'stripe'
      })
      .select('id')
      .single()

    if (paymentError) {
      // Clean up appointment if payment record creation fails
      await supabase.from('appointments').delete().eq('id', appointment.id)
      return NextResponse.json(
        { error: 'Failed to create payment record' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `IT Consultation with ${specialist.users?.[0]?.name || 'Specialist'}`,
              description: `${description} - ${new Date(date).toLocaleDateString()} ${start_time}-${end_time}`,
            },
            unit_amount: Math.round(totalCost * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/dashboard/client?payment=success&appointment_id=${appointment.id}`,
      cancel_url: `${request.nextUrl.origin}/book-appointment?payment=cancelled`,
      metadata: {
        appointment_id: appointment.id,
        payment_id: payment.id,
        client_id: user.id,
        specialist_id: specialist_id,
      },
      customer_email: user.email,
    })

    // Update payment record with Stripe session ID
    await supabase
      .from('payments')
      .update({ stripe_payment_intent_id: session.id })
      .eq('id', payment.id)

    return NextResponse.json({
      success: true,
      session_id: session.id,
      checkout_url: session.url,
      appointment_id: appointment.id,
      payment_id: payment.id
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
