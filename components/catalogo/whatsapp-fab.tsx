'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppFabProps {
  motoNombre?: string
}

export function WhatsAppFab({ motoNombre }: WhatsAppFabProps) {
  const numero = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
  if (!numero) return null

  const mensaje = motoNombre
    ? `Hola! Me interesa la moto ${motoNombre} que vi en su catálogo. ¿Sigue disponible?`
    : 'Hola! Vi el catálogo de Tachos Biker y me interesa una moto.'

  const href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`

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
