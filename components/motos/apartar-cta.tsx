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
      <div className="flex items-center gap-3 rounded-2xl px-5 py-4 border border-[oklch(0.86_0.10_65)] bg-[oklch(0.96_0.04_70)] dark:border-[oklch(0.42_0.14_45/0.40)] dark:bg-[oklch(0.18_0.04_48/0.20)]">
        <Lock className="size-5 shrink-0 text-[oklch(0.50_0.16_48)] dark:text-[oklch(0.73_0.17_65)]" />
        <div>
          <p className="font-semibold text-sm text-[oklch(0.32_0.10_48)] dark:text-[oklch(0.82_0.10_65)]">
            Esta moto ya fue apartada
          </p>
          <p className="text-xs mt-0.5 text-[oklch(0.44_0.10_48/0.70)] dark:text-[oklch(0.73_0.17_65/0.70)]">
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
      className="w-full rounded-2xl text-base font-bold h-14 text-white"
    >
      <Link href={`/apartar/${slug}`}>
        Apartar esta moto: {montoFormateado}
      </Link>
    </Button>
  )
}
