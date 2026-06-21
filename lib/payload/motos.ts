import type { EstadoMoto, EspecificacionesMoto, ImagenMoto, Moto, TipoMoto } from '@/lib/types/moto'
import { fetchFromCMS } from './client'
import { MOCKS_MOTOS } from './mocks'

const USE_MOCKS = process.env.USE_MOCK_DATA === 'true'

interface PayloadListResponse<T> {
  docs: T[]
  totalDocs: number
  hasNextPage: boolean
}

interface PayloadMotoRaw {
  id: string
  nombre: string
  slug: string
  galeria: ImagenMoto[]
  precio: number
  estado: EstadoMoto
  especificaciones?: {
    año?: number
    cilindraje?: number
    tipo?: TipoMoto
    colores?: Array<{ id: string; color: string }>
    motor?: string
    potencia?: string
    peso?: number
  }
  createdAt: string
  updatedAt: string
}

function mapEspecificaciones(
  raw: PayloadMotoRaw['especificaciones'],
): EspecificacionesMoto | undefined {
  if (!raw) return undefined
  return {
    año: raw.año,
    cilindraje: raw.cilindraje,
    tipo: raw.tipo,
    colores: raw.colores?.map((c) => c.color),
    motor: raw.motor,
    potencia: raw.potencia,
    peso: raw.peso,
  }
}

function mapMoto(raw: PayloadMotoRaw): Moto {
  return {
    id: raw.id,
    nombre: raw.nombre,
    slug: raw.slug,
    galeria: raw.galeria,
    precio: raw.precio,
    estado: raw.estado,
    especificaciones: mapEspecificaciones(raw.especificaciones),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export async function getMotosCatalogo(): Promise<Moto[]> {
  if (USE_MOCKS) {
    return MOCKS_MOTOS.filter((m) => m.estado !== 'vendida')
  }
  const params = new URLSearchParams({
    'where[estado][not_equals]': 'vendida',
    sort: '-createdAt',
    limit: '100',
  })
  try {
    const data = await fetchFromCMS<PayloadListResponse<PayloadMotoRaw>>(
      `/api/motos?${params.toString()}`,
    )
    return data.docs.map(mapMoto)
  } catch {
    return []
  }
}

export async function getMotoBySlug(slug: string): Promise<Moto | null> {
  if (USE_MOCKS) {
    return MOCKS_MOTOS.find((m) => m.slug === slug) ?? null
  }
  const params = new URLSearchParams({
    'where[slug][equals]': slug,
    limit: '1',
  })
  try {
    const data = await fetchFromCMS<PayloadListResponse<PayloadMotoRaw>>(
      `/api/motos?${params.toString()}`,
    )
    const raw = data.docs[0]
    return raw ? mapMoto(raw) : null
  } catch {
    return null
  }
}

export async function getMotoSlugs(): Promise<{ slug: string }[]> {
  if (USE_MOCKS) {
    return MOCKS_MOTOS.filter((m) => m.estado !== 'vendida').map(({ slug }) => ({ slug }))
  }
  const params = new URLSearchParams({
    'where[estado][not_equals]': 'vendida',
    limit: '100',
    'select[slug]': 'true',
  })
  try {
    const data = await fetchFromCMS<PayloadListResponse<{ slug: string }>>(
      `/api/motos?${params.toString()}`,
      3600,
    )
    return data.docs
  } catch {
    return []
  }
}
