'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Moto } from '@/lib/types/moto'
import { cn } from '@/lib/utils'

const BADGE: Record<'disponible' | 'apartada', { label: string; className: string }> = {
  disponible: {
    label: 'Disponible',
    className: 'bg-[oklch(0.65_0.17_145/0.15)] text-[oklch(0.50_0.15_145)]',
  },
  apartada: {
    label: 'Apartada',
    className: 'bg-[oklch(0.73_0.17_65/0.15)] text-[oklch(0.42_0.14_45)]',
  },
}

export function MotoCard({ moto }: { moto: Moto }) {
  const [imgError, setImgError] = useState(false)

  const badge = BADGE[moto.estado as 'disponible' | 'apartada']
  const precio = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(moto.precio)

  const imagenPrincipal = moto.galeria[0]

  return (
    <Link
      href={`/catalogo/${moto.slug}`}
      className="group flex flex-col rounded-[18px] bg-card overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {/* Imagen 4:3 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {!imgError && imagenPrincipal ? (
          <Image
            src={imagenPrincipal.url}
            alt={imagenPrincipal.alt ?? moto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            onError={() => setImgError(true)}
          />
        ) : (
          <Image
            src="/moto-placeholder.svg"
            alt={moto.nombre}
            fill
            className="object-contain p-8 opacity-40"
          />
        )}
        {badge && (
          <span
            className={cn(
              'absolute top-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium leading-snug',
              badge.className,
            )}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-4">
        <p className="font-heading text-[0.95rem] font-semibold leading-snug line-clamp-2 text-foreground">
          {moto.nombre}
        </p>
        <p className="font-heading text-[0.9rem] font-bold tabular-nums leading-snug text-primary">
          {precio}
        </p>
      </div>
    </Link>
  )
}
