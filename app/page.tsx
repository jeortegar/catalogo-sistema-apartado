import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getMotosCatalogo } from '@/lib/payload/motos'
import { getSiteConfig } from '@/lib/payload/siteConfig'
import { MotoCard } from '@/components/catalogo/moto-card'
import { Button } from '@/components/ui/button'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Tachos Biker — Motos de importación en México',
  description:
    'Catálogo de motos importadas. Sport, naked, scooter y custom. Aparta tu moto en línea hoy mismo.',
}

export default async function HomePage() {
  const [motos, siteConfig] = await Promise.all([getMotosCatalogo(), getSiteConfig()])
  const destacadas = motos.slice(0, 12)

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        aria-label="Portada Tachos Biker"
        className="relative flex min-h-dvh -mt-14 sm:-mt-16 items-end overflow-hidden"
      >
        {siteConfig.heroUrl && (
          <Image
            src={siteConfig.heroUrl}
            alt={siteConfig.heroAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            {...(siteConfig.heroWidth && siteConfig.heroHeight
              ? { width: undefined, height: undefined }
              : {})}
          />
        )}

        {/* Overlay: transparente arriba, oscuro abajo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-transparent from-30% via-[oklch(0.145_0.004_65/0.35)] to-[oklch(0.145_0.004_65/0.78)]"
        />

        {/* Contenido anclado al margen inferior */}
        <div className="relative z-10 w-full mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-18 lg:px-8 lg:pb-24">
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

      {/* ── LAS MOTOS MÁS BUSCADAS ───────────────────────────── */}
      {destacadas.length > 0 && (
        <section
          aria-labelledby="destacadas-heading"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <h2
            id="destacadas-heading"
            className="font-heading text-3xl font-bold leading-tight text-foreground mb-10 sm:text-[2.25rem]"
          >
            Las motos más buscadas
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {destacadas.map((moto) => (
              <MotoCard key={moto.id} moto={moto} />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/catalogo"
              // className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-10 text-sm font-semibold tracking-wide text-primary-foreground transition-all duration-150 ease-out hover:bg-[oklch(0.42_0.14_45)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              // className="w-full rounded-2xl text-base font-bold h-14 text-white"
            >
            <Button
              type="button"
              size="lg"
              className="w-full rounded-2xl text-base font-medium h-14 text-white"
              >

              Ver catálogo
      </Button>
            </Link>
          </div>
        </section>
      )}
    </>
  )
}
