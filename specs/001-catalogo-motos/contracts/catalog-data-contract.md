# Data Contract: Catálogo → UI

**Feature**: 001-catalogo-motos | **Date**: 2026-06-18

Este contrato define la interface entre la capa de datos (Payload CMS REST API) y la capa UI (Next.js Server Components). Toda función en `lib/payload/motos.ts` devuelve tipos de este contrato.

---

## Contrato 1: `getMotosCatalogo()`

**Propósito**: Obtener todas las motos visibles en el catálogo público (excluye `vendida`), ordenadas por más reciente primero.

**Llamada REST**:
```
GET {PAYLOAD_CMS_URL}/api/motos
  ?where[estado][not_equals]=vendida
  &sort=-createdAt
  &limit=100
  &depth=1
```

**Tipo de retorno**: `Moto[]`

**Contrato de datos (por ítem)**:

| Campo | Tipo | Garantía |
|-------|------|----------|
| `id` | `string` | Siempre presente |
| `nombre` | `string` | Siempre presente y no vacío |
| `slug` | `string` | Siempre presente, único |
| `galeria[0]` | `ImagenMoto` | Siempre presente (min 1 imagen) |
| `precio` | `number` | Siempre presente, > 0, en MXN |
| `estado` | `'disponible' \| 'apartada'` | Nunca `'vendida'` en esta respuesta |
| `especificaciones` | `EspecificacionesMoto \| undefined` | Opcional — UI debe manejar ausencia |
| `createdAt` | `string` (ISO 8601) | Siempre presente |

**Comportamiento con catálogo vacío**: Devuelve `[]` (array vacío). La UI muestra `CatalogoEmpty`.

**Revalidación**: ISR con `revalidate: 60` segundos.

---

## Contrato 2: `getMotoBySlug(slug: string)`

**Propósito**: Obtener la ficha completa de una moto por su slug.

**Llamada REST**:
```
GET {PAYLOAD_CMS_URL}/api/motos
  ?where[slug][equals]={slug}
  &limit=1
  &depth=1
```

**Tipo de retorno**: `Moto | null`

**Contrato de datos**: Igual que el contrato 1, más todos los campos de `especificaciones` (presentes o `undefined`).

**Comportamiento con slug no encontrado**: Devuelve `null`. La página llama a `notFound()` de Next.js.

**Comportamiento con moto `vendida`**: La función **no filtra** por estado — el servidor puede necesitar renderizar la ficha de una moto vendida (ej. para SEO / links externos existentes). La UI aplica la lógica de "sin CTA de apartado" basada en `estado`.

**Revalidación**: ISR con `revalidate: 60` segundos.

---

## Contrato 3: `generateStaticParams()` para `/catalogo/[slug]`

**Propósito**: Pre-generar todas las páginas de detalle en build time.

**Llamada REST**:
```
GET {PAYLOAD_CMS_URL}/api/motos
  ?where[estado][not_equals]=vendida
  &limit=100
  &select[slug]=true
```

**Tipo de retorno**: `{ slug: string }[]`

---

## Variables de entorno requeridas

| Variable | Ejemplo | Scope |
|----------|---------|-------|
| `PAYLOAD_CMS_URL` | `https://cms.tachosbiker.com` | Server-only |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5512345678` | Public (client + server) |

La variable `PAYLOAD_CMS_URL` es **server-only** (sin prefijo `NEXT_PUBLIC_`). No se expone al cliente.

---

## Manejo de errores

| Escenario | Comportamiento esperado |
|-----------|------------------------|
| CMS offline / timeout | `fetch` lanza error → Next.js error boundary muestra página de error genérica |
| Imagen no disponible | `<Image>` con `onError` → reemplaza con `/public/moto-placeholder.svg` |
| Slug inválido | `getMotoBySlug` devuelve `null` → página llama `notFound()` → 404 |
| Campo opcional ausente | UI omite el campo (no muestra etiqueta vacía) |
