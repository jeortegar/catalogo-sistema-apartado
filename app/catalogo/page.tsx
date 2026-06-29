import type { Metadata } from 'next'
import { getMotosCatalogo } from '@/lib/payload/motos'
import { CatalogoClientWrapper } from '@/components/catalogo/catalogo-client-wrapper'
import { WhatsAppFab } from '@/components/catalogo/whatsapp-fab'
import { brand } from '@/lib/config/brand'

export const revalidate = 60

const CATALOG_URL = `${brand.sitioUrl}/catalogo`

export const metadata: Metadata = {
  title: `Catálogo de Motos | ${brand.nombre}`,
  description:
    'Explora nuestro catálogo de motos importadas. Sport, naked, scooter y custom — disponibles para apartar hoy.',
  alternates: { canonical: CATALOG_URL },
  openGraph: {
    title: `Catálogo de Motos | ${brand.nombre}`,
    description:
      'Explora nuestro catálogo de motos importadas. Sport, naked, scooter y custom — disponibles para apartar hoy.',
    url: CATALOG_URL,
    siteName: brand.nombre,
    locale: 'es_MX',
    type: 'website',
  },
}

export default async function CatalogoPage() {
  const motos = await getMotosCatalogo()

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl">
          Catálogo de Motos
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {motos.length > 0
            ? `${motos.length} moto${motos.length !== 1 ? 's' : ''} en catálogo`
            : 'Pronto tendremos motos disponibles'}
        </p>
      </header>
      <CatalogoClientWrapper motos={motos} />
      <WhatsAppFab />
    </main>
  )
}
