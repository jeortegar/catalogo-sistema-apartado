import type { CollectionConfig } from 'payload'

// Schema reference for Payload CMS (separate deployment on Railway).
// The beforeChange hook enforces race condition prevention for apartado creation.
export const Apartados: CollectionConfig = {
  slug: 'apartados',
  admin: {
    useAsTitle: 'nombreCliente',
    defaultColumns: ['nombreCliente', 'moto', 'estadoPago', 'montoCobrado', 'createdAt'],
    description: 'Registros de apartados de motos. El campo "Estado de pago" es gestionado automáticamente por el sistema.',
  },
  access: {
    // create is open: the Next.js server action calls this without a user session.
    // read/update/delete require a valid user session OR a user-scoped API key
    // (PAYLOAD_API_KEY env var). If PATCH returns 403, the Users collection is
    // missing `useAPIKey: true` in its Payload config — see CLAUDE.md for setup.
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation !== 'create') return data

        // Verify moto is available
        const moto = await req.payload.findByID({
          collection: 'motos',
          id: data.moto as string,
        })
        if (!moto || moto.estado !== 'disponible') {
          throw new Error('La moto no está disponible para apartar')
        }

        // Prevent duplicate pending apartados for the same moto
        const existing = await req.payload.find({
          collection: 'apartados',
          where: {
            and: [
              { moto: { equals: data.moto } },
              { estadoPago: { equals: 'pendiente' } },
            ],
          },
          limit: 1,
        })
        if (existing.docs.length > 0) {
          throw new Error('Ya existe un apartado pendiente para esta moto')
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'moto',
      type: 'relationship',
      relationTo: 'motos',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'nombreCliente',
      type: 'text',
      required: true,
      minLength: 2,
      label: 'Nombre del cliente',
      admin: { readOnly: true },
    },
    {
      name: 'telefonoCliente',
      type: 'text',
      required: true,
      label: 'Teléfono del cliente',
      admin: { readOnly: true },
    },
    {
      name: 'emailCliente',
      type: 'email',
      required: true,
      label: 'Email del cliente',
      admin: { readOnly: true },
    },
    {
      name: 'montoCobrado',
      type: 'number',
      required: true,
      min: 1,
      label: 'Monto cobrado (MXN)',
      admin: { readOnly: true },
    },
    {
      name: 'referenciaConekta',
      type: 'text',
      unique: true,
      label: 'ID de orden en Conekta',
      admin: { readOnly: true },
    },
    {
      name: 'estadoPago',
      type: 'select',
      required: true,
      defaultValue: 'pendiente',
      label: 'Estado de pago',
      // Read-only in admin — managed programmatically via webhook/redirect
      admin: { readOnly: true },
      options: [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Completado', value: 'completado' },
        { label: 'Fallido', value: 'fallido' },
      ],
    },
    {
      name: 'aceptoPrivacidad',
      type: 'checkbox',
      required: true,
      label: 'Aceptó aviso de privacidad (LFPDPPP)',
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
