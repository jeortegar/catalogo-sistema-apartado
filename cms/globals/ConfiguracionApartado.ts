import type { GlobalConfig } from 'payload'

// Schema reference for Payload CMS (separate deployment on Railway).
// The afterChange hook triggers ISR revalidation in Next.js when the admin changes the amount.
export const ConfiguracionApartado: GlobalConfig = {
  slug: 'configuracion-apartado',
  label: 'Configuración de Apartado',
  admin: {
    description: 'Configuración global del sistema de apartado de motos.',
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        // Trigger ISR revalidation in Next.js when monto changes
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.PAYLOAD_CMS_URL
        const revalidateSecret = process.env.REVALIDATE_SECRET
        if (!appUrl || !revalidateSecret) return doc

        try {
          await fetch(`${appUrl}/api/revalidate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${revalidateSecret}`,
            },
            body: JSON.stringify({ paths: ['/catalogo'] }),
          })
        } catch {
          // Non-fatal: ISR will still revalidate on next 60s interval
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'montoApartado',
      type: 'number',
      required: true,
      defaultValue: 1000,
      min: 1,
      label: 'Monto del apartado en MXN',
      admin: {
        description: 'Monto en MXN cobrado por el apartado de cualquier moto. Valor mínimo: $1 MXN.',
      },
    },
  ],
}
