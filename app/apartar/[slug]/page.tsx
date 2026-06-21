import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getMotoBySlug } from '@/lib/payload/motos'
import { getConfiguracionApartado } from '@/lib/payload/apartados'
import { ApartarForm } from '@/components/motos/apartar-form'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ApartarPage({ params }: Props) {
  const { slug } = await params

  const [moto, config] = await Promise.all([
    getMotoBySlug(slug).catch(() => null),
    getConfiguracionApartado().catch(() => null),
  ])

  if (!moto) notFound()

  // Only available motos can be reserved
  if (moto.estado !== 'disponible') {
    redirect(`/catalogo/${slug}`)
  }

  // If config fetch fails or monto is invalid, bail out
  if (!config || config.montoApartado < 1) {
    redirect(`/catalogo/${slug}`)
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Link
        href={`/catalogo/${slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Volver a la ficha
      </Link>

      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl">
          Apartar moto
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Completa tus datos para reservar esta moto. Serás redirigido a la página de pago de Conekta.
        </p>
      </div>

      <ApartarForm
        moto={{ id: moto.id, nombre: moto.nombre, slug: moto.slug }}
        monto={config.montoApartado}
      />
    </main>
  )
}
