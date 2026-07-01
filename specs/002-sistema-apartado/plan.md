# Implementation Plan: Sistema de Apartado de Motos

**Branch**: `002-sistema-apartado` | **Date**: 2026-06-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-sistema-apartado/spec.md`

## Summary

Sistema de apartado de motos para Grupo Velmot: el cliente completa un formulario de datos de contacto, acepta el aviso de privacidad (LFPDPPP), y es redirigido a Conekta Hosted Checkout para pagar el monto de apartado configurado globalmente (default $1,000 MXN). Al confirmarse el pago (vía redirect + webhook), el sistema actualiza automáticamente el estado de la moto a "Apartada" en Payload CMS e invalida el caché de Next.js. El admin gestiona estados de moto manualmente y configura el monto desde el panel de Payload. La feature cubre M5, M6 y M7 del alcance comprometido.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16.2.6 (App Router)

**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Payload CMS (ya instalado), `@conekta/conekta-node` (SDK oficial de Conekta para Node.js)

**Storage**: Payload CMS (PostgreSQL en Railway) — colección `apartados` + Global `configuracion-apartado`. No se agrega ninguna conexión a base de datos adicional.

**Testing**: `tsc --noEmit` (typecheck), `eslint` (lint). Sin test runner instalado.

**Target Platform**: Web — mobile-first (>70% tráfico móvil), Vercel. El Hosted Checkout de Conekta es responsive por defecto.

**Project Type**: Web application — Next.js App Router. Flujo transaccional: Server Action → Conekta API → Hosted Checkout → Webhook/Redirect → State Update.

**Performance Goals**: Flujo de apartado completo en <3 minutos (SC-001). Estado de moto actualizado en <30 segundos post-pago (SC-002). ISR revalidation via `revalidatePath`.

**Constraints**: Solo español (México), solo MXN. Flujo single-item (sin carrito). Sin notificaciones por email/WhatsApp (Fase 1). Conekta en modo prueba para desarrollo.

**Scale/Scope**: ~10 motos, ~10 apartados/mes. Carga concurrente mínima — race condition prevention via DB constraint en Payload, no se requiere distributed locking.

## Constitution Check

*GATE: Verificado antes de Phase 0. Re-verificado post-diseño.*

| Principio | Estado | Detalle |
|-----------|--------|---------|
| I — Catálogo + Apartado (no e-commerce) | ✅ PASS | Cobro único fijo de apartado. Sin carrito, sin compra completa, sin MSI. |
| II — Mobile-First y Tono Juvenil | ✅ PASS | Formulario de apartado responsive con Tailwind. Hosted Checkout de Conekta es mobile-ready. |
| III — Integridad del Sistema de Apartado | ✅ PASS | Cambio automático a "Apartada" al confirmarse pago (webhook + redirect). Admin puede cambiar manualmente. Monto global configurable desde panel. |
| IV — Administración Sin Código | ✅ PASS | Estado de moto y monto de apartado gestionados desde Payload CMS admin. Sin deploy para cambiar config. |
| V — Cumplimiento y Confianza | ✅ PASS | Aviso LFPDPPP en formulario con aceptación explícita. Conekta PCI-DSS. Sin almacenamiento de datos de tarjeta. |
| VI — CodeGraph | ✅ PASS | Módulos registrados en research.md. Flujo UI → Server Action → Conekta/Payload. Sin ciclos. |

**Post-diseño check**: Conforme. Ver tabla CodeGraph actualizada en [research.md](research.md).

## Project Structure

### Documentation (this feature)

```text
specs/002-sistema-apartado/
├── plan.md                       ← este archivo
├── research.md                   ← Phase 0 (decisiones técnicas)
├── data-model.md                 ← Phase 1 (schema Payload + relaciones)
├── quickstart.md                 ← Phase 1 (guía validación end-to-end)
├── contracts/
│   └── apartado-api-contract.md  ← Phase 1 (Server Actions, webhook, Conekta API)
└── tasks.md                      ← Phase 2 (/speckit-tasks — aún no creado)
```

### Source Code

```text
app/
├── apartar/
│   └── [slug]/
│       ├── page.tsx              # Formulario datos contacto + aviso LFPDPPP (Server + Client Component)
│       ├── exito/
│       │   └── page.tsx          # Pantalla confirmación post-pago exitoso (Server Component, ISR)
│       └── error/
│           └── page.tsx          # Pantalla error / pago fallido (Server Component)
└── api/
    └── conekta/
        └── webhook/
            └── route.ts          # Endpoint webhook de Conekta (POST, raw body requerido)

cms/
├── collections/
│   └── Apartados.ts              # Colección Apartado en Payload CMS (campos + hooks + validaciones)
└── globals/
    └── ConfiguracionApartado.ts  # Global singleton ConfiguraciónApartado (montoApartado)

components/
└── motos/
    ├── apartar-cta.tsx           # CTA botón (actualizar: mostrar monto dinámico desde Global)
    └── apartar-form.tsx          # Formulario datos contacto + checkbox LFPDPPP (nuevo, Client Component)

lib/
├── conekta/
│   ├── client.ts                 # Conekta SDK init + createCheckoutOrder()
│   └── webhook.ts                # verifyWebhookSignature(rawBody, signature)
├── apartado/
│   ├── actions.ts                # Server Action: iniciarApartado(formData)
│   └── confirm.ts                # confirmarApartado(orderId, apartadoId) — idempotente
└── payload/
    └── apartados.ts              # getConfiguracionApartado(), createApartado(), updateApartadoEstado()
```

**Structure Decision**: Next.js App Router con Server Actions para el flujo de apartado (sin API routes propias excepto el webhook). El webhook es una Route Handler separada porque necesita raw body para verificar la firma HMAC. Separación estricta en capas: UI → lib/apartado/actions → lib/conekta + lib/payload/apartados → CMS/Conekta. Sin ciclos de dependencia. Alineado con Principio VI.

## Complexity Tracking

> Sin violaciones al Constitution Check. No aplica.
