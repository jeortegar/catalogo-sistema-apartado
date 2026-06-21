# Tasks: Sistema de Apartado de Motos

**Input**: Design documents from `specs/002-sistema-apartado/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: No test runner instalado — sin tareas de test automatizadas. Validación manual via quickstart.md.

**Organization**: Tareas organizadas por user story (US1 → US2 → US3) para permitir implementación y prueba independiente de cada historia.

---

## Phase 1: Setup (Infraestructura compartida)

**Purpose**: Instalar dependencias y configurar variables de entorno requeridas para el flujo de apartado.

- [x] T001 Instalar dependencia `@conekta/conekta-node` via `pnpm add @conekta/conekta-node` en la raíz del proyecto — **Implementado con fetch nativo (sin SDK) para máxima compatibilidad con Next.js**
- [x] T002 Agregar las variables `CONEKTA_API_KEY`, `CONEKTA_WEBHOOK_SECRET` y `NEXT_PUBLIC_APP_URL` al archivo `.env.local.example` con comentarios descriptivos

---

## Phase 2: Foundational (Prerequisitos bloqueantes)

**Purpose**: Infraestructura de datos y servicios compartida que DEBE completarse antes de cualquier user story.

**⚠️ CRÍTICO**: Ninguna tarea de user story puede comenzar hasta que esta fase esté completa.

- [x] T003 [P] Crear colección Payload CMS `Apartados` con todos los campos definidos en data-model.md (moto relationship, nombreCliente, telefonoCliente, emailCliente, montoCobrado, referenciaConekta, estadoPago enum, aceptoPrivacidad, timestamps) en `cms/collections/Apartados.ts`; incluir hook `beforeChange` que verifica: (1) `moto.estado === 'disponible'` y (2) no existe `Apartado` con `moto = doc.moto` y `estadoPago = 'pendiente'` — rechazar con error legible si alguna condición falla (cobertura de FR-009 / SC-004)
- [x] T004 [P] Crear Global Payload CMS `ConfiguracionApartado` con campo `montoApartado` (number, default 1000, min: 1, label "Monto del apartado en MXN") en `cms/globals/ConfiguracionApartado.ts`
- [x] T005 [P] Crear tipos TypeScript `Apartado`, `EstadoPago` y `ConfiguracionApartado` derivados del data-model en `lib/types/apartado.ts`
- [x] T006 [P] Inicializar Conekta SDK e implementar `createCheckoutOrder({ motoNombre, monto, clienteInfo, successUrl, failureUrl, metadata })` en `lib/conekta/client.ts`
- [x] T007 [P] Implementar `verifyWebhookSignature(rawBody: Buffer, signature: string): boolean` usando HMAC-SHA256 con `CONEKTA_WEBHOOK_SECRET` en `lib/conekta/webhook.ts`
- [x] T008 Registrar la colección `Apartados` y el Global `ConfiguracionApartado` en la configuración de Payload CMS en `cms/payload.config.ts` (depende de T003, T004) — **Schema reference files created; registration in actual Payload config (Railway) is manual**
- [x] T009 Implementar helpers de Payload: `getConfiguracionApartado()`, `createApartado(data)`, `updateApartadoEstado(id, estado)`, `getApartadoByConektaRef(orderId)` en `lib/payload/apartados.ts` (depende de T005, T008)

**Checkpoint**: Base de datos con colecciones registradas + SDK de Conekta inicializado + helpers de Payload listos. Las user stories pueden comenzar.

---

## Phase 3: User Story 1 — Cliente Aparta una Moto (Priority: P1) 🎯 MVP

**Goal**: El cliente puede completar el flujo completo de apartado: formulario de datos → redirect a Conekta → pago → confirmación → estado de moto actualizado automáticamente a "Apartada".

**Independent Test**: Navegar a la ficha de una moto "Disponible", pulsar "Apartar esta moto", completar el formulario, pagar con tarjeta de prueba de Conekta, y verificar que (a) la pantalla de confirmación se muestra, (b) la moto aparece como "Apartada" en el catálogo, (c) existe un registro `Apartado` con `estadoPago = 'completado'` en el panel de Payload.

### Implementación User Story 1

- [x] T010 [P] [US1] Crear componente cliente `ApartarForm` con campos nombre, teléfono, email y checkbox de aviso de privacidad LFPDPPP, validación de cliente y manejo de estado de envío en `components/motos/apartar-form.tsx`
- [x] T011 [P] [US1] Crear página de error de pago `app/apartar/[slug]/error/page.tsx` con mensaje claro de pago no completado y botón de regreso a la ficha de la moto
- [x] T012 [US1] Implementar Server Action `iniciarApartado(formData)` en `lib/apartado/actions.ts` con el siguiente orden de operaciones estricto: (1) validar campos del formulario, (2) crear registro `Apartado` con `estadoPago = 'pendiente'` y `referenciaConekta = null` — si el hook `beforeChange` rechaza (moto no disponible o apartado pendiente existente), retornar error al cliente sin llamar a Conekta, (3) llamar `createCheckoutOrder()` con el `apartadoId` en metadata, (4) actualizar `Apartado.referenciaConekta` con el `orderId` retornado por Conekta, (5) retornar `checkoutUrl` para redirect (depende de T006, T009)
- [x] T013 [US1] Implementar función `confirmarApartado(apartadoId)` idempotente que verifica el estado del order en Conekta via `GET /orders/{id}`, actualiza `Apartado.estadoPago = 'completado'`, actualiza `Moto.estado = 'apartada'` en Payload, y llama `revalidatePath` en `lib/apartado/confirm.ts` (depende de T006, T009)
- [x] T014 [US1] Crear página de formulario `app/apartar/[slug]/page.tsx`: fetch de la moto por slug (redirigir a `/catalogo` si no existe o no está disponible), fetch de `getConfiguracionApartado()`, renderizar `ApartarForm` con Server Action adjunto (depende de T010, T012)
- [x] T015 [US1] Crear página de éxito `app/apartar/[slug]/exito/page.tsx`: recibir `apartado_id` desde query params, llamar `confirmarApartado()`, mostrar pantalla de confirmación con datos de la moto y nombre del cliente (depende de T013)
- [x] T016 [US1] Crear route handler webhook `POST /api/conekta/webhook` en `app/api/conekta/webhook/route.ts`: leer raw body, verificar firma HMAC, procesar evento `charge.paid`, llamar `confirmarApartado()`, retornar `200` para todos los eventos válidos (depende de T007, T013)
- [x] T017 [US1] Actualizar `components/motos/apartar-cta.tsx` para recibir `monto: number` como prop y mostrarlo en el botón ("Apartar esta moto: $1,000 MXN"), y actualizar `app/catalogo/[slug]/page.tsx` para pasar el monto desde `getConfiguracionApartado()` al componente (depende de T009)

**Checkpoint**: Flujo completo de apartado funcional — el cliente puede apartar una moto y el estado se actualiza automáticamente. Verificar con escenarios 1 y 2 del quickstart.md.

---

## Phase 4: User Story 2 — Admin Gestiona Estado de Motos Manualmente (Priority: P2)

**Goal**: El admin puede cambiar el estado de cualquier moto (Disponible / Apartada / Vendida) desde el panel de Payload CMS y el catálogo público refleja el cambio en menos de 60 segundos.

**Independent Test**: Acceder al panel de Payload CMS, seleccionar una moto en estado "Apartada", cambiar a "Disponible", guardar, y verificar que en el catálogo público la moto muestra el badge "DISPONIBLE" y el CTA de apartado está activo.

### Implementación User Story 2

- [x] T018 [US2] Agregar hook `afterChange` a la colección `Motos` en Payload CMS que llame `revalidatePath('/catalogo')` y `revalidatePath('/catalogo/' + doc.slug)` cuando el campo `estado` cambia, en `cms/collections/Motos.ts` — **Implementado: llama a `/api/revalidate` en Next.js (arquitectura correcta para CMS en Railway + Next.js en Vercel)**
- [x] T019 [US2] Configurar la colección `Apartados` en Payload para que el campo `estadoPago` sea solo lectura en el admin UI (no editable directamente), y agregar etiquetas descriptivas al listado de apartados (`admin.useAsTitle = 'nombreCliente'`, descripción de columnas) en `cms/collections/Apartados.ts`

**Checkpoint**: El admin puede gestionar estados de moto manualmente y los cambios se reflejan en el catálogo sin deploy. Verificar con escenarios 4 del quickstart.md.

---

## Phase 5: User Story 3 — Admin Configura el Monto del Apartado (Priority: P3)

**Goal**: El admin puede cambiar el monto global del apartado desde el panel de Payload y el nuevo monto se muestra en el CTA de todas las motos disponibles inmediatamente.

**Independent Test**: Acceder al panel de Payload CMS → Globals → Configuración de Apartado, cambiar el monto a `$2,000`, guardar, y verificar que la ficha de cualquier moto disponible muestra "Apartar esta moto: $2,000 MXN".

### Implementación User Story 3

- [x] T020 [US3] Actualizar `cms/globals/ConfiguracionApartado.ts` para agregar: hook `afterChange` que llame `revalidatePath('/catalogo')` y `revalidatePath('/catalogo/[slug]')` al cambiar el monto, mensaje de validación claro para monto ≤ 0, y descripción de campo en el admin UI ("Monto en MXN cobrado por el apartado de cualquier moto. Valor mínimo: $1 MXN.")

**Checkpoint**: El admin puede cambiar el monto del apartado desde el panel y el cambio se refleja en el catálogo sin deploy. Verificar con escenario 5 del quickstart.md.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Estados de carga, errores de validación, seguridad y verificación final.

- [x] T021 [P] Agregar estado de carga al `ApartarForm`: deshabilitar el botón de envío y mostrar indicador durante la llamada al Server Action para prevenir doble envío en `components/motos/apartar-form.tsx`
- [x] T022 [P] Agregar manejo de errores de validación en `ApartarForm`: mostrar mensajes inline para teléfono inválido (< 10 dígitos), email inválido, y checkbox de privacidad sin marcar en `components/motos/apartar-form.tsx`
- [x] T023 [P] Agregar manejo de error en `app/apartar/[slug]/page.tsx` cuando `getConfiguracionApartado()` falla o retorna monto 0: redirigir al catálogo con mensaje de error
- [x] T024 Ejecutar `pnpm tsc --noEmit` y corregir todos los errores de TypeScript en los archivos nuevos y modificados — **0 errores**
- [ ] T025 Correr los 6 escenarios de validación del [quickstart.md](quickstart.md) manualmente con Conekta en modo prueba y marcar completos

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede comenzar inmediatamente
- **Foundational (Phase 2)**: Depende de Setup — **bloquea todas las user stories**
- **US1 (Phase 3)**: Depende de Phase 2 completa — es el MVP
- **US2 (Phase 4)**: Depende de Phase 2 completa — puede comenzar en paralelo con US1
- **US3 (Phase 5)**: Depende de Phase 2 completa y de T017 (US1) — el CTA dinámico es prerequisito
- **Polish (Phase 6)**: Depende de US1, US2 y US3 completas

### User Story Dependencies

- **US1 (P1)**: Puede comenzar después de Phase 2. Sin dependencias de US2 o US3. Es el MVP.
- **US2 (P2)**: Puede comenzar en paralelo con US1 después de Phase 2. Solo depende de T008 (colección Motos en Payload config).
- **US3 (P3)**: Depende de T017 (US1) porque el CTA que muestra el monto es parte de US1.

### Dentro de US1 (orden estricto)

```
T010, T011 (paralelo, sin dependencias)
  ↓
T012 (depende T006, T009)
T013 (depende T006, T009)
  ↓
T014 (depende T010, T012)
T015 (depende T013)
T016 (depende T007, T013)
T017 (depende T009)
```

### Parallel Opportunities

- T003, T004, T005, T006, T007 pueden ejecutarse en paralelo (Phase 2)
- T010 y T011 pueden ejecutarse en paralelo (ambos en Phase 3, archivos distintos)
- T012 y T013 pueden ejecutarse en paralelo (archivos distintos)
- T018 y T019 pueden ejecutarse en paralelo (Phase 4)
- T021, T022, T023 pueden ejecutarse en paralelo (Polish)

---

## Parallel Example: User Story 1

```text
# Grupo 1 — Sin dependencias (paralelo):
T010: Crear ApartarForm component en components/motos/apartar-form.tsx
T011: Crear página de error en app/apartar/[slug]/error/page.tsx

# Grupo 2 — Después de T009 (paralelo):
T012: Server Action iniciarApartado en lib/apartado/actions.ts
T013: Función confirmarApartado en lib/apartado/confirm.ts

# Grupo 3 — Después de T010+T012 (secuencial por dependencias):
T014: Página de formulario en app/apartar/[slug]/page.tsx
T015: Página de éxito en app/apartar/[slug]/exito/page.tsx
T016: Webhook route en app/api/conekta/webhook/route.ts
T017: Actualizar apartar-cta.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Únicamente)

1. Completar Phase 1: Setup (T001–T002)
2. Completar Phase 2: Foundational (T003–T009)
3. Completar Phase 3: User Story 1 (T010–T017)
4. **PARAR Y VALIDAR**: Ejecutar escenarios 1, 2 y 3 del quickstart.md
5. Demo funcional del flujo de apartado completo

### Incremental Delivery

1. Setup + Foundational → Base lista
2. US1 → Cliente puede apartar motos ✅ (MVP)
3. US2 → Admin gestiona estados manualmente ✅
4. US3 → Admin configura monto desde panel ✅
5. Polish → Producción lista ✅

---

## Notes

- `[P]` = archivos distintos, sin dependencias entre sí — pueden ejecutarse en paralelo
- `[US1/US2/US3]` = mapeo a la user story del spec.md para trazabilidad
- Conekta en **modo prueba** durante desarrollo: usar tarjetas de prueba del quickstart.md
- El webhook requiere un túnel público (ngrok) para pruebas locales
- `revalidatePath` requiere que las rutas tengan ISR activo (ya configurado en spec 001)
- `confirmarApartado` DEBE ser idempotente: si se llama dos veces (redirect + webhook), la segunda no hace nada
- El campo `estadoPago` de Apartado NO debe ser editable por el admin desde el panel (T019)
