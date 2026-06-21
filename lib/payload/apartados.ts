import { fetchFromCMS, mutateOnCMS } from './client'
import type { Apartado, ConfiguracionApartado, CreateApartadoInput, EstadoPago } from '@/lib/types/apartado'

interface PayloadDoc<T> { doc: T }
interface PayloadList<T> { docs: T[] }

export async function getConfiguracionApartado(): Promise<ConfiguracionApartado> {
  return fetchFromCMS<ConfiguracionApartado>('/api/globals/configuracion-apartado', 60)
}

export async function createApartado(data: CreateApartadoInput): Promise<Apartado> {
  const res = await mutateOnCMS<PayloadDoc<Apartado>>('/api/apartados', 'POST', data)
  return res.doc
}

export async function updateApartadoEstado(
  id: string,
  estadoPago: EstadoPago,
  referenciaConekta?: string,
): Promise<Apartado> {
  const patch: Partial<Apartado> = { estadoPago }
  if (referenciaConekta !== undefined) patch.referenciaConekta = referenciaConekta
  const res = await mutateOnCMS<PayloadDoc<Apartado>>(`/api/apartados/${id}`, 'PATCH', patch)
  return res.doc
}

export async function getApartadoById(id: string): Promise<Apartado | null> {
  try {
    return await fetchFromCMS<Apartado>(`/api/apartados/${id}?depth=1`, 0)
  } catch {
    return null
  }
}

export async function getApartadoByConektaRef(orderId: string): Promise<Apartado | null> {
  try {
    const res = await fetchFromCMS<PayloadList<Apartado>>(
      `/api/apartados?where[referenciaConekta][equals]=${encodeURIComponent(orderId)}&depth=1&limit=1`,
      0,
    )
    return res.docs[0] ?? null
  } catch {
    return null
  }
}

export async function updateApartadoConektaRef(id: string, referenciaConekta: string): Promise<void> {
  await mutateOnCMS<PayloadDoc<Apartado>>(`/api/apartados/${id}`, 'PATCH', { referenciaConekta })
}

export async function updateMotoEstado(motoId: string, estado: string): Promise<void> {
  await mutateOnCMS<PayloadDoc<unknown>>(`/api/motos/${motoId}`, 'PATCH', { estado })
}
