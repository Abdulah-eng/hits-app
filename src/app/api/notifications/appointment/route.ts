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

// POST /api/notifications/appointment - Send appointment notifications
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const body = await request.json()
    
    const { appointment_id, notification_type, custom_message } = body

    if (!appointment_id || !notification_type) {
      return NextResponse.json(
        { error: 'Missing required fields: appointment_id and notification_type' },
        { status: 400 }
      )
    }

    // Get appointment details
    const { data: appointment, error: appointmentError } = await supabase
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
        users!appointments_client_id_fkey(name, email, phone),
        specialists(
          users(name, email, phone)
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

    const client = appointment.users?.[0]
    const specialist = appointment.specialists?.[0]?.users?.[0]

    if (!client || !specialist) {
      return NextResponse.json(
        { error: 'Missing client or specialist information' },
        { status: 400 }
      )
    }

    const appointmentDate = new Date(appointment.date)
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const formattedTime = `${appointment.start_time} - ${appointment.end_time}`

    let results = {
      emails_sent: 0,
      sms_sent: 0,
      errors: [] as string[]
    }

    // Handle different notification types
    switch (notification_type) {
      case 'confirmation':
        await handleConfirmationNotifications(client, specialist, appointment, formattedDate, formattedTime, results)
        break
      
      case 'reminder':
        await handleReminderNotifications(client, specialist, appointment, formattedDate, formattedTime, results)
        break
      
      case 'cancellation':
        await handleCancellationNotifications(client, specialist, appointment, formattedDate, formattedTime, custom_message, results)
        break
      
      case 'reschedule':
        await handleRescheduleNotifications(client, specialist, appointment, formattedDate, formattedTime, custom_message, results)
        break
      
      case 'dispute_resolved':
        await handleDisputeResolutionNotifications(client, specialist, appointment, formattedDate, formattedTime, custom_message, results)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        )
    }

    // Log notification in database
    await supabase
      .from('logs')
      .insert({
        user_id: appointment.client_id,
        action: `notification_sent_${notification_type}`,
        metadata: {
          appointment_id: appointment.id,
          notification_type,
          emails_sent: results.emails_sent,
          sms_sent: results.sms_sent,
          errors: results.errors
        }
      })

    return NextResponse.json({
      success: true,
      notification_type,
      appointment_id,
      results
    })

  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle confirmation notifications
async function handleConfirmationNotifications(
  client: any,
  specialist: any,
  appointment: any,
  formattedDate: string,
  formattedTime: string,
  results: any
) {
  try {
    // Email to client
    const clientEmailResult = await sendEmail({
      to: client.email,
      subject: 'Appointment Confirmed - H.I.T.S.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Appointment Confirmed!</h1>
          <p>Hello ${client.name},</p>
          <p>Your appointment has been confirmed:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details</h3>
            <p><strong>Specialist:</strong> ${specialist.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Service:</strong> ${appointment.description}</p>
            <p><strong>Total Cost:</strong> $${appointment.total_cost}</p>
          </div>
          <p>Your appointment is confirmed! The specialist will contact you if needed.</p>
          <p>Best regards,<br>The H.I.T.S. Team</p>
        </div>
      `
    })

    if (clientEmailResult.success) {
      results.emails_sent++
    } else {
      results.errors.push('Failed to send client confirmation email')
    }

    // Email to specialist
    const specialistEmailResult = await sendEmail({
      to: specialist.email,
      subject: 'New Confirmed Appointment - H.I.T.S.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Confirmed Appointment</h1>
          <p>Hello ${specialist.name},</p>
          <p>You have a new confirmed appointment:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details</h3>
            <p><strong>Client:</strong> ${client.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Service:</strong> ${appointment.description}</p>
            <p><strong>Amount:</strong> $${appointment.total_cost}</p>
          </div>
          <p>Payment has been processed. Please prepare for your session.</p>
          <p>Best regards,<br>The H.I.T.S. Team</p>
        </div>
      `
    })

    if (specialistEmailResult.success) {
      results.emails_sent++
    } else {
      results.errors.push('Failed to send specialist confirmation email')
    }

    // SMS to client if phone available
    if (client.phone) {
      const smsResult = await sendSMS({
        to: client.phone,
        body: `H.I.T.S. Appointment Confirmed! ${specialist.name} on ${formattedDate} at ${appointment.start_time}. Total: $${appointment.total_cost}`
      })

      if (smsResult.success) {
        results.sms_sent++
      } else {
        results.errors.push('Failed to send client confirmation SMS')
      }
    }

  } catch (error) {
    results.errors.push(`Confirmation notification error: ${error}`)
  }
}

// Handle reminder notifications
async function handleReminderNotifications(
  client: any,
  specialist: any,
  appointment: any,
  formattedDate: string,
  formattedTime: string,
  results: any
) {
  try {
    // Email reminder to client
    const clientEmailResult = await sendEmail({
      to: client.email,
      subject: 'Appointment Reminder - Tomorrow - H.I.T.S.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Appointment Reminder</h1>
          <p>Hello ${client.name},</p>
          <p>This is a friendly reminder about your upcoming appointment:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details</h3>
            <p><strong>Specialist:</strong> ${specialist.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Service:</strong> ${appointment.description}</p>
          </div>
          <p>Please ensure you're ready for your session. Contact the specialist if you have any questions.</p>
          <p>Best regards,<br>The H.I.T.S. Team</p>
        </div>
      `
    })

    if (clientEmailResult.success) {
      results.emails_sent++
    } else {
      results.errors.push('Failed to send client reminder email')
    }

    // Email reminder to specialist
    const specialistEmailResult = await sendEmail({
      to: specialist.email,
      subject: 'Appointment Reminder - Tomorrow - H.I.T.S.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Appointment Reminder</h1>
          <p>Hello ${specialist.name},</p>
          <p>This is a reminder about your upcoming appointment:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details</h3>
            <p><strong>Client:</strong> ${client.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Service:</strong> ${appointment.description}</p>
          </div>
          <p>Please prepare for your session and contact the client if needed.</p>
          <p>Best regards,<br>The H.I.T.S. Team</p>
        </div>
      `
    })

    if (specialistEmailResult.success) {
      results.emails_sent++
    } else {
      results.errors.push('Failed to send specialist reminder email')
    }

    // SMS reminder to client if phone available
    if (client.phone) {
      const smsResult = await sendSMS({
        to: client.phone,
        body: `H.I.T.S. Reminder: Your appointment with ${specialist.name} is tomorrow (${formattedDate}) at ${appointment.start_time}.`
      })

      if (smsResult.success) {
        results.sms_sent++
      } else {
        results.errors.push('Failed to send client reminder SMS')
      }
    }

  } catch (error) {
    results.errors.push(`Reminder notification error: ${error}`)
  }
}

// Handle cancellation notifications
async function handleCancellationNotifications(
  client: any,
  specialist: any,
  appointment: any,
  formattedDate: string,
  formattedTime: string,
  customMessage: string,
  results: any
) {
  try {
    const cancellationReason = customMessage || 'The appointment has been cancelled.'

    // Email to client
    const clientEmailResult = await sendEmail({
      to: client.email,
      subject: 'Appointment Cancelled - H.I.T.S.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Appointment Cancelled</h1>
          <p>Hello ${client.name},</p>
          <p>We're sorry to inform you that your appointment has been cancelled:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Cancelled Appointment Details</h3>
            <p><strong>Specialist:</strong> ${specialist.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Service:</strong> ${appointment.description}</p>
            <p><strong>Reason:</strong> ${cancellationReason}</p>
          </div>
          <p>If you need to reschedule, please book a new appointment through your dashboard.</p>
          <p>Best regards,<br>The H.I.T.S. Team</p>
        </div>
      `
    })

    if (clientEmailResult.success) {
      results.emails_sent++
    } else {
      results.errors.push('Failed to send client cancellation email')
    }

    // Email to specialist
    const specialistEmailResult = await sendEmail({
      to: specialist.email,
      subject: 'Appointment Cancelled - H.I.T.S.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Appointment Cancelled</h1>
          <p>Hello ${specialist.name},</p>
          <p>The following appointment has been cancelled:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Cancelled Appointment Details</h3>
            <p><strong>Client:</strong> ${client.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Service:</strong> ${appointment.description}</p>
            <p><strong>Reason:</strong> ${cancellationReason}</p>
          </div>
          <p>Best regards,<br>The H.I.T.S. Team</p>
        </div>
      `
    })

    if (specialistEmailResult.success) {
      results.emails_sent++
    } else {
      results.errors.push('Failed to send specialist cancellation email')
    }

    // SMS to client if phone available
    if (client.phone) {
      const smsResult = await sendSMS({
        to: client.phone,
        body: `H.I.T.S. Appointment Cancelled: Your appointment with ${specialist.name} on ${formattedDate} has been cancelled. Reason: ${cancellationReason}`
      })

      if (smsResult.success) {
        results.sms_sent++
      } else {
        results.errors.push('Failed to send client cancellation SMS')
      }
    }

  } catch (error) {
    results.errors.push(`Cancellation notification error: ${error}`)
  }
}

// Handle reschedule notifications
async function handleRescheduleNotifications(
  client: any,
  specialist: any,
  appointment: any,
  formattedDate: string,
  formattedTime: string,
  customMessage: string,
  results: any
) {
  try {
    const rescheduleInfo = customMessage || 'The appointment has been rescheduled.'

    // Email to client
    const clientEmailResult = await sendEmail({
      to: client.email,
      subject: 'Appointment Rescheduled - H.I.T.S.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Appointment Rescheduled</h1>
          <p>Hello ${client.name},</p>
          <p>Your appointment has been rescheduled:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>New Appointment Details</h3>
            <p><strong>Specialist:</strong> ${specialist.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Service:</strong> ${appointment.description}</p>
            <p><strong>Changes:</strong> ${rescheduleInfo}</p>
          </div>
          <p>Please update your calendar with the new appointment time.</p>
          <p>Best regards,<br>The H.I.T.S. Team</p>
        </div>
      `
    })

    if (clientEmailResult.success) {
      results.emails_sent++
    } else {
      results.errors.push('Failed to send client reschedule email')
    }

    // Email to specialist
    const specialistEmailResult = await sendEmail({
      to: specialist.email,
      subject: 'Appointment Rescheduled - H.I.T.S.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Appointment Rescheduled</h1>
          <p>Hello ${specialist.name},</p>
          <p>The following appointment has been rescheduled:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>New Appointment Details</h3>
            <p><strong>Client:</strong> ${client.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Service:</strong> ${appointment.description}</p>
            <p><strong>Changes:</strong> ${rescheduleInfo}</p>
          </div>
          <p>Please update your schedule accordingly.</p>
          <p>Best regards,<br>The H.I.T.S. Team</p>
        </div>
      `
    })

    if (specialistEmailResult.success) {
      results.emails_sent++
    } else {
      results.errors.push('Failed to send specialist reschedule email')
    }

    // SMS to client if phone available
    if (client.phone) {
      const smsResult = await sendSMS({
        to: client.phone,
        body: `H.I.T.S. Appointment Rescheduled: Your appointment with ${specialist.name} is now on ${formattedDate} at ${appointment.start_time}. ${rescheduleInfo}`
      })

      if (smsResult.success) {
        results.sms_sent++
      } else {
        results.errors.push('Failed to send client reschedule SMS')
      }
    }

  } catch (error) {
    results.errors.push(`Reschedule notification error: ${error}`)
  }
}

// Handle dispute resolution notifications
async function handleDisputeResolutionNotifications(
  client: any,
  specialist: any,
  appointment: any,
  formattedDate: string,
  formattedTime: string,
  customMessage: string,
  results: any
) {
  try {
    // Email to client
    const clientEmailResult = await sendEmail({
      to: client.email,
      subject: 'Dispute Resolved - H.I.T.S.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Dispute Resolved</h1>
          <p>Hello ${client.name},</p>
          <p>Your dispute regarding the following appointment has been resolved:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details</h3>
            <p><strong>Specialist:</strong> ${specialist.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Service:</strong> ${appointment.description}</p>
          </div>
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Resolution</h3>
            <p>${customMessage}</p>
          </div>
          <p>If you have any further questions, please contact our support team.</p>
          <p>Best regards,<br>The H.I.T.S. Team</p>
        </div>
      `
    })

    if (clientEmailResult.success) {
      results.emails_sent++
    } else {
      results.errors.push('Failed to send client dispute resolution email')
    }

    // Email to specialist
    const specialistEmailResult = await sendEmail({
      to: specialist.email,
      subject: 'Dispute Resolved - H.I.T.S.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Dispute Resolved</h1>
          <p>Hello ${specialist.name},</p>
          <p>A dispute regarding the following appointment has been resolved:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Appointment Details</h3>
            <p><strong>Client:</strong> ${client.name}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${formattedTime}</p>
            <p><strong>Service:</strong> ${appointment.description}</p>
          </div>
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Resolution</h3>
            <p>${customMessage}</p>
          </div>
          <p>Best regards,<br>The H.I.T.S. Team</p>
        </div>
      `
    })

    if (specialistEmailResult.success) {
      results.emails_sent++
    } else {
      results.errors.push('Failed to send specialist dispute resolution email')
    }

    // SMS to client if phone available
    if (client.phone) {
      const smsResult = await sendSMS({
        to: client.phone,
        body: `H.I.T.S. Dispute Resolved: Your dispute regarding the appointment with ${specialist.name} has been resolved. ${customMessage}`
      })

      if (smsResult.success) {
        results.sms_sent++
      } else {
        results.errors.push('Failed to send client dispute resolution SMS')
      }
    }

  } catch (error) {
    results.errors.push(`Dispute resolution notification error: ${error}`)
  }
}
