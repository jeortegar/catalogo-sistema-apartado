'use client'

import { useState, useMemo } from 'react'
import type { Moto, FiltrosMoto } from '@/lib/types/moto'
import { filtrosInicial } from '@/lib/types/moto'
import { CatalogoFilters } from './catalogo-filters'
import { MotoGrid } from './moto-grid'

function aplicarFiltros(motos: Moto[], filtros: FiltrosMoto): Moto[] {
  const filtered = motos.filter((moto) => {
    if (filtros.disponibilidad !== 'todos' && moto.estado !== filtros.disponibilidad) return false
    if (filtros.tipo !== 'todos' && moto.especificaciones?.tipo !== filtros.tipo) return false
    const min = parseFloat(filtros.precioMin)
    const max = parseFloat(filtros.precioMax)
    if (!isNaN(min) && moto.precio < min) return false
    if (!isNaN(max) && moto.precio > max) return false
    if (filtros.busqueda.trim()) {
      const q = filtros.busqueda.trim().toLowerCase()
      if (!moto.nombre.toLowerCase().includes(q)) return false
    }
    return true
  })

  return [...filtered].sort((a, b) => {
    switch (filtros.ordenar) {
      case 'precio-asc': return a.precio - b.precio
      case 'precio-desc': return b.precio - a.precio
      case 'nombre': return a.nombre.localeCompare(b.nombre, 'es')
      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
}

function hasActiveFilters(filtros: FiltrosMoto): boolean {
  return (
    filtros.disponibilidad !== 'todos' ||
    filtros.tipo !== 'todos' ||
    filtros.precioMin !== '' ||
    filtros.precioMax !== '' ||
    filtros.busqueda.trim() !== '' ||
    filtros.ordenar !== 'reciente'
  )
}

interface CatalogoClientWrapperProps {
  motos: Moto[]
}

export function CatalogoClientWrapper({ motos }: CatalogoClientWrapperProps) {
  const [filtros, setFiltros] = useState<FiltrosMoto>(filtrosInicial)

  const filteredMotos = useMemo(
    () => aplicarFiltros(motos, filtros),
    [motos, filtros],
  )

  const filtersActive = hasActiveFilters(filtros)

  function resetFilters() {
    setFiltros(filtrosInicial)
  }

  // Catálogo naturalmente vacío — no tiene sentido mostrar filtros
  if (motos.length === 0) {
    return <MotoGrid motos={[]} />
  }

  return (
    <div className="flex flex-col gap-6">
      <CatalogoFilters
        filtros={filtros}
        onChange={setFiltros}
        onReset={resetFilters}
        hasActiveFilters={filtersActive}
      />
      <MotoGrid
        motos={filteredMotos}
        onReset={filtersActive ? resetFilters : undefined}
      />
    </div>
  )
}
