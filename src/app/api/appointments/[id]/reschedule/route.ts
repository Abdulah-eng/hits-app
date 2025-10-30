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

// PATCH /api/appointments/[id]/reschedule - Reschedule an appointment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient()
    const { id: appointmentId } = await params
    const body = await request.json()
    const { new_date, new_start_time, new_end_time, reason } = body

    if (!new_date || !new_start_time || !new_end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: new_date, new_start_time, new_end_time' },
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

    // Get appointment
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
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isClient = user.id === appointment.client_id
    const isSpecialist = user.id === appointment.specialist_id
    const isAdmin = userData?.role === 'admin'

    // Only allow rescheduling if user is involved in the appointment or is admin
    if (!isClient && !isSpecialist && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Only allow rescheduling of confirmed or pending appointments
    if (appointment.status !== 'confirmed' && appointment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot reschedule completed or cancelled appointment' },
        { status: 400 }
      )
    }

    // Check for conflicts with new time slot
    const { data: conflicts, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .eq('specialist_id', appointment.specialist_id)
      .eq('date', new_date)
      .in('status', ['pending', 'confirmed'])
      .neq('id', appointmentId)
      .or(`and(start_time.lt.${new_end_time},end_time.gt.${new_start_time})`)

    if (conflictError) {
      return NextResponse.json(
        { error: 'Error checking for conflicts' },
        { status: 500 }
      )
    }

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'New time slot conflicts with existing appointment' },
        { status: 400 }
      )
    }

    // Update appointment with new time
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ 
        date: new_date,
        start_time: new_start_time,
        end_time: new_end_time,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to reschedule appointment' },
        { status: 500 }
      )
    }

    // Send reschedule notifications
    try {
      const notificationResponse = await fetch(`${request.nextUrl.origin}/api/notifications/appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          notification_type: 'reschedule',
          custom_message: reason || `Rescheduled by ${isClient ? 'client' : isSpecialist ? 'specialist' : 'admin'}`
        }),
      })

      if (!notificationResponse.ok) {
        console.error('Failed to send reschedule notifications')
      }
    } catch (notificationError) {
      console.error('Error sending reschedule notifications:', notificationError)
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment rescheduled successfully'
    })

  } catch (error) {
    console.error('Reschedule appointment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
