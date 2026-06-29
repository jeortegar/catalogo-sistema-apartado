'use client'

import { MessageCircle } from 'lucide-react'
import { brand } from '@/lib/config/brand'

interface WhatsAppFabProps {
  motoNombre?: string
}

export function WhatsAppFab({ motoNombre }: WhatsAppFabProps) {
  const mensaje = motoNombre
    ? brand.mensajes.motoEspecifica(motoNombre)
    : brand.mensajes.catalogoGeneral

  const href = brand.whatsappHref(mensaje)
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-fab transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40"
    >
      <MessageCircle className="size-7" />
    </a>
  )
}
