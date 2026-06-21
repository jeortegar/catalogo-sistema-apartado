'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { Moto } from '@/lib/types/moto'

const BADGE: Record<'disponible' | 'apartada', string> = {
  disponible: 'DISPONIBLE',
  apartada: 'APARTADA',
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
      className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-zinc-100 overflow-hidden">
        {!imgError && imagenPrincipal ? (
          <Image
            src={imagenPrincipal.url}
            alt={imagenPrincipal.alt ?? moto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <Image
            src="/moto-placeholder.svg"
            alt={moto.nombre}
            fill
            className="object-contain p-8 opacity-50"
          />
        )}
        {badge && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-2 py-0.5">
            {badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 pt-2 pb-1">
        <p className="text-sm text-foreground leading-snug line-clamp-2">
          {moto.nombre}
        </p>
        <p className="text-sm font-bold text-foreground tabular-nums">
          {precio}
        </p>
      </div>
    </Link>
  )
}
