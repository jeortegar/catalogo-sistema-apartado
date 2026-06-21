import crypto from 'crypto'

export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  const secret = process.env.CONEKTA_WEBHOOK_SECRET
  if (!secret) throw new Error('CONEKTA_WEBHOOK_SECRET is not set')

  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex'),
    )
  } catch {
    return false
  }
}
