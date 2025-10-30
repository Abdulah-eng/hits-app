import sgMail from '@sendgrid/mail'

// Only initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async (options: EmailOptions) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured. Email not sent.')
    return { success: true } // Return success to not break the flow
  }

  try {
    const msg = {
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@hits-app.com',
      subject: options.subject,
      text: options.text,
      html: options.html,
    }

    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('SendGrid error:', error)
    return { success: false, error }
  }
}

export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome to H.I.T.S.!</h1>
      <p>Hi ${name},</p>
      <p>Welcome to H.I.T.S. (Hire I.T. Specialists)! We're excited to have you on board.</p>
      <p>You can now start hiring IT specialists or offer your services to clients.</p>
      <p>Best regards,<br>The H.I.T.S. Team</p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: 'Welcome to H.I.T.S.!',
    html,
  })
}

export const sendOrderConfirmationEmail = async (email: string, orderId: string, serviceTitle: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Order Confirmation</h1>
      <p>Your order has been confirmed!</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Service:</strong> ${serviceTitle}</p>
      <p>You will receive updates about your order status via email.</p>
      <p>Best regards,<br>The H.I.T.S. Team</p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: 'Order Confirmation - H.I.T.S.',
    html,
  })
}
