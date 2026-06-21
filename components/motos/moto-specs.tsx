import type { EspecificacionesMoto } from '@/lib/types/moto'

const TIPO_LABEL: Record<string, string> = {
  scooter: 'Scooter',
  sport: 'Sport',
  naked: 'Naked',
  custom: 'Custom',
}

interface MotoSpecsProps {
  especificaciones?: EspecificacionesMoto
}

interface SpecRow {
  label: string
  value: string | undefined | null
}

export function MotoSpecs({ especificaciones: e }: MotoSpecsProps) {
  if (!e) return null

  const rows: SpecRow[] = [
    { label: 'Año', value: e.año?.toString() },
    { label: 'Cilindraje', value: e.cilindraje ? `${e.cilindraje} cc` : undefined },
    { label: 'Tipo', value: e.tipo ? TIPO_LABEL[e.tipo] : undefined },
    { label: 'Colores', value: e.colores?.length ? e.colores.join(', ') : undefined },
    { label: 'Motor', value: e.motor },
    { label: 'Potencia', value: e.potencia },
    { label: 'Peso', value: e.peso ? `${e.peso} kg` : undefined },
  ].filter((row): row is { label: string; value: string } =>
    typeof row.value === 'string' && row.value.trim() !== '',
  )

  if (rows.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Especificaciones técnicas
        </h2>
      </div>
      <dl className="divide-y divide-border">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between px-5 py-3 text-sm"
          >
            <dt className="text-muted-foreground shrink-0">{label}</dt>
            <dd className="font-medium text-foreground text-right break-words min-w-0 pl-4">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
