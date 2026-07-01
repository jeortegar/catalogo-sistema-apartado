import Link from 'next/link'
import Image from 'next/image'

interface SiteHeaderProps {
  logoUrl: string | null
  logoAlt: string
}

export function SiteHeader({ logoUrl, logoAlt }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#333] bg-[#1d1d1d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-11 items-center justify-center sm:h-12">
          <Link
            href="/"
            aria-label="Ir al inicio"
            className=""
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            ) : (
              <span className="font-heading font-bold text-sm tracking-tight">
                Tachos Biker
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
