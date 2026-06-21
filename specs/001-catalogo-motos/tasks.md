# Tasks: Catálogo de Motos en Venta

**Input**: Design documents from `specs/001-catalogo-motos/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: No test tasks — no test runner instalado ni solicitado en la spec.

**Organization**: Tareas agrupadas por user story para implementación y validación independiente.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Puede correr en paralelo (archivos distintos, sin dependencias sobre tareas incompletas)
- **[Story]**: User story a la que pertenece la tarea (US1–US4)

---

## Phase 1: Setup (Infraestructura Compartida)

**Purpose**: Configuración inicial del proyecto para que el catálogo pueda funcionar.

- [X] T001 Add `PAYLOAD_CMS_URL` and `NEXT_PUBLIC_WHATSAPP_NUMBER` to `.env.local` and `.env.example`
- [X] T002 Update `next.config.ts` — add `images.remotePatterns` for Cloudinary (`res.cloudinary.com`) and Railway (`*.railway.app`)
- [X] T003 [P] Create `lib/types/moto.ts` — TypeScript types: `EstadoMoto`, `TipoMoto`, `EspecificacionesMoto`, `ImagenMoto`, `Moto`, `MotoCard` per data-model.md
- [X] T004 [P] Add `public/moto-placeholder.svg` — generic motorcycle silhouette SVG for broken image fallback

---

## Phase 2: Foundational (Prerequisitos Bloqueantes)

**Purpose**: CMS configurado + capa de datos lista. DEBE completarse antes de cualquier user story.

**⚠️ CRÍTICO**: Ninguna user story puede comenzar hasta que esta fase esté completa.

- [X] T005 Configure Payload CMS `motos` collection — create collection config file using the schema defined in `specs/001-catalogo-motos/data-model.md`; fields: `nombre`, `slug` (auto), `galeria` (upload array, min 1), `precio` (number), `estado` (select: disponible/apartada/vendida, default: disponible), `especificaciones` group with 7 fields (año, cilindraje, tipo, colores, motor, potencia, peso); register collection in Payload's root config *(fixes FR-011 / Constitution Principio IV)*
- [X] T006 Create `lib/payload/client.ts` — base fetch helper: accepts path + revalidate, prepends `PAYLOAD_CMS_URL`, handles non-OK responses by throwing
- [X] T007 Create `lib/payload/motos.ts` — implement `getMotosCatalogo(): Promise<Moto[]>` (query: `where[estado][not_equals]=vendida&sort=-createdAt&limit=100`) and `getMotoBySlug(slug: string): Promise<Moto | null>` using client from T006; both use `revalidate: 60`
- [X] T008 Add `getMotoSlugs(): Promise<{ slug: string }[]>` to `lib/payload/motos.ts` — query: `where[estado][not_equals]=vendida&limit=100&select[slug]=true`; used by `generateStaticParams` *(C2 fix: extends T007's file, does not recreate it)*

**Checkpoint**: CMS listo + capa de datos completa — las user stories pueden comenzar en paralelo.

---

## Phase 3: User Story 1 — Explorar Catálogo Completo (Priority: P1) 🎯 MVP

**Goal**: El cliente puede ver el listado de todas las motos disponibles/apartadas con foto, nombre, precio y estado.

**Independent Test**: Visitar `/catalogo` y verificar que las motos Disponible y Apartada aparecen; las Vendidas no.

### Implementation for User Story 1

- [X] T009 [P] [US1] Create `components/catalogo/moto-card.tsx` — card showing: hero image (next/image with placeholder fallback on error), nombre, precio formatted as MXN (`Intl.NumberFormat`), colored status badge (verde para `disponible`, amarillo para `apartada`); links to `/catalogo/[slug]`. *Note: estado `vendida` nunca llega aquí — excluida en `getMotosCatalogo` por FR-002.*
- [X] T010 [P] [US1] Create `components/catalogo/catalogo-empty.tsx` — empty state for two scenarios: (A) catalog with no motos at all (message: "Pronto habrá motos disponibles" + WhatsApp inline link using `NEXT_PUBLIC_WHATSAPP_NUMBER`); (B) no filter results (message: "No hay motos con estos filtros" + "Limpiar filtros" reset button). *Note: el WhatsApp FAB (T023) se agrega en Phase 6 y será visible junto a este estado vacío — duplicación intencional aceptada para que el MVP (US1) funcione sin depender de US4.*
- [X] T011 [US1] Create `components/catalogo/moto-grid.tsx` — receives `motos: Moto[]` and `onReset?: () => void`; renders responsive grid of MotoCards; renders CatalogoEmpty variant (A) when no motos at all; renders CatalogoEmpty variant (B) with `onReset` callback when filters yield empty (depends on T009, T010)
- [X] T012 [US1] Create `app/catalogo/page.tsx` — Server Component: calls `getMotosCatalogo()`, passes result to MotoGrid; add `export const revalidate = 60` (depends on T007, T011)
- [X] T013 [US1] Add `generateMetadata` to `app/catalogo/page.tsx` — title: "Catálogo de Motos | Tachos Biker", description SEO en español (depends on T012)

**Checkpoint**: `/catalogo` muestra el listado de motos. US1 completamente funcional e independiente.

---

## Phase 4: User Story 2 — Filtrar y Buscar Motos (Priority: P2)

**Goal**: El cliente puede filtrar motos por disponibilidad, tipo, rango de precio, y búsqueda libre por nombre/modelo.

**Independent Test**: Seleccionar filtro "Solo disponibles" y verificar que solo aparecen motos con estado Disponible.

### Implementation for User Story 2

- [X] T014 [US2] Create `components/catalogo/catalogo-filters.tsx` — `'use client'`; controlled component receiving `filters` state + `onChange` callback + `onReset` callback; UI: select de disponibilidad (Todos/Disponibles/Apartadas), select de tipo (Todos/Scooter/Sport/Naked/Custom), inputs de precio min/max, input de búsqueda libre; **"Limpiar filtros" button visible when any filter is active** — calls `onReset` *(M1 fix)*; no lógica de filtrado aquí
- [X] T015 [US2] Create `components/catalogo/catalogo-client-wrapper.tsx` — `'use client'`; receives `motos: Moto[]`; owns filter state with `useState`; computes `filteredMotos` applying all active filters (case-insensitive text match, range check, enum match); provides `resetFilters` callback; renders `<CatalogoFilters>` + `<MotoGrid motos={filteredMotos} onReset={resetFilters}>` (depends on T011, T014)
- [X] T016 [US2] Update `app/catalogo/page.tsx` — wrap MotoGrid with CatalogoClientWrapper, pass full `motos` array as prop (depends on T012, T015)

**Checkpoint**: Los filtros funcionan cliente-side, incluyendo el reset. US2 funcional e independiente de US3/US4.

---

## Phase 5: User Story 3 — Ver Detalle de una Moto (Priority: P2)

**Goal**: El cliente puede ver la ficha completa de una moto: galería, specs, precio, estado, CTA de apartado y botón de WhatsApp.

**Independent Test**: Navegar a `/catalogo/[slug]` y verificar que muestra galería, 7 especificaciones técnicas, precio, botón "Apartar" si disponible, y botón de WhatsApp.

### Implementation for User Story 3

- [X] T017 [P] [US3] Create `components/motos/moto-gallery.tsx` — `'use client'`; receives `galeria: ImagenMoto[]`; tracks `activeIndex` with useState; renders main image (next/image, fills container) with thumbnail row below; handles single-image case; image error → placeholder
- [X] T018 [P] [US3] Create `components/motos/moto-specs.tsx` — receives `especificaciones?: EspecificacionesMoto`; renders definition list of the 7 fields (Año, Cilindraje, Tipo, Color(es), Motor, Potencia, Peso); omits fields where value is `undefined`/`null`/empty; returns `null` if all fields are absent
- [X] T019 [P] [US3] Create `components/motos/apartar-cta.tsx` — receives `estado: EstadoMoto`; renders prominent "Apartar esta moto" button when `estado === 'disponible'`; renders disabled state + "Esta moto ya fue apartada" when `estado === 'apartada'`; renders nothing when `estado === 'vendida'`
- [X] T020 [P] [US3] Create `components/catalogo/whatsapp-fab.tsx` — `'use client'`; renders fixed-position FAB (bottom-right, z-50); `href` = `https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text={encodedMessage}`; accepts optional `motoNombre?: string` prop to personalize the message; uses `target="_blank" rel="noopener noreferrer"` *(moved from US4 to satisfy US3 Acceptance Scenario 4 — H1 fix)*
- [X] T021 [US3] Create `app/catalogo/[slug]/page.tsx` — Server Component: calls `getMotoBySlug(params.slug)`, calls `notFound()` if null; renders MotoGallery + nombre + precio MXN + MotoSpecs + ApartarCTA + `<WhatsAppFAB motoNombre={moto.nombre} />`; add `export const revalidate = 60` (depends on T007, T017, T018, T019, T020)
- [X] T022 [US3] Add `generateStaticParams` to `app/catalogo/[slug]/page.tsx` — calls `getMotoSlugs()` and returns `{ slug }[]` (depends on T008, T021)
- [X] T023 [US3] Add `generateMetadata` to `app/catalogo/[slug]/page.tsx` — title: `"{nombre} | Tachos Biker"`, description with cilindraje + tipo + precio; fallback title if moto not found (depends on T021)

**Checkpoint**: `/catalogo/[slug]` muestra ficha completa incluyendo WhatsApp FAB. Todos los acceptance scenarios de US3 satisfechos.

---

## Phase 6: User Story 4 — Contactar por WhatsApp (Priority: P3)

**Goal**: El botón flotante de WhatsApp está también visible en la página del catálogo principal.

**Independent Test**: Verificar que el botón flotante de WhatsApp es visible sin scroll en móvil en `/catalogo`.

### Implementation for User Story 4

- [X] T024 [US4] Add `<WhatsAppFAB />` to `app/catalogo/page.tsx` — generic message "Hola! Vi el catálogo de Tachos Biker y me interesa una moto"; uses WhatsAppFAB component created in T020 (depends on T012, T020)

**Checkpoint**: Botón WhatsApp flotante visible en catálogo y ficha. Mensaje contextual en la ficha incluye nombre de la moto.

---

## Phase 7: Polish y Preocupaciones Transversales

**Purpose**: Pulido final que afecta múltiples user stories.

- [X] T025 [P] Fix `lang="en"` → `lang="es"` in `app/layout.tsx` (sitio es en español)
- [X] T026 [P] Add `<link rel="canonical">` and Open Graph meta tags to `generateMetadata` in `app/catalogo/page.tsx` (depends on T013) and `app/catalogo/[slug]/page.tsx` (depends on T023)
- [X] T027 Run `npm run typecheck` — resolve all TypeScript errors across new files
- [X] T028 Run `npm run lint` — resolve all ESLint warnings across new files
- [X] T029 Execute all 7 validation scenarios from `specs/001-catalogo-motos/quickstart.md` and confirm each checklist item passes

---

## Dependencias y Orden de Ejecución

### Dependencias entre Fases

- **Setup (Phase 1)**: Sin dependencias — puede empezar inmediatamente
- **Foundational (Phase 2)**: Depende de Setup — **BLOQUEA todas las user stories**; T005 (CMS) debe completarse antes de T006/T007/T008
- **US1 (Phase 3)**: Depende de Foundational — MVP entregable; T013 depende de T012
- **US2 (Phase 4)**: Depende de US1 — T016 modifica `app/catalogo/page.tsx` creado en T012
- **US3 (Phase 5)**: Depende de Foundational; independiente de US1/US2 (archivos distintos); T021→T022→T023 en secuencia
- **US4 (Phase 6)**: T024 depende de T012 (catalog page) y T020 (FAB component en US3)
- **Polish (Phase 7)**: T026 depende de T013 y T023; T027/T028/T029 dependen de todas las stories

### Dependencias entre User Stories

- **US1 (P1)**: Puede empezar tras Foundational — sin dependencias en otras stories
- **US2 (P2)**: Puede empezar tras US1 — extiende `app/catalogo/page.tsx`; cadena interna: T014 → T015 → T016
- **US3 (P2)**: Puede empezar en paralelo con US1; cadena interna: T017+T018+T019+T020 en paralelo → T021 → T022 → T023
- **US4 (P3)**: Depende de T012 (US1) y T020 (US3) para insertar el FAB en la página de catálogo

### Cadena de modificaciones a `app/catalogo/page.tsx` (L2 fix)

T012 (crea) → T013 (agrega metadata) → T016 (wrap con ClientWrapper) → T024 (agrega FAB) → T026 (extiende metadata con canonical/OG)

### Oportunidades de Paralelismo

- T003 y T004 (Setup): corren en paralelo
- T009, T010 (US1): corren en paralelo
- T014 y T015 (US2): T014 [P] antes de T015
- T017, T018, T019, T020 (US3): corren en paralelo entre sí, y en paralelo con US1+US2
- T025, T026 (Polish): corren en paralelo entre sí

---

## Ejemplo Paralelo: US3

```bash
# Lanzar los 4 componentes de US3 en paralelo:
Task: "Create components/motos/moto-gallery.tsx"          # T017
Task: "Create components/motos/moto-specs.tsx"            # T018
Task: "Create components/motos/apartar-cta.tsx"           # T019
Task: "Create components/catalogo/whatsapp-fab.tsx"       # T020

# Luego (depende de los 4):
Task: "Create app/catalogo/[slug]/page.tsx"               # T021
Task: "Add generateStaticParams"                          # T022
Task: "Add generateMetadata"                              # T023
```

---

## Estrategia de Implementación

### MVP Primero (Solo US1)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational — **incluyendo T005 (CMS collection)**
3. Completar Phase 3: US1 — Explorar Catálogo
4. **PARAR Y VALIDAR**: Probar `/catalogo` con datos reales del CMS
5. Demo / despliegue si está listo

### Entrega Incremental

1. Setup + Foundational → base lista
2. US1 → `/catalogo` funciona → Demo (MVP!)
3. US2 → filtros con reset funcionan → Demo
4. US3 (puede ir en paralelo con US2) → `/catalogo/[slug]` completo con WhatsApp → Demo
5. US4 → WhatsApp FAB también en catálogo → Demo completo
6. Polish → typecheck, lint, validación quickstart → Producción

### Estrategia con Dos Desarrolladores

1. Juntos: Phase 1 (Setup) + Phase 2 (Foundational)
2. En paralelo:
   - Dev A: US1 (catalog listing) → luego US2 (filters + reset)
   - Dev B: US3 (moto detail page + WhatsApp FAB component) — archivos distintos
3. Juntos: US4 (agrega FAB al catálogo) + Polish

---

## Notas

- [P] = archivos distintos, sin dependencias pendientes
- [Story] mapea la tarea a una user story específica para trazabilidad
- Cada user story es completable e independientemente testeable al finalizar su fase
- Hacer commit tras cada tarea o grupo lógico
- Parar en cada checkpoint para validar la story independientemente
- US2 y US3 pueden desarrollarse en paralelo (equipo de 2) después de US1/Foundational

## Remediation Log (speckit-analyze 2026-06-18)

- **C1**: T005 agregado — Payload CMS `motos` collection setup (FR-011 / Principio IV)
- **C2**: T008 cambió de "Create" a "Add function to" `lib/payload/motos.ts`
- **H1**: WhatsApp FAB component (T020) movido a Phase 5 (US3); T021 lo integra en detail page; US3 checkpoint actualizado
- **M1**: T014 (CatalogoFilters) incluye "Limpiar filtros" reset button; T011 (MotoGrid) recibe `onReset` prop; T010 (CatalogoEmpty) maneja dos variantes (sin motos / sin resultados)
- **M2**: T010 documenta la duplicación intencional (inline link en empty state + FAB); acepta doble punto de entrada a WhatsApp cuando catálogo está vacío
- **L2**: Cadena explícita de modificaciones a `app/catalogo/page.tsx` documentada en Dependencies section
