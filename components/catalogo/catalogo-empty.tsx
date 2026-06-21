'use client'

import { MessageCircle, SearchX, Bike } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CatalogoEmptyProps {
  /** Si se pasa, muestra variante "sin resultados de filtro" con botón de reset */
  onReset?: () => void
}

export function CatalogoEmpty({ onReset }: CatalogoEmptyProps) {
  if (onReset) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <SearchX className="size-14 text-muted-foreground/40 mb-4" />
        <p className="text-lg font-medium text-foreground">
          No hay motos con estos filtros
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Intenta con otros criterios de búsqueda.
        </p>
        <Button variant="outline" className="mt-5" onClick={onReset}>
          Limpiar filtros
        </Button>
      </div>
    )
  }

  const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
  const mensaje = encodeURIComponent(
    'Hola! Me interesa saber cuándo tendrán motos disponibles en el catálogo.',
  )

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <Bike className="size-16 text-muted-foreground/30 mb-4" />
      <h2 className="text-2xl font-heading font-bold">
        Pronto habrá motos disponibles
      </h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
        Estamos preparando el catálogo. ¿Quieres que te avisemos cuando lleguen?
      </p>
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}?text=${mensaje}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-white text-sm font-semibold transition-opacity hover:opacity-90"
        >
          <MessageCircle className="size-4" />
          Consultar disponibilidad
        </a>
      )}
    </div>
  )
}
