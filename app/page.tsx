import Image from 'next/image'
import type { Metadata } from 'next'
import { getMotosCatalogo } from '@/lib/payload/motos'
import { getSiteConfig } from '@/lib/payload/siteConfig'
import { CatalogoClientWrapper } from '@/components/catalogo/catalogo-client-wrapper'
import { WhatsAppFab } from '@/components/catalogo/whatsapp-fab'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Grupo Velmot — Motos de importación en México',
  description:
    'Catálogo de motos importadas. Sport, naked, scooter y custom. Aparta tu moto en línea hoy mismo.',
}

export default async function HomePage() {
  const [motos, siteConfig] = await Promise.all([getMotosCatalogo(), getSiteConfig()])

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        aria-label="Portada Grupo Velmot"
        className="relative flex min-h-[50dvh] -mt-11 sm:-mt-12 items-end overflow-hidden"
      >
        {siteConfig.heroUrl && (
          <Image
            src={siteConfig.heroUrl}
            alt={siteConfig.heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-transparent from-30% via-[oklch(0.145_0.004_65/0.35)] to-[oklch(0.145_0.004_65/0.78)]"
        />

        <div className="relative z-10 w-full mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
          <h1
            className="font-heading font-bold text-white tracking-tight"
            style={{
              fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
            }}
          >
            {process.env.NEXT_PUBLIC_SITE_NAME}
          </h1>
          <p className="mt-3 text-white/75 text-base sm:text-lg max-w-sm leading-relaxed">
            {siteConfig.subtituloHero}
          </p>
        </div>
      </section>

      {/* ── CATÁLOGO ─────────────────────────────────────────── */}
      <section
        aria-label="Catálogo de motos"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
      >
        <CatalogoClientWrapper motos={motos} />
      </section>

      <WhatsAppFab />
    </main>
  )
}
