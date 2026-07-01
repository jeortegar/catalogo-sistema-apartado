'use server'

import { getMotoBySlug } from '@/lib/payload/motos'
import {
  getConfiguracionApartado,
  createApartado,
  updateApartadoConektaRef,
} from '@/lib/payload/apartados'
import { createCheckoutOrder } from '@/lib/conekta/client'

export type ApartadoActionResult =
  | { success: true; checkoutUrl: string; apartadoId: string }
  | { success: false; error: 'moto_no_disponible' | 'apartado_pendiente_existente' | 'validacion' | 'conekta_error' | 'server_error'; message: string }

function validatePhone(phone: string): boolean {
  return /^\d{10}$/.test(phone)
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function iniciarApartado(
  _prevState: ApartadoActionResult | null,
  formData: FormData,
): Promise<ApartadoActionResult> {
  const motoSlug = (formData.get('motoSlug') as string | null)?.trim() ?? ''
  const nombreCliente = (formData.get('nombreCliente') as string | null)?.trim() ?? ''
  const telefonoCliente = (formData.get('telefonoCliente') as string | null)?.trim() ?? ''
  const emailCliente = (formData.get('emailCliente') as string | null)?.trim() ?? ''
  const aceptoPrivacidad = formData.get('aceptoPrivacidad') === 'on'

  // Step 1: Validate fields
  if (!nombreCliente || nombreCliente.length < 2) {
    return { success: false, error: 'validacion', message: 'El nombre debe tener al menos 2 caracteres.' }
  }
  if (!validatePhone(telefonoCliente)) {
    return { success: false, error: 'validacion', message: 'El teléfono debe tener exactamente 10 dígitos numéricos.' }
  }
  if (!validateEmail(emailCliente)) {
    return { success: false, error: 'validacion', message: 'El correo electrónico no es válido.' }
  }
  if (!aceptoPrivacidad) {
    return { success: false, error: 'validacion', message: 'Debes aceptar el aviso de privacidad para continuar.' }
  }
  if (!motoSlug) {
    return { success: false, error: 'validacion', message: 'Moto no especificada.' }
  }

  // Step 2: Verify moto exists and is available
  let moto: Awaited<ReturnType<typeof getMotoBySlug>>
  try {
    moto = await getMotoBySlug(motoSlug)
  } catch {
    return { success: false, error: 'server_error', message: 'Error al verificar la moto. Intenta de nuevo.' }
  }

  if (!moto) {
    return { success: false, error: 'moto_no_disponible', message: 'La moto no fue encontrada.' }
  }
  if (moto.estado !== 'disponible') {
    return { success: false, error: 'moto_no_disponible', message: 'Esta moto ya no está disponible para apartar.' }
  }

  // Step 3: Get monto from global config
  let monto: number
  try {
    const config = await getConfiguracionApartado()
    monto = config.montoApartado
  } catch {
    return { success: false, error: 'server_error', message: 'Error al obtener la configuración de apartado. Intenta de nuevo.' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  // Step 4: Create Apartado record with referenciaConekta = null
  let apartadoId: string
  try {
    const apartado = await createApartado({
      moto: moto.id,
      nombreCliente,
      telefonoCliente,
      emailCliente,
      montoCobrado: monto,
      referenciaConekta: null,
      estadoPago: 'pendiente',
      aceptoPrivacidad: true,
    })
    apartadoId = apartado.id
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('no está disponible')) {
      return { success: false, error: 'moto_no_disponible', message: 'Esta moto ya no está disponible para apartar.' }
    }
    if (message.includes('apartado pendiente')) {
      return { success: false, error: 'apartado_pendiente_existente', message: 'Ya existe un proceso de apartado activo para esta moto.' }
    }
    return { success: false, error: 'server_error', message: 'Error al registrar el apartado. Intenta de nuevo.' }
  }

  // Step 5: Create Conekta checkout order
  let orderId: string
  let checkoutUrl: string
  try {
    const result = await createCheckoutOrder({
      motoNombre: moto.nombre,
      monto,
      clienteInfo: { name: nombreCliente, email: emailCliente, phone: telefonoCliente },
      successUrl: `${appUrl}/apartar/${motoSlug}/exito?apartado_id=${apartadoId}`,
      failureUrl: `${appUrl}/apartar/${motoSlug}/error`,
      metadata: { moto_slug: motoSlug, apartado_id: apartadoId },
    })
    orderId = result.orderId
    checkoutUrl = result.checkoutUrl
  } catch {
    // Conekta failed — leave Apartado in pendiente state (admin can clean up)
    return { success: false, error: 'conekta_error', message: 'Error al iniciar el proceso de pago. Intenta de nuevo o contáctanos por WhatsApp.' }
  }

  // Step 6: Update Apartado with Conekta orderId — retry up to 2 times
  // Critical for the redirect confirmation flow; webhook acts as final fallback
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await updateApartadoConektaRef(apartadoId, orderId)
      break
    } catch (err) {
      if (attempt === 3) {
        console.error(`[iniciarApartado] updateApartadoConektaRef failed after 3 attempts for apartado ${apartadoId}:`, err)
      } else {
        await new Promise((r) => setTimeout(r, 400 * attempt))
      }
    }
  }

  return { success: true, checkoutUrl, apartadoId }
}
