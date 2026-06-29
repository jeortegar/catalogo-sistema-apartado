'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface SiteHeaderProps {
  logoUrl: string | null
  logoAlt: string
}

export function SiteHeader({ logoUrl, logoAlt }: SiteHeaderProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  const onHome = pathname === '/'
  const transparent = onHome && !scrolled

  useEffect(() => {
    if (!onHome) { setScrolled(false); return }
    const check = () => setScrolled(window.scrollY > 48)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [onHome])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        transparent
          ? 'border-b border-white/10 bg-transparent'
          : 'border-b border-border bg-background/95 backdrop-blur-sm',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center sm:h-16">

          {/* Logo */}
          <Link href="/" className="transition-opacity duration-150 hover:opacity-75">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                priority
              />
            )}
          </Link>

        </div>
      </div>
    </header>
  )
}
