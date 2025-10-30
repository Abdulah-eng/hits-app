import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { sendEmail } from '@/lib/sendgrid'
import { sendSMS } from '@/lib/twilio'
import Stripe from 'stripe'

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

// POST /api/stripe/webhook - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      if (!stripe) {
        return NextResponse.json(
          { error: 'Stripe not configured' },
          { status: 500 }
        )
      }

      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseClient()

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      const appointmentId = session.metadata?.appointment_id
      const paymentId = session.metadata?.payment_id
      const clientId = session.metadata?.client_id
      const specialistId = session.metadata?.specialist_id

      if (!appointmentId || !paymentId) {
        console.error('Missing metadata in checkout session:', session.metadata)
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        )
      }

      // Update payment status to paid
      const { error: paymentUpdateError } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)

      if (paymentUpdateError) {
        console.error('Failed to update payment status:', paymentUpdateError)
        return NextResponse.json(
          { error: 'Failed to update payment status' },
          { status: 500 }
        )
      }

      // Update appointment status to confirmed
      const { error: appointmentUpdateError } = await supabase
        .from('appointments')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      if (appointmentUpdateError) {
        console.error('Failed to update appointment status:', appointmentUpdateError)
        return NextResponse.json(
          { error: 'Failed to update appointment status' },
          { status: 500 }
        )
      }

      // Get appointment details for notifications
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          start_time,
          end_time,
          total_cost,
          description,
          users!appointments_client_id_fkey(name, email),
          specialists(
            users(name, email)
          )
        `)
        .eq('id', appointmentId)
        .single()

      if (appointmentError) {
        console.error('Failed to fetch appointment details:', appointmentError)
        // Don't fail the webhook if we can't send notifications
       } else {
         // Send confirmation notifications using the notification API
         try {
           const notificationResponse = await fetch(`${request.nextUrl.origin}/api/notifications/appointment`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({
               appointment_id: appointmentId,
               notification_type: 'confirmation'
             }),
           })

           if (!notificationResponse.ok) {
             console.error('Failed to send confirmation notifications')
           }
         } catch (notificationError) {
           console.error('Error sending confirmation notifications:', notificationError)
         }
       }

      console.log('Payment processed successfully for appointment:', appointmentId)
    }

    // Handle failed payment
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session
      
      const appointmentId = session.metadata?.appointment_id
      const paymentId = session.metadata?.payment_id

      if (appointmentId && paymentId) {
        // Update payment status to failed
        await supabase
          .from('payments')
          .update({
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId)

        // Keep appointment as pending (not cancelled) in case user wants to retry
        console.log('Payment session expired for appointment:', appointmentId)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
