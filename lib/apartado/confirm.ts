import { revalidatePath } from 'next/cache'
import { getApartadoById, updateApartadoEstado, updateMotoEstado } from '@/lib/payload/apartados'
import { getConektaOrder } from '@/lib/conekta/client'

export async function confirmarApartado(apartadoId: string, fallbackOrderId?: string): Promise<{ ok: boolean; alreadyDone: boolean }> {
  const apartado = await getApartadoById(apartadoId)
  if (!apartado) throw new Error(`Apartado ${apartadoId} no encontrado`)

  // Idempotency: already confirmed
  if (apartado.estadoPago === 'completado') {
    return { ok: true, alreadyDone: true }
  }

  const conektaOrderId = apartado.referenciaConekta ?? fallbackOrderId
  if (!conektaOrderId) {
    throw new Error('Apartado sin referencia de Conekta — pago aún no iniciado')
  }

  // Verify payment status with Conekta
  const order = await getConektaOrder(conektaOrderId)

  if (order.payment_status !== 'paid') {
    if (order.payment_status === 'expired' || order.payment_status === 'declined') {
      await updateApartadoEstado(apartadoId, 'fallido')
    }
    return { ok: false, alreadyDone: false }
  }

  // Mark apartado as completado
  await updateApartadoEstado(apartadoId, 'completado')

  // Update moto estado to 'apartada'
  const motoId = typeof apartado.moto === 'string' ? apartado.moto : apartado.moto.id
  await updateMotoEstado(motoId, 'apartada')

  // Invalidate ISR cache
  try {
    revalidatePath('/catalogo')
    if (typeof apartado.moto !== 'string' && apartado.moto.slug) {
      revalidatePath(`/catalogo/${apartado.moto.slug}`)
    }
  } catch {
    // revalidatePath may fail outside RSC/Route Handler — non-fatal
  }

  return { ok: true, alreadyDone: false }
}
