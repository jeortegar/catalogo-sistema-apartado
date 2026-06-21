export type EstadoMoto = 'disponible' | 'apartada' | 'vendida'

export type TipoMoto = 'scooter' | 'sport' | 'naked' | 'custom'

export interface EspecificacionesMoto {
  año?: number
  cilindraje?: number
  tipo?: TipoMoto
  colores?: string[]
  motor?: string
  potencia?: string
  peso?: number
}

export interface ImagenMoto {
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface Moto {
  id: string
  nombre: string
  slug: string
  galeria: ImagenMoto[]
  precio: number
  estado: EstadoMoto
  especificaciones?: EspecificacionesMoto
  createdAt: string
  updatedAt: string
}

export type MotoCard = Pick<Moto, 'id' | 'nombre' | 'slug' | 'precio' | 'estado'> & {
  imagenPrincipal: ImagenMoto
}

export type OrdenarMoto = 'reciente' | 'precio-asc' | 'precio-desc' | 'nombre'

export interface FiltrosMoto {
  disponibilidad: 'todos' | 'disponible' | 'apartada'
  tipo: 'todos' | TipoMoto
  precioMin: string
  precioMax: string
  busqueda: string
  ordenar: OrdenarMoto
}

export const filtrosInicial: FiltrosMoto = {
  disponibilidad: 'todos',
  tipo: 'todos',
  precioMin: '',
  precioMax: '',
  busqueda: '',
  ordenar: 'reciente',
}
