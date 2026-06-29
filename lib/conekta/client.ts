const CONEKTA_API_URL = 'https://api.conekta.io'
const CONEKTA_API_VERSION = '2.1.0'

function getHeaders(): HeadersInit {
  const apiKey = process.env.CONEKTA_API_KEY
  if (!apiKey) throw new Error('CONEKTA_API_KEY is not set')

  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Accept: `application/vnd.conekta-v${CONEKTA_API_VERSION}+json`,
    'Accept-Language': 'es',
  }
}

interface ConektaCustomerInfo {
  name: string
  email: string
  phone: string
}

interface CreateCheckoutOrderParams {
  motoNombre: string
  monto: number
  clienteInfo: ConektaCustomerInfo
  successUrl: string
  failureUrl: string
  metadata: Record<string, string>
}

interface ConektaOrderResponse {
  id: string
  payment_status: string
  checkout?: {
    id: string
    url: string
    type: string
  }
}

export async function createCheckoutOrder(params: CreateCheckoutOrderParams): Promise<{ orderId: string; checkoutUrl: string }> {
  const { motoNombre, monto, clienteInfo, successUrl, failureUrl, metadata } = params

  const body = {
    currency: 'MXN',
    customer_info: {
      name: clienteInfo.name,
      email: clienteInfo.email,
      phone: clienteInfo.phone,
    },
    line_items: [
      {
        name: `Apartado de moto: ${motoNombre}`,
        unit_price: Math.round(monto * 100), // centavos
        quantity: 1,
      },
    ],
    checkout: {
      type: 'HostedPayment',
      success_url: successUrl,
      failure_url: failureUrl,
      allowed_payment_methods: ['card', 'bank_transfer'],
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    },
    metadata,
  }

  const res = await fetch(`${CONEKTA_API_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Conekta order creation failed (${res.status}): ${text}`)
  }

  const order = (await res.json()) as ConektaOrderResponse
  const checkoutUrl = order.checkout?.url

  if (!checkoutUrl) {
    throw new Error('Conekta response missing checkout.url')
  }

  return { orderId: order.id, checkoutUrl }
}

export async function getConektaOrder(orderId: string): Promise<ConektaOrderResponse> {
  const res = await fetch(`${CONEKTA_API_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: getHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Conekta get order failed (${res.status}): ${text}`)
  }

  return res.json() as Promise<ConektaOrderResponse>
}
