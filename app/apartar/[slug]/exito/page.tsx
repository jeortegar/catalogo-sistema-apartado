import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { confirmarApartado } from '@/lib/apartado/confirm'
import { getApartadoById } from '@/lib/payload/apartados'
import { brand } from '@/lib/config/brand'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ apartado_id?: string; order_id?: string }>
}

export default async function ApartarExitoPage({ params, searchParams }: Props) {
  const [{ slug }, { apartado_id, order_id }] = await Promise.all([params, searchParams])

  if (!apartado_id) redirect(`/apartar/${slug}/error`)

  // Try to confirm (idempotent — safe to call multiple times)
  let confirmed = false
  let nombreCliente = ''
  let motoNombre = ''
  let montoCobrado = 0

  try {
    const result = await confirmarApartado(apartado_id, order_id)
    confirmed = result.ok
  } catch {
    // confirmarApartado throws when referenciaConekta is not yet saved.
    // Wait briefly for the Conekta webhook to arrive and set it, then retry once.
    await new Promise((r) => setTimeout(r, 1500))
    try {
      const result = await confirmarApartado(apartado_id, order_id)
      confirmed = result.ok
    } catch {
      // Fall through — estadoPago check below catches webhook-confirmed payments
    }
  }

  // Load apartado details for display (regardless of confirmarApartado result)
  const apartado = await getApartadoById(apartado_id)

  if (!apartado) redirect(`/apartar/${slug}/error`)

  nombreCliente = apartado.nombreCliente
  montoCobrado = apartado.montoCobrado
  motoNombre = typeof apartado.moto !== 'string' ? apartado.moto.nombre : slug

  // If payment still not confirmed (neither by webhook nor redirect), send to error
  const estadoPago = apartado.estadoPago
  if (!confirmed && estadoPago !== 'completado') {
    redirect(`/apartar/${slug}/error`)
  }

  const montoFormateado = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(montoCobrado)

  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
          <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
        </div>

        <div>
          <h1 className="font-heading text-2xl font-bold">¡Moto apartada!</h1>
          <p className="mt-2 text-muted-foreground">
            Tu apartado fue confirmado exitosamente.
          </p>
        </div>

        {/* Resumen */}
        <div className="w-full rounded-2xl border border-border bg-muted/40 px-5 py-5 text-left">
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Moto</dt>
              <dd className="font-semibold text-right">{motoNombre}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Cliente</dt>
              <dd className="font-semibold text-right">{nombreCliente}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="text-muted-foreground">Monto pagado</dt>
              <dd className="font-bold text-primary text-base text-right">{montoFormateado}</dd>
            </div>
          </dl>
        </div>

        <p className="text-sm text-muted-foreground">
          Te contactaremos en breve para coordinar la entrega. También puedes escribirnos por WhatsApp.
        </p>

        <div className="flex w-full flex-col gap-3">
          <Button asChild size="lg" className="w-full rounded-2xl font-bold h-13">
            <a
              href={brand.whatsappHref(brand.mensajes.exitoApartado(motoNombre)) ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" />
              Contactar por WhatsApp
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full rounded-2xl h-13">
            <Link href="/catalogo">Ver más motos</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
