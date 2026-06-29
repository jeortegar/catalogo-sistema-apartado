const nombre = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Mi Negocio'
const sitioUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://minegocio.com'
const whatsappNumero = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')

export const brand = {
  nombre,
  sitioUrl,
  whatsappNumero,
  whatsappHref: (mensaje: string) =>
    whatsappNumero
      ? `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensaje)}`
      : null,
  mensajes: {
    catalogoGeneral: `Hola! Vi el catálogo de ${nombre} y me interesa una moto.`,
    motoEspecifica: (motoNombre: string) =>
      `Hola! Me interesa la moto ${motoNombre} que vi en su catálogo. ¿Sigue disponible?`,
    exitoApartado: (motoNombre: string) =>
      `Hola, acabo de apartar la moto ${motoNombre} en ${nombre}.`,
  },
}
