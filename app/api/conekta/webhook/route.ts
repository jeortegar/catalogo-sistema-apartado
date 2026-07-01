import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/conekta/webhook'
import { getConektaOrder } from '@/lib/conekta/client'
import { confirmarApartado } from '@/lib/apartado/confirm'

// Disable body parsing — we need the raw body for HMAC verification
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest): Promise<NextResponse> {
  let rawBody: Buffer
  try {
    const arrayBuffer = await req.arrayBuffer()
    rawBody = Buffer.from(arrayBuffer)
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Verify HMAC signature
  const signature = req.headers.get('Conekta-Signature') ?? ''
  try {
    const valid = verifyWebhookSignature(rawBody, signature)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: 'Signature verification error' }, { status: 401 })
  }

  // Parse event
  let event: { type?: string; data?: { object?: { order_id?: string } } }
  try {
    event = JSON.parse(rawBody.toString('utf-8'))
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Only process charge.paid events
  if (event.type !== 'charge.paid') {
    return NextResponse.json({ received: true })
  }

  const orderId = event.data?.object?.order_id
  if (!orderId) {
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
  }

  try {
    // Fetch the Conekta order to read apartado_id from metadata.
    // This is resilient even when referenciaConekta was not saved on the Apartado.
    const order = await getConektaOrder(orderId)
    const apartadoId = order.metadata?.apartado_id
    if (!apartadoId) {
      // Not our order (no metadata.apartado_id) — ignore
      return NextResponse.json({ received: true })
    }

    await confirmarApartado(apartadoId, orderId)
  } catch (err) {
    console.error('[webhook] confirmarApartado error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
