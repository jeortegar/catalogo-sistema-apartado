export type EstadoPago = 'pendiente' | 'completado' | 'fallido'

export interface Apartado {
  id: string
  moto: string | { id: string; slug: string; nombre: string; estado: string }
  nombreCliente: string
  telefonoCliente: string
  emailCliente: string
  montoCobrado: number
  referenciaConekta: string | null
  estadoPago: EstadoPago
  aceptoPrivacidad: boolean
  createdAt: string
  updatedAt: string
}

export interface ConfiguracionApartado {
  montoApartado: number
}

export type CreateApartadoInput = {
  moto: string
  nombreCliente: string
  telefonoCliente: string
  emailCliente: string
  montoCobrado: number
  referenciaConekta: string | null
  estadoPago: EstadoPago
  aceptoPrivacidad: true
}
