'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ImagenMoto } from '@/lib/types/moto'

interface MotoGalleryProps {
  galeria: ImagenMoto[]
  nombre: string
}

export function MotoGallery({ galeria, nombre }: MotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({})

  const activeImage = galeria[activeIndex]
  const hasError = imgErrors[activeIndex]

  return (
    <div className="flex flex-col gap-3">
      {/* Imagen principal */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
        {activeImage && !hasError ? (
          <Image
            src={activeImage.url}
            alt={activeImage.alt ?? nombre}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
            onError={() =>
              setImgErrors((prev) => ({ ...prev, [activeIndex]: true }))
            }
          />
        ) : (
          <Image
            src="/moto-placeholder.svg"
            alt={nombre}
            fill
            className="object-contain p-10 opacity-50"
          />
        )}
      </div>

      {/* Thumbnails (solo si hay más de 1) */}
      {galeria.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {galeria.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={img.alt ?? `${nombre}, foto ${index + 1}`}
              aria-pressed={index === activeIndex}
              className={cn(
                'relative shrink-0 h-16 w-20 overflow-hidden rounded-lg border-2 transition-all',
                index === activeIndex
                  ? 'border-primary'
                  : 'border-border opacity-60 hover:opacity-100',
              )}
            >
              {!imgErrors[index] ? (
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={() =>
                    setImgErrors((prev) => ({ ...prev, [index]: true }))
                  }
                />
              ) : (
                <Image
                  src="/moto-placeholder.svg"
                  alt=""
                  fill
                  className="object-contain p-2 opacity-50"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
