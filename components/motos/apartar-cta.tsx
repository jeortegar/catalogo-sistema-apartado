import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import type { EstadoMoto } from '@/lib/types/moto'

interface ApartarCtaProps {
  estado: EstadoMoto
  slug: string
  monto: number
}

export function ApartarCta({ estado, slug, monto }: ApartarCtaProps) {
  if (estado === 'vendida') return null

  if (estado === 'apartada') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800/40 dark:bg-amber-950/20">
        <Lock className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
            Esta moto ya fue apartada
          </p>
          <p className="text-amber-700/70 dark:text-amber-400/70 text-xs mt-0.5">
            Contáctanos por WhatsApp para ver otras opciones.
          </p>
        </div>
      </div>
    )
  }

  const montoFormateado = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(monto)

  // estado === 'disponible'
  return (
    <Button
      asChild
      size="lg"
      className="w-full rounded-2xl text-base font-bold h-14"
    >
      <Link href={`/apartar/${slug}`}>
        Apartar esta moto: {montoFormateado}
      </Link>
    </Button>
  )
}
