import { fetchFromCMS } from '@/lib/payload/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const raw = await fetchFromCMS<unknown>('/api/globals/configuracion-sitio', 0)
  return NextResponse.json({ rawConfigSitio: raw })
}
