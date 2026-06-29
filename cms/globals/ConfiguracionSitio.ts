import type { GlobalConfig } from 'payload'

// Schema reference for Payload CMS (separate deployment on Railway).
// afterChange triggers ISR revalidation of the home page when hero or subtitle changes.
export const ConfiguracionSitio: GlobalConfig = {
  slug: 'configuracion-sitio',
  label: 'Configuración del Sitio',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Configuración general del sitio: imagen hero, subtítulo, etc.',
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
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
            body: JSON.stringify({ paths: ['/'] }),
          })
        } catch {
          // Non-fatal: ISR revalidará en el siguiente intervalo de 60s
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'logotipo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Logotipo',
      admin: {
        description: 'Logo que aparece en el encabezado del sitio. Recomendado: PNG con fondo transparente, mínimo 80×80 px.',
      },
    },
    {
      name: 'imagenHero',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Imagen del Hero',
      admin: {
        description: 'Imagen de fondo para la sección principal de la página de inicio. Recomendado: 1920×1080 px mínimo.',
      },
    },
    {
      name: 'subtituloHero',
      type: 'text',
      required: false,
      defaultValue: 'Motos de importación. Apartas en línea.',
      label: 'Subtítulo del Hero',
      admin: {
        description: 'Texto secundario que aparece debajo del nombre del sitio en el hero.',
      },
    },
  ],
}
