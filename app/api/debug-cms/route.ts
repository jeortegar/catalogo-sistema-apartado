import { fetchFromCMS } from '@/lib/payload/client'
import { getSiteConfig } from '@/lib/payload/siteConfig'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [raw, resolved] = await Promise.all([
    fetchFromCMS<unknown>('/api/globals/configuracion-sitio', 0),
    getSiteConfig(),
  ])
  return NextResponse.json({ rawConfigSitio: raw, resolvedSiteConfig: resolved })
}
