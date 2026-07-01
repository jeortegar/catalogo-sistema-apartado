'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { iniciarApartado } from '@/lib/apartado/actions'
import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApartarFormProps {
  moto: { id: string; nombre: string; slug: string }
  monto: number
}

const montoFormateado = (monto: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(monto)

export function ApartarForm({ moto, monto }: ApartarFormProps) {
  const [state, formAction, isPending] = useActionState(iniciarApartado, null)

  useEffect(() => {
    if (state?.success && state.checkoutUrl) {
      window.location.href = state.checkoutUrl
    }
  }, [state])

  const errorMessage = state && !state.success ? state.message : null
  const isRedirecting = state?.success === true

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="motoSlug" value={moto.slug} />

      {/* Resumen */}
      <div className="rounded-2xl border border-border bg-muted/40 px-5 py-4">
        <p className="text-sm text-muted-foreground">Moto a apartar</p>
        <p className="mt-0.5 font-semibold">{moto.nombre}</p>
        <p className="mt-1 font-heading text-xl font-bold text-primary">
          Apartado: {montoFormateado(monto)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Este monto se descuenta del precio final al comprar la moto.
        </p>
      </div>

      {/* Campos */}
      <div className="flex flex-col gap-4">
        <Field
          id="nombreCliente"
          name="nombreCliente"
          label="Nombre completo"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          placeholder="Tu nombre"
          disabled={isPending || isRedirecting}
        />
        <Field
          id="telefonoCliente"
          name="telefonoCliente"
          label="Teléfono (10 dígitos)"
          type="tel"
          autoComplete="tel"
          required
          pattern="[0-9]{10}"
          placeholder="5512345678"
          inputMode="numeric"
          disabled={isPending || isRedirecting}
        />
        <Field
          id="emailCliente"
          name="emailCliente"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@correo.com"
          disabled={isPending || isRedirecting}
        />
      </div>

      {/* Aviso de privacidad */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="aceptoPrivacidad"
          className="mt-0.5 size-4 shrink-0 accent-primary"
          required
          disabled={isPending || isRedirecting}
        />
        <span className="text-sm text-muted-foreground leading-snug">
          He leído y acepto el{' '}
          <a href="/aviso-de-privacidad" target="_blank" className="underline underline-offset-2 hover:text-foreground transition-colors">
            aviso de privacidad
          </a>
          {' '}y autorizo el tratamiento de mis datos personales conforme a la LFPDPPP.
        </span>
      </label>

      {/* Error */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full rounded-2xl text-base font-bold h-14 text-white"
        disabled={isPending || isRedirecting}
      >
        {(isPending || isRedirecting) ? (
          <span className="flex items-center gap-2">
            <Loader2 className="size-5 animate-spin" />
            {isRedirecting ? 'Redirigiendo a pago…' : 'Procesando…'}
          </span>
        ) : (
          `Pagar apartado · ${montoFormateado(monto)}`
        )}
      </Button>
    </form>
  )
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
}

function Field({ id, label, className, ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        className={cn(
          'rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      />
    </div>
  )
}
