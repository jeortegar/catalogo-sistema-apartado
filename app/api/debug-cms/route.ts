import { fetchFromCMS } from '@/lib/payload/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const raw = await fetchFromCMS<{ docs: unknown[] }>('/api/motos?limit=1', 0)
  return NextResponse.json({
    useMockData: process.env.USE_MOCK_DATA,
    payloadCmsUrl: process.env.PAYLOAD_CMS_URL,
    rawPrimeraMoto: raw.docs[0] ?? null,
  })
}
