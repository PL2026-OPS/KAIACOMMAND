import { Resend } from 'resend'

// Single shared instance — reused across all calls in the same server process.
export const resend = new Resend(process.env.RESEND_API_KEY)

// Default sender while the production domain isn't verified in Resend.
// Replace with "KAIA <noreply@kaia.sicoben.com>" once the domain is verified.
const FROM = 'KAIA Command <onboarding@resend.dev>'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }

  return data
}
