import Link from 'next/link'
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { brand } from '@/lib/config/brand'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function ApartarErrorPage({ params }: Props) {
  const { slug } = await params

  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="size-8 text-destructive" />
        </div>

        <div>
          <h1 className="font-heading text-2xl font-bold">Pago no completado</h1>
          <p className="mt-2 text-muted-foreground">
            Tu pago no pudo procesarse. La moto sigue disponible — puedes intentarlo de nuevo o contactarnos para ayudarte.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button asChild size="lg" className="w-full rounded-2xl font-bold h-13">
            <Link href={`/apartar/${slug}`}>
              <ArrowLeft className="size-4" />
              Intentar de nuevo
            </Link>
          </Button>
          {brand.whatsappHref(brand.mensajes.catalogoGeneral) && (
            <Button asChild variant="outline" size="lg" className="w-full rounded-2xl h-13">
              <a
                href={brand.whatsappHref('Hola, quería apartar una moto pero tuve un problema con el pago. ¿Pueden ayudarme?') ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" />
                Contactar por WhatsApp
              </a>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/catalogo">Ver más motos</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
