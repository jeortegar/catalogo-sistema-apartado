# Research: Catálogo de Motos en Venta

**Feature**: 001-catalogo-motos | **Date**: 2026-06-18

## Decision 1: Estrategia de Fetch de Datos (Payload CMS → Next.js)

**Decision**: Payload CMS REST API + Next.js `fetch` con ISR (`revalidate: 60`)

**Rationale**: El frontend (Vercel) y el CMS (Railway) son despliegues separados, por lo que se usa la REST API de Payload CMS. Con ~10 motos y cambios de contenido infrecuentes, ISR con revalidación de 60 segundos balancea frescura de datos y performance (sin cold fetch en cada visita).

**Alternatives considered**:
- Payload Local API (co-located): descartada porque el frontend y el CMS están en plataformas separadas.
- `cache: 'no-store'` (SSR por request): descartada por costo de latencia en cada visita desde el CDN de Vercel.
- `revalidate: 0` (sin caché): descartada por los mismos motivos que SSR.
- `revalidate: 3600` (1h): demasiado largo para cambios de estado de moto (ej. recién apartada).

**REST API endpoint base**:
```
GET {PAYLOAD_CMS_URL}/api/motos
  ?where[estado][not_equals]=vendida
  &sort=-createdAt
  &limit=100
  &depth=1
```

**Variable de entorno requerida**: `PAYLOAD_CMS_URL` (ej. `https://cms.tachosbiker.com`)

---

## Decision 2: Estrategia de Filtrado

**Decision**: Filtrado cliente-side con React state (sin parámetros de URL en Fase 1)

**Rationale**: Con ~10 motos, cargar el catálogo completo en memoria del cliente y filtrar con JavaScript es instantáneo (<1ms) y no requiere round-trip al servidor. Simplifica la implementación considerablemente.

**Alternatives considered**:
- URL search params (`?disponibilidad=disponible&precioMax=50000`): más avanzado, permite URLs compartibles de búsquedas filtradas. Viable pero agrega complejidad de parsing/serialización innecesaria para Fase 1 con 10 ítems.
- Filtrado server-side en fetch: descartado porque ISR cachea la respuesta, así que los filtros necesariamente deben aplicarse en cliente de todos modos.

**Filtros implementados**:
1. Disponibilidad: `disponible | apartada | todos` (select)
2. Tipo: `scooter | sport | naked | custom | todos` (select)
3. Rango de precio: `min`–`max` en MXN (slider o dos inputs)
4. Búsqueda libre: nombre/modelo (text input, match parcial case-insensitive)

---

## Decision 3: Integración WhatsApp

**Decision**: Botón flotante (FAB) con deep link `wa.me/{number}?text={mensaje}`

**Rationale**: La implementación más simple y efectiva: cero dependencias externas, funciona en mobile (abre app) y desktop (abre WhatsApp Web). Mensaje predefinido contextual ayuda al cliente a iniciar la conversación con info útil.

**Deep link format**:
```
https://wa.me/52{phone}?text=Hola!%20Vi%20el%20cat%C3%A1logo%20de%20Tachos%20Biker%20y%20me%20interesa%20una%20moto
```

En la ficha de moto, el mensaje incluye el nombre del modelo:
```
https://wa.me/52{phone}?text=Hola!%20Me%20interesa%20la%20moto%20{nombre}%20que%20vi%20en%20su%20cat%C3%A1logo
```

**Variable de entorno requerida**: `NEXT_PUBLIC_WHATSAPP_NUMBER` (solo los dígitos, ej. `5512345678`)

**Alternatives considered**:
- Widget embebido de terceros (Tidio, WATI, Crisp): descartados por costo mensual, peso en bundle y complejidad innecesaria para Fase 1.

---

## Decision 4: Manejo de Imágenes

**Decision**: Next.js `<Image>` component con Cloudinary como remote pattern

**Rationale**: El componente `<Image>` de Next.js optimiza automáticamente (WebP, lazy load, LQIP). Cloudinary (o CDN integrado al CMS) sirve las imágenes con transformaciones. Solo requiere configurar `remotePatterns` en `next.config.ts`.

**Config requerida en `next.config.ts`**:
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
    { protocol: 'https', hostname: '*.railway.app' }  // fallback para Payload media
  ]
}
```

**Imagen de respaldo (placeholder)**: Un SVG genérico de moto servido desde `/public/moto-placeholder.svg` para cuando una imagen no carga.

**Alternatives considered**:
- `<img>` nativo: descartado por la falta de optimización automática y CLS.
- next/image con `unoptimized`: descartado en favor de optimización real.

---

## Decision 5: Renderizado — Server Components vs Client Components

**Decision**: Server Components para páginas y fetch; Client Components solo para interactividad

| Componente | Tipo | Razón |
|------------|------|-------|
| `app/catalogo/page.tsx` | Server Component | Fetch + SEO metadata |
| `app/catalogo/[slug]/page.tsx` | Server Component | Fetch + SEO metadata |
| `components/catalogo/moto-grid.tsx` | Server Component | Solo renderiza, sin estado |
| `components/catalogo/moto-card.tsx` | Server Component | Presentacional puro |
| `components/catalogo/catalogo-filters.tsx` | **Client Component** | useState para filtros |
| `components/catalogo/whatsapp-fab.tsx` | **Client Component** | window.open / href externo |
| `components/motos/moto-gallery.tsx` | **Client Component** | useState para imagen activa |
| `components/motos/moto-specs.tsx` | Server Component | Tabla presentacional |
| `components/motos/apartar-cta.tsx` | Server Component | Solo visual en esta feature |

**Pattern**: `page.tsx` hace el fetch y pasa datos como props a los componentes. Los Client Components reciben datos serializados como props — nunca hacen fetch propio.

---

## CodeGraph — Actualización para este feature

Módulos nuevos registrados (Principio VI):

| Módulo | Capa | Propietario | Depende de | Estado |
|--------|------|-------------|------------|--------|
| Catálogo (listado + filtros) | UI → Servicios | Equipo dev | lib/payload/motos.ts, Payload CMS REST API | Por implementar |
| Ficha de moto | UI → Servicios | Equipo dev | lib/payload/motos.ts | Por implementar |
| lib/payload/motos.ts | Servicios → Infraestructura | Equipo dev | Payload CMS REST API | Por implementar |
| WhatsApp FAB | UI | Equipo dev | Externo (wa.me deep link) | Por implementar |

Flujo de dependencias (unidireccional, sin ciclos):
```
app/catalogo/page.tsx (UI)
  → lib/payload/motos.ts (Servicios)
    → Payload CMS REST API (Infraestructura)
```
