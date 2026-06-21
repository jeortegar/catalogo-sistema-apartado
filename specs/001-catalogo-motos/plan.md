# Implementation Plan: Catálogo de Motos en Venta

**Branch**: `001-catalogo-motos` | **Date**: 2026-06-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-catalogo-motos/spec.md`

## Summary

Catálogo público de motos para Tachos Biker: listado con filtros, ficha de detalle, y botón flotante de WhatsApp. El frontend (Next.js App Router, Vercel) consume datos de Payload CMS vía REST API usando ISR con revalidación de 60 segundos. El filtrado es cliente-side dado el volumen de ~10 SKUs. La feature cubre M1, M3, M4 y M9 del alcance comprometido.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16.2.6 (App Router)

**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS 4, shadcn/ui (Radix UI), lucide-react, clsx, class-variance-authority

**Storage**: Payload CMS (self-hosted, Railway) como fuente de datos. El catálogo es de solo lectura — sin escrituras en DB desde el frontend.

**Testing**: `tsc --noEmit` (typecheck), `eslint` (lint). Sin test runner instalado aún.

**Target Platform**: Web — mobile-first (>70% tráfico móvil), responsive desktop. Hospedado en Vercel.

**Project Type**: Web application — Next.js App Router con Server Components y rutas de página.

**Performance Goals**: Catálogo visible en <3 segundos en 4G (SC-002). LCP <2.5s objetivo.

**Constraints**: Español (México), MXN. Sin paginación (≤10 motos). Sin autenticación en el frontend público. Budget <$50k MXN, plazo <1 mes.

**Scale/Scope**: ~10 motos, usuarios anónimos, lectura pura (sin carrito, sin auth).

## Constitution Check

*GATE: Verificado antes de Phase 0. Re-verificado post-diseño.*

| Principio | Estado | Detalle |
|-----------|--------|---------|
| I — Catálogo + Apartado (no e-commerce) | ✅ PASS | Solo catálogo de lectura. Sin carrito, sin compra online. |
| II — Mobile-First y Tono Juvenil | ✅ PASS | Tailwind mobile-first. Referencia visual Suzuki MX hasta recibir identidad (S3 pendiente). |
| III — Integridad del Sistema de Apartado | ✅ PASS | El catálogo solo lee el estado. No crea ni modifica apartados. |
| IV — Administración Sin Código | ✅ PASS | Todo el contenido se gestiona en Payload CMS. Sin deploy por cambio de contenido. |
| V — Cumplimiento y Confianza | ✅ PASS | Botón WhatsApp incluido (FR-010). Sin captura de datos personales en el catálogo. |
| VI — CodeGraph | ✅ PASS | Módulos registrados en research.md. Flujo unidireccional: UI → lib/payload → CMS REST API. Sin ciclos. |

**Post-diseño check**: Conforme. Ver tabla CodeGraph actualizada en [research.md](research.md).

## Project Structure

### Documentation (this feature)

```text
specs/001-catalogo-motos/
├── plan.md              ← este archivo
├── research.md          ← Phase 0 (decisiones técnicas)
├── data-model.md        ← Phase 1 (schema Payload CMS + tipos TypeScript)
├── quickstart.md        ← Phase 1 (guía de validación end-to-end)
├── contracts/
│   └── catalog-data-contract.md   ← Phase 1 (shape de datos CMS → UI)
└── tasks.md             ← Phase 2 (/speckit-tasks — aún no creado)
```

### Source Code

```text
app/
├── catalogo/
│   ├── page.tsx                  # Página de listado del catálogo (Server Component, ISR)
│   └── [slug]/
│       └── page.tsx              # Ficha de detalle de moto (Server Component, ISR)

components/
├── catalogo/
│   ├── moto-card.tsx             # Tarjeta de moto para el listado
│   ├── moto-grid.tsx             # Grid/listado contenedor
│   ├── catalogo-filters.tsx      # Barra de filtros cliente-side (Client Component)
│   ├── catalogo-empty.tsx        # Estado vacío del catálogo
│   └── whatsapp-fab.tsx          # Botón flotante de WhatsApp (Client Component)
└── motos/
    ├── moto-gallery.tsx          # Galería navegable de imágenes (Client Component)
    ├── moto-specs.tsx            # Tabla de especificaciones técnicas
    └── apartar-cta.tsx           # CTA de apartado (visual/placeholder en esta feature)

lib/
├── payload/
│   ├── client.ts                 # Base URL + fetch helper con revalidación ISR
│   └── motos.ts                  # getMotosCatalogo(), getMotoBySlug()
└── types/
    └── moto.ts                   # Tipos TypeScript derivados del data-model
```

**Structure Decision**: Next.js App Router con Server Components para fetch y renderizado inicial (SEO + performance). Client Components únicamente donde se requiere interactividad (filtros, galería, WhatsApp FAB). Separación UI → `lib/payload` → CMS REST API alineada con Principio VI (CodeGraph).

## Complexity Tracking

> Sin violaciones al Constitution Check. No aplica.
