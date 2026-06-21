# Research: Sistema de Apartado de Motos

**Feature**: 002-sistema-apartado | **Date**: 2026-06-21

## Decision 1: Integración Conekta Hosted Checkout en Next.js App Router

**Decision**: Usar Conekta Checkout Sessions (API REST) desde un Server Action de Next.js. El Server Action llama al endpoint `POST /orders` de Conekta con `checkout.type = "HostedPayment"` y recibe una URL de pago. El cliente es redirigido a esa URL.

**Rationale**:
- Las Server Actions de Next.js App Router son el punto natural para llamadas API que requieren secretos (API key de Conekta nunca expuesta al cliente).
- Hosted Checkout elimina la necesidad de manejar el formulario de tarjeta dentro del sitio — Conekta es el responsable PCI, el sitio solo recibe la confirmación.
- Conekta soporta `success_url` y `failure_url` para el redirect de regreso al sitio.

**Flujo concreto**:
```
Cliente → pulsa CTA → form datos → Server Action:
  1. Validate datos de contacto
  2. Check moto.estado === 'disponible' (prevención race condition)
  3. Create Apartado record con estado 'pendiente' en Payload CMS
  4. Call Conekta API: POST /orders con moto, monto, success_url, failure_url
  5. Return Conekta checkout URL
→ Redirect a Conekta
→ Cliente paga
→ Conekta redirect a success_url?order_id=xxx
→ Server verifica estado del order via GET /orders/{id}
→ Si exitoso: update Apartado → 'completado' + Moto → 'apartada'
→ Mostrar pantalla confirmación
```

**Webhook también activo**: Conekta envía webhook `charge.paid` como segunda línea de confirmación. Esto garantiza que si el redirect falla (usuario cierra ventana antes del redirect), el estado igual se actualiza.

**Alternativas consideradas**:
- Conekta.js (embebido): requiere manejo del formulario de tarjeta en el sitio, mayor complejidad PCI (SAQ-D vs. SAQ-A). Descartado.
- Stripe: mejor DX pero Conekta fue elegido por el cliente.

---

## Decision 2: Prevención de Race Conditions

**Decision**: Doble barrera — constraint de unicidad en DB + verificación transaccional en Server Action.

**Rationale**:
- Payload CMS usa PostgreSQL; podemos definir un índice único en la colección Apartado sobre `(moto, estadoPago)` donde estadoPago = 'pendiente'. Esto garantiza que solo puede existir un apartado pendiente por moto a nivel de base de datos.
- En el Server Action, adicionalmente verificamos moto.estado antes de crear el Apartado para dar un error de usuario antes de llegar a la DB.
- Si dos requests llegan simultáneamente: el primero pasa la verificación y crea el Apartado pendiente; el segundo falla en el constraint de DB con un error claro.

**Implementación**: Hook `beforeChange` en la colección Apartado de Payload que verifica:
1. `moto.estado === 'disponible'`
2. No existe un Apartado con `moto = X` y `estadoPago = 'pendiente'`

**Alternativas consideradas**:
- `SELECT FOR UPDATE`: requiere acceso a PostgreSQL raw, fuera del patrón Payload CMS. Descartado.
- Optimistic locking (campo `version` en Moto): más complejo y requiere campo adicional. Descartado.

---

## Decision 3: Verificación de Webhooks de Conekta

**Decision**: Verificar la firma HMAC-SHA256 del webhook en el endpoint `/api/conekta/webhook/route.ts` antes de procesar cualquier evento.

**Rationale**: Sin verificación de firma, cualquier actor externo podría enviar un webhook falso simulando un pago exitoso y obtener una moto apartada gratis. Conekta incluye un header `Conekta-Signature` con cada webhook.

**Algoritmo**:
```
1. Obtener el raw body del request (antes de parsear JSON)
2. Compute HMAC-SHA256(rawBody, CONEKTA_WEBHOOK_SECRET)
3. Comparar con Conekta-Signature header (timing-safe comparison)
4. Si no coincide: return 401
5. Si coincide: procesar evento
```

**Variables de entorno requeridas**:
- `CONEKTA_API_KEY` — API key privada de Conekta (solo servidor)
- `CONEKTA_WEBHOOK_SECRET` — secreto de webhook de Conekta
- `NEXT_PUBLIC_CONEKTA_PUBLIC_KEY` — key pública para referencia (si fuera necesario)

---

## Decision 4: Storage de Apartado y ConfiguraciónApartado

**Decision**: Usar Payload CMS Collections y Globals para todo el storage relacionado con apartados.

**Rationale**:
- Payload CMS ya está en uso como infraestructura (feature 001). Agregar colecciones de Apartado y un Global de ConfiguraciónApartado mantiene toda la lógica de datos en un solo sistema.
- El admin puede ver y editar apartados directamente en el panel de Payload sin necesidad de UI adicional (cumple FR-015 y FR-011 de forma gratuita).
- Payload Globals son perfectos para configuraciones singleton como el monto del apartado (FR-012).
- Evita gestionar una segunda conexión PostgreSQL desde Next.js.

**Estructura en Payload**:
- **Collection `apartados`**: registros de cada reserva con campos: moto (relationship), nombre/telefono/email cliente, montoCobrado, referenciaConekta, estadoPago enum, aceptoPrivacidad boolean, timestamps.
- **Global `configuracion-apartado`**: singleton con campo `montoApartado` (number, default 1000, validation >0).

**Alternativas consideradas**:
- PostgreSQL directo con Drizzle/Prisma: introduce una segunda ORM y conexión DB. Más flexible pero innecesariamente complejo dado que Payload ya gestiona PostgreSQL.
- Variables de entorno para el monto: no permite edición desde el panel admin. Descartado (viola IV — Administración Sin Código).

---

## Decision 5: Confirmación del Estado del Pago (Redirect vs. Webhook)

**Decision**: Doble mecanismo — verificación activa en success_url + webhook como respaldo.

**Rationale**:
- Al regresar a `success_url?order_id=xxx`, el servidor hace una llamada GET a Conekta para verificar el estado real del order (no confiar ciegamente en el redirect).
- El webhook `charge.paid` actúa como respaldo para casos donde el redirect falla (usuario cierra ventana, timeout de red).
- Esto garantiza que el cambio de estado es idempotente: si ambos llegan (redirect + webhook), el segundo encuentra el Apartado ya en estado 'completado' y no hace nada.

**Idempotencia**: La operación de confirmar un apartado DEBE ser idempotente — verificar `apartado.estadoPago !== 'completado'` antes de actualizar Moto y Apartado.

---

## Decision 6: Actualización del Estado de Moto Post-Pago

**Decision**: Actualizar `moto.estado` a 'apartada' directamente via Payload CMS Local API (server-side) al confirmar el pago, sin requerir revalidación manual del catálogo.

**Rationale**:
- Payload CMS expone una Local API que puede llamarse desde Server Actions y API Routes sin pasar por HTTP.
- Al actualizar `moto.estado` via Payload Local API, ISR de Next.js detecta el cambio y revalida las páginas afectadas en el siguiente acceso (o con `revalidatePath`/`revalidateTag` explícito).
- Llamar `revalidatePath('/catalogo')` y `revalidatePath('/catalogo/[slug]')` después de confirmar el pago garantiza que el catálogo público se actualice en <30 segundos (SC-002).

**Alternativas consideradas**:
- Webhook a Vercel para revalidación: complejo. Descartado.
- Polling desde el cliente: mala UX. Descartado.

---

## CodeGraph — Módulos Nuevos (actualización Apéndice B)

| Módulo / Integración | Capa | Propietario | Depende de | Estado |
|---|---|---|---|---|
| Flujo de Apartado (form + redirect) | UI → Servicios | Equipo dev | Conekta, Payload CMS | Por implementar |
| Webhook de Conekta | Servicios → Infraestructura | Equipo dev | Conekta, Payload CMS | Por implementar |
| Colección `apartados` (Payload) | Infraestructura | Equipo dev | PostgreSQL vía Payload | Por implementar |
| Global `configuracion-apartado` (Payload) | Infraestructura | Equipo dev | PostgreSQL vía Payload | Por implementar |
| Conekta (Hosted Checkout) | Infraestructura | Conekta | Externo / PCI-DSS | Por implementar |
