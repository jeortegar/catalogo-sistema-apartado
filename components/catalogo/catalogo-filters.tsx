'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FiltrosMoto } from '@/lib/types/moto'

/* ─── tipos precio preset ─── */
type PrecioPreset = 'todos' | 'hasta-50k' | '50k-100k' | '100k-200k' | 'mas-200k'

const PRECIO_PRESETS: { value: PrecioPreset; label: string; min: string; max: string }[] = [
  { value: 'todos',      label: 'Cualquier precio',       min: '',       max: ''       },
  { value: 'hasta-50k',  label: 'Hasta $50,000',          min: '',       max: '50000'  },
  { value: '50k-100k',   label: '$50,000 – $100,000',     min: '50000',  max: '100000' },
  { value: '100k-200k',  label: '$100,000 – $200,000',    min: '100000', max: '200000' },
  { value: 'mas-200k',   label: 'Más de $200,000',        min: '200000', max: ''       },
]

function getPrecioPreset(min: string, max: string): PrecioPreset {
  const preset = PRECIO_PRESETS.find((p) => p.min === min && p.max === max)
  return preset?.value ?? 'todos'
}

/* ─── FilterDropdown ─── */
interface FilterDropdownProps {
  label: string
  activeLabel?: string
  active?: boolean
  children: React.ReactNode
}

function FilterDropdown({ label, activeLabel, active, children }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 py-2 text-sm transition-opacity hover:opacity-60 select-none',
          active && 'font-medium',
        )}
      >
        {active && activeLabel ? (
          <>
            <span className="text-muted-foreground font-normal">{label}:&nbsp;</span>
            <span>{activeLabel}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
        <ChevronDown
          className={cn('size-3.5 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[180px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-border py-1">
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownOptionProps {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}

function DropdownOption({ selected, onClick, children }: DropdownOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 transition-colors',
        selected ? 'font-semibold' : 'font-normal',
      )}
    >
      {children}
    </button>
  )
}

/* ─── CatalogoFilters ─── */
interface CatalogoFiltersProps {
  filtros: FiltrosMoto
  onChange: (filtros: FiltrosMoto) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export function CatalogoFilters({
  filtros,
  onChange,
  onReset,
  hasActiveFilters,
}: CatalogoFiltersProps) {
  function set<K extends keyof FiltrosMoto>(key: K, value: FiltrosMoto[K]) {
    onChange({ ...filtros, [key]: value })
  }

  const precioPreset = getPrecioPreset(filtros.precioMin, filtros.precioMax)

  const tipoLabel: Record<string, string> = {
    todos: 'Todos',
    scooter: 'Scooter',
    sport: 'Sport',
    naked: 'Naked',
    custom: 'Custom',
  }

  const disponibilidadLabel: Record<string, string> = {
    todos: 'Todas',
    disponible: 'Disponible',
    apartada: 'Apartada',
  }

  const ordenarLabel: Record<string, string> = {
    reciente: 'Fecha: reciente a antigua',
    'precio-asc': 'Precio: menor a mayor',
    'precio-desc': 'Precio: mayor a menor',
    nombre: 'Nombre: A – Z',
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-border pb-3">

      {/* Búsqueda */}
      <div className="flex items-center gap-1.5">
        <input
          type="search"
          placeholder="Buscar moto…"
          value={filtros.busqueda}
          onChange={(e) => set('busqueda', e.target.value)}
          className={cn(
            'h-8 bg-transparent text-sm placeholder:text-muted-foreground/50',
            'border-b border-border focus:border-foreground focus:outline-none',
            'w-36 transition-[width] duration-200 focus:w-48',
          )}
        />
      </div>

      {/* Tipo */}
      <FilterDropdown
        label="Tipo"
        active={filtros.tipo !== 'todos'}
        activeLabel={tipoLabel[filtros.tipo]}
      >
        {(['todos', 'scooter', 'sport', 'naked', 'custom'] as const).map((v) => (
          <DropdownOption
            key={v}
            selected={filtros.tipo === v}
            onClick={() => set('tipo', v)}
          >
            {tipoLabel[v]}
          </DropdownOption>
        ))}
      </FilterDropdown>

      {/* Disponibilidad */}
      <FilterDropdown
        label="Disponibilidad"
        active={filtros.disponibilidad !== 'todos'}
        activeLabel={disponibilidadLabel[filtros.disponibilidad]}
      >
        {(['todos', 'disponible', 'apartada'] as const).map((v) => (
          <DropdownOption
            key={v}
            selected={filtros.disponibilidad === v}
            onClick={() => set('disponibilidad', v)}
          >
            {disponibilidadLabel[v]}
          </DropdownOption>
        ))}
      </FilterDropdown>

      {/* Precio */}
      <FilterDropdown
        label="Precio"
        active={precioPreset !== 'todos'}
        activeLabel={PRECIO_PRESETS.find((p) => p.value === precioPreset)?.label}
      >
        {PRECIO_PRESETS.map((p) => (
          <DropdownOption
            key={p.value}
            selected={precioPreset === p.value}
            onClick={() => onChange({ ...filtros, precioMin: p.min, precioMax: p.max })}
          >
            {p.label}
          </DropdownOption>
        ))}
      </FilterDropdown>

      {/* Ordenar */}
      <FilterDropdown
        label="Ordenar"
        active={filtros.ordenar !== 'reciente'}
        activeLabel={ordenarLabel[filtros.ordenar]}
      >
        {(['reciente', 'precio-asc', 'precio-desc', 'nombre'] as const).map((v) => (
          <DropdownOption
            key={v}
            selected={filtros.ordenar === v}
            onClick={() => set('ordenar', v)}
          >
            {ordenarLabel[v]}
          </DropdownOption>
        ))}
      </FilterDropdown>

      {/* Limpiar */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
        >
          <X className="size-3" />
          Limpiar
        </button>
      )}
    </div>
  )
}
