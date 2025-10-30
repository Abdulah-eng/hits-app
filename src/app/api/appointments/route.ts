import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/sendgrid'
import { sendSMS } from '@/lib/twilio'

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

// GET /api/appointments - Get appointments for the current user (client or specialist)
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') // 'client' or 'specialist'
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's role from users table
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 404 }
      )
    }

    // Build query based on role
    let query = supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        specialist_id,
        date,
        start_time,
        end_time,
        status,
        total_cost,
        description,
        created_at,
        updated_at
      `)

    // Filter by role
    if (userData.role === 'client') {
      query = query.eq('client_id', user.id)
    } else if (userData.role === 'specialist') {
      query = query.eq('specialist_id', user.id)
    } else if (userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get appointments
    const { data: appointments, error: appointmentsError } = await query.order('date', { ascending: false })

    if (appointmentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    // Fetch related user data (client or specialist names)
    const appointmentsWithNames = await Promise.all(
      appointments.map(async (appointment) => {
        const [clientData, specialistData] = await Promise.all([
          supabase
            .from('users')
            .select('name, email')
            .eq('id', appointment.client_id)
            .single(),
          supabase
            .from('users')
            .select('name, email')
            .eq('id', appointment.specialist_id)
            .single()
        ])

        return {
          ...appointment,
          client_name: clientData.data?.name || 'Client',
          specialist_name: specialistData.data?.name || 'Specialist'
        }
      })
    )

    return NextResponse.json({
      success: true,
      appointments: appointmentsWithNames
    })

  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Book a new appointment
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

    // Create appointment
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

    // Send confirmation emails
    try {
      // Email to client
      await sendEmail({
        to: user.email!,
        subject: 'Appointment Booked - H.I.T.S.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Appointment Confirmed!</h1>
            <p>Hello ${appointment.users?.[0]?.name || 'Client'},</p>
            <p>Your appointment has been successfully booked:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Appointment Details</h3>
              <p><strong>Specialist:</strong> ${appointment.specialists?.[0]?.users?.[0]?.name || 'Specialist'}</p>
              <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${appointment.start_time} - ${appointment.end_time}</p>
              <p><strong>Service:</strong> ${appointment.description}</p>
              <p><strong>Total Cost:</strong> $${appointment.total_cost}</p>
            </div>
            <p>The specialist will confirm your appointment shortly.</p>
            <p>Best regards,<br>The H.I.T.S. Team</p>
          </div>
        `
      })

      // Email to specialist
      await sendEmail({
        to: appointment.specialists?.[0]?.users?.[0]?.email || '',
        subject: 'New Appointment Request - H.I.T.S.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">New Appointment Request</h1>
            <p>Hello ${appointment.specialists?.[0]?.users?.[0]?.name || 'Specialist'},</p>
            <p>You have received a new appointment request:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Appointment Details</h3>
              <p><strong>Client:</strong> ${appointment.users?.[0]?.name || 'Client'}</p>
              <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${appointment.start_time} - ${appointment.end_time}</p>
              <p><strong>Service:</strong> ${appointment.description}</p>
              <p><strong>Total Cost:</strong> $${appointment.total_cost}</p>
            </div>
            <p>Please log in to your dashboard to confirm or decline this appointment.</p>
            <p>Best regards,<br>The H.I.T.S. Team</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the appointment creation if email fails
    }

    // Send SMS to client if phone number provided
    if (client_phone) {
      try {
        await sendSMS({
          to: client_phone,
          body: `H.I.T.S. Appointment Confirmed! Date: ${new Date(appointment.date).toLocaleDateString()}, Time: ${appointment.start_time}-${appointment.end_time}, Specialist: ${appointment.specialists?.[0]?.users?.[0]?.name || 'Specialist'}. Total: $${appointment.total_cost}`
        })
      } catch (smsError) {
        console.error('SMS sending failed:', smsError)
        // Don't fail the appointment creation if SMS fails
      }
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        date: appointment.date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        total_cost: appointment.total_cost,
        description: appointment.description,
        status: appointment.status,
        specialist_name: appointment.specialists?.[0]?.users?.[0]?.name || 'Specialist'
      }
    })

  } catch (error) {
    console.error('Appointment booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}