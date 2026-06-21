'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const pathname = usePathname()
  const numero = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')

  const whatsappHref = numero
    ? `https://wa.me/${numero}?text=${encodeURIComponent(
        'Hola! Vi el catálogo de Tachos Biker y me interesa una moto.',
      )}`
    : null

  const onCatalogo = pathname === '/catalogo'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[oklch(0.145_0.004_65)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">

          {/* Wordmark */}
          <Link
            href="/catalogo"
            className="font-heading text-xl font-bold tracking-tight text-[oklch(0.985_0.005_85)] transition-opacity duration-150 hover:opacity-75"
          >
            TACHOS BIKER
          </Link>

          {/* Nav + CTA */}
          <nav className="flex items-center gap-4 sm:gap-6" aria-label="Navegación principal">

            {/* Catálogo link — visible en sm y arriba */}
            <Link
              href="/catalogo"
              aria-current={onCatalogo ? 'page' : undefined}
              className={cn(
                'hidden text-sm font-medium transition-colors duration-150 sm:block',
                onCatalogo
                  ? 'text-[oklch(0.985_0.005_85)] underline decoration-[oklch(0.66_0.19_48)] underline-offset-4 decoration-2'
                  : 'text-[oklch(0.556_0.003_65)] hover:text-[oklch(0.985_0.005_85)]',
              )}
            >
              Catálogo
            </Link>

            {/* WhatsApp CTA */}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-white transition-transform duration-150 hover:scale-[0.97] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 sm:px-4 sm:py-2"
              >
                <MessageCircle className="size-4 shrink-0" />
                <span className="hidden text-sm font-semibold sm:inline">WhatsApp</span>
              </a>
            )}

          </nav>
        </div>
      </div>
    </header>
  )
}
