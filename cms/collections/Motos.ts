/**
 * Payload CMS v3 — Colección `motos`
 *
 * Este archivo pertenece al deployment de Payload CMS (Railway), NO a Next.js.
 * Copiar / registrar en el payload.config.ts del proyecto CMS.
 *
 * Schema derivado de: specs/001-catalogo-motos/data-model.md
 */
import type { CollectionConfig } from 'payload'

export const Motos: CollectionConfig = {
  slug: 'motos',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc }) => {
        // Trigger ISR revalidation in Next.js when estado changes
        if (previousDoc?.estado === doc.estado) return doc

        const appUrl = process.env.NEXT_PUBLIC_APP_URL
        const revalidateSecret = process.env.REVALIDATE_SECRET
        if (!appUrl || !revalidateSecret) return doc

        try {
          await fetch(`${appUrl}/api/revalidate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${revalidateSecret}`,
            },
            body: JSON.stringify({ paths: ['/catalogo', `/catalogo/${doc.slug}`] }),
          })
        } catch {
          // Non-fatal: ISR revalidates on next 60s interval
        }

        return doc
      },
    ],
  },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'estado', 'precio', 'updatedAt'],
    description: 'Catálogo de motos en venta. Solo motos con estado "Disponible" o "Apartada" son visibles en el sitio.',
  },
  fields: [
    {
      name: 'nombre',
      type: 'text',
      required: true,
      label: 'Nombre / Modelo',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: {
        position: 'sidebar',
        description: 'URL amigable. Se genera automáticamente desde el nombre.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.nombre) {
              return (data.nombre as string)
                .toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'galeria',
      type: 'array',
      label: 'Galería de imágenes',
      minRows: 1,
      admin: {
        description: 'Sube al menos una foto. La primera imagen es la principal en el catálogo.',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL de la imagen',
          admin: { description: 'URL de Cloudinary o CDN.' },
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Texto alternativo',
        },
        {
          name: 'width',
          type: 'number',
          label: 'Ancho (px)',
        },
        {
          name: 'height',
          type: 'number',
          label: 'Alto (px)',
        },
      ],
    },
    {
      name: 'precio',
      type: 'number',
      required: true,
      min: 1,
      label: 'Precio (MXN)',
      admin: { description: 'Precio en pesos mexicanos. Sin decimales.' },
    },
    {
      name: 'estado',
      type: 'select',
      required: true,
      defaultValue: 'disponible',
      label: 'Estado de disponibilidad',
      admin: { position: 'sidebar' },
      options: [
        { label: '🟢 Disponible', value: 'disponible' },
        { label: '🟡 Apartada', value: 'apartada' },
        { label: '⚫ Vendida', value: 'vendida' },
      ],
    },
    {
      name: 'especificaciones',
      type: 'group',
      label: 'Especificaciones técnicas',
      fields: [
        {
          name: 'año',
          type: 'number',
          label: 'Año',
          min: 2000,
        },
        {
          name: 'cilindraje',
          type: 'number',
          label: 'Cilindraje (cc)',
          min: 1,
        },
        {
          name: 'tipo',
          type: 'select',
          label: 'Tipo',
          options: [
            { label: 'Scooter', value: 'scooter' },
            { label: 'Sport', value: 'sport' },
            { label: 'Naked', value: 'naked' },
            { label: 'Custom', value: 'custom' },
          ],
        },
        {
          name: 'colores',
          type: 'array',
          label: 'Colores disponibles',
          fields: [
            {
              name: 'color',
              type: 'text',
              required: true,
              label: 'Color',
            },
          ],
        },
        {
          name: 'motor',
          type: 'text',
          label: 'Motor',
          admin: { description: 'Ej: Monocilíndrico 4T SOHC' },
        },
        {
          name: 'potencia',
          type: 'text',
          label: 'Potencia máxima',
          admin: { description: 'Ej: 12.9 hp @ 9,000 rpm' },
        },
        {
          name: 'peso',
          type: 'number',
          label: 'Peso (kg)',
          min: 1,
        },
      ],
    },
  ],
}
