import { getMotosCatalogo } from '@/lib/payload/motos'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const motos = await getMotosCatalogo()
  return NextResponse.json({
    useMockData: process.env.USE_MOCK_DATA,
    payloadCmsUrl: process.env.PAYLOAD_CMS_URL,
    totalMotos: motos.length,
    primeraGaleria: motos[0]?.galeria ?? [],
  })
}
