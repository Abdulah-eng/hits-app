import twilio from 'twilio'

// Only initialize Twilio if credentials are available
const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

export interface SMSOptions {
  to: string
  body: string
}

export const sendSMS = async (options: SMSOptions) => {
  if (!client) {
    console.warn('Twilio credentials not configured. SMS not sent.')
    return { success: true } // Return success to not break the flow
  }

  try {
    const message = await client.messages.create({
      body: options.body,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      to: options.to,
    })

    return { success: true, messageId: message.sid }
  } catch (error) {
    console.error('Twilio error:', error)
    return { success: false, error }
  }
}

export const sendOrderConfirmationSMS = async (phoneNumber: string, orderId: string, serviceTitle: string) => {
  const body = `Your H.I.T.S. order has been confirmed! Order ID: ${orderId}, Service: ${serviceTitle}. You'll receive updates via SMS.`
  
  return sendSMS({
    to: phoneNumber,
    body,
  })
}

export const sendOrderUpdateSMS = async (phoneNumber: string, orderId: string, status: string) => {
  const body = `H.I.T.S. Order Update: Order ${orderId} status changed to ${status}. Check your dashboard for details.`
  
  return sendSMS({
    to: phoneNumber,
    body,
  })
}
