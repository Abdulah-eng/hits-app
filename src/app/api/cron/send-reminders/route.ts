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

// GET /api/cron/send-reminders - Send 24-hour appointment reminders
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (optional security check)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient()
    
    // Get tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDateString = tomorrow.toISOString().split('T')[0]

    // Find appointments scheduled for tomorrow that are confirmed
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        client_id,
        specialist_id,
        date,
        start_time,
        end_time,
        status,
        description,
        users!appointments_client_id_fkey(name, email, phone),
        specialists(
          users(name, email, phone)
        )
      `)
      .eq('date', tomorrowDateString)
      .eq('status', 'confirmed')

    if (appointmentsError) {
      console.error('Error fetching appointments for reminders:', appointmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No appointments found for tomorrow',
        appointments_processed: 0
      })
    }

    let processedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Send reminders for each appointment
    for (const appointment of appointments) {
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/notifications/appointment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointment_id: appointment.id,
            notification_type: 'reminder'
          }),
        })

        if (response.ok) {
          processedCount++
          console.log(`Reminder sent for appointment ${appointment.id}`)
        } else {
          errorCount++
          const errorData = await response.json()
          errors.push(`Appointment ${appointment.id}: ${errorData.error}`)
          console.error(`Failed to send reminder for appointment ${appointment.id}:`, errorData.error)
        }
      } catch (error) {
        errorCount++
        errors.push(`Appointment ${appointment.id}: ${error}`)
        console.error(`Error sending reminder for appointment ${appointment.id}:`, error)
      }
    }

    // Log the cron job execution
    await supabase
      .from('logs')
      .insert({
        user_id: 'system',
        action: 'cron_reminders_executed',
        metadata: {
          date: tomorrowDateString,
          appointments_found: appointments.length,
          appointments_processed: processedCount,
          errors: errorCount,
          error_details: errors
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Reminder processing completed',
      appointments_found: appointments.length,
      appointments_processed: processedCount,
      errors: errorCount,
      error_details: errors
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}
