import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getMotoBySlug, getMotoSlugs } from '@/lib/payload/motos'
import { getConfiguracionApartado } from '@/lib/payload/apartados'
import { MotoGallery } from '@/components/motos/moto-gallery'
import { MotoSpecs } from '@/components/motos/moto-specs'
import { ApartarCta } from '@/components/motos/apartar-cta'
import { WhatsAppFab } from '@/components/catalogo/whatsapp-fab'

export const revalidate = 60

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    return await getMotoSlugs()
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const moto = await getMotoBySlug(slug)
  if (!moto) return {}

  const precio = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(moto.precio)

  const parts = [
    moto.especificaciones?.cilindraje
      ? `${moto.especificaciones.cilindraje} cc`
      : null,
    moto.especificaciones?.tipo,
    precio,
  ].filter(Boolean)

  const description = `${moto.nombre}${parts.length ? ` — ${parts.join(', ')}` : ''}. Disponible en Tachos Biker.`
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tachosbiker.com'
  const url = `${BASE_URL}/catalogo/${slug}`

  const ogImages = moto.galeria.length
    ? [{ url: moto.galeria[0].url, alt: moto.galeria[0].alt ?? moto.nombre }]
    : []

  return {
    title: `${moto.nombre} | Tachos Biker`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${moto.nombre} | Tachos Biker`,
      description,
      url,
      siteName: 'Tachos Biker',
      locale: 'es_MX',
      type: 'website',
      images: ogImages,
    },
  }
}

export default async function MotoDetailPage({ params }: Props) {
  const { slug } = await params

  const [moto, config] = await Promise.all([
    getMotoBySlug(slug),
    getConfiguracionApartado().catch(() => null),
  ])

  if (!moto) notFound()

  const montoApartado = config?.montoApartado ?? 1000

  const precio = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(moto.precio)

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Galería */}
        <MotoGallery galeria={moto.galeria} nombre={moto.nombre} />

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl">
              {moto.nombre}
            </h1>
            <p className="mt-2 font-heading text-2xl font-bold text-primary tabular-nums">{precio}</p>
          </div>

          <ApartarCta estado={moto.estado} slug={moto.slug} monto={montoApartado} />

          <MotoSpecs especificaciones={moto.especificaciones} />
        </div>
      </div>

      <WhatsAppFab motoNombre={moto.nombre} />
    </main>
  )
}
