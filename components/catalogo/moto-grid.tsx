import type { Moto } from '@/lib/types/moto'
import { MotoCard } from './moto-card'
import { CatalogoEmpty } from './catalogo-empty'

interface MotoGridProps {
  motos: Moto[]
  /** Si se pasa, muestra el estado "sin resultados de filtro" con botón de reset */
  onReset?: () => void
}

export function MotoGrid({ motos, onReset }: MotoGridProps) {
  if (motos.length === 0) {
    return <CatalogoEmpty onReset={onReset} />
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {motos.map((moto) => (
        <MotoCard key={moto.id} moto={moto} />
      ))}
    </div>
  )
}
