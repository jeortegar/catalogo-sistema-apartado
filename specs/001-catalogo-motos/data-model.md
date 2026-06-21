# Data Model: Catálogo de Motos en Venta

**Feature**: 001-catalogo-motos | **Date**: 2026-06-18

## Colección Payload CMS: `motos`

Esta colección es la fuente de verdad de todo el catálogo. El admin la gestiona desde el panel de Payload CMS.

### Campos

| Campo | Tipo Payload | Requerido | Descripción |
|-------|-------------|-----------|-------------|
| `nombre` | `text` | ✅ | Nombre/modelo de la moto, ej. "Suzuki GSX-S125" |
| `slug` | `text` (auto) | ✅ | URL slug generado desde `nombre`. Único. |
| `galeria` | `array` of `upload` | ✅ (min 1) | Imágenes de la moto. La primera es la imagen principal. |
| `precio` | `number` | ✅ | Precio en MXN (entero, sin decimales) |
| `estado` | `select` | ✅ | `disponible` \| `apartada` \| `vendida`. Default: `disponible`. |
| `especificaciones` | `group` | — | Conjunto de specs técnicas (ver sub-campos) |
| `especificaciones.año` | `number` | — | Año del modelo, ej. 2025 |
| `especificaciones.cilindraje` | `number` | — | Cilindrada en cc, ej. 125 |
| `especificaciones.tipo` | `select` | — | `scooter` \| `sport` \| `naked` \| `custom` |
| `especificaciones.colores` | `array` of `text` | — | Colores disponibles, ej. ["Rojo", "Negro"] |
| `especificaciones.motor` | `text` | — | Descripción del motor, ej. "Monocilíndrico 4T SOHC" |
| `especificaciones.potencia` | `text` | — | Potencia máxima, ej. "12.9 hp @ 9,000 rpm" |
| `especificaciones.peso` | `number` | — | Peso en kg, ej. 120 |
| `createdAt` | `date` (auto) | — | Fecha de creación. Usada para orden del catálogo. |
| `updatedAt` | `date` (auto) | — | Fecha de última actualización. |

### Reglas de validación

- `slug`: único en la colección; solo caracteres alphanumerics y guiones.
- `precio`: entero positivo > 0.
- `estado`: exactamente uno de los tres valores. No se admiten otros valores.
- `galeria`: mínimo 1 imagen. Sin límite superior (recomendación: ≤10 por moto).
- `especificaciones.año`: entero entre 2000 y año actual + 1.
- `especificaciones.cilindraje`: entero positivo > 0.
- `especificaciones.peso`: número positivo > 0.

### Transiciones de estado

```
disponible ──apartado exitoso──→ apartada
apartada   ──admin revierte──→   disponible
disponible ──admin marca──→      vendida
apartada   ──admin marca──→      vendida
vendida    ──admin reactiva──→   disponible   (caso excepcional)
```

**Regla de visibilidad en catálogo**: Las motos con `estado = vendida` se excluyen del fetch público. Las motos con `estado = disponible` o `estado = apartada` se muestran.

---

## Tipos TypeScript (`lib/types/moto.ts`)

```typescript
export type EstadoMoto = 'disponible' | 'apartada' | 'vendida'

export type TipoMoto = 'scooter' | 'sport' | 'naked' | 'custom'

export interface EspecificacionesMoto {
  año?: number
  cilindraje?: number
  tipo?: TipoMoto
  colores?: string[]
  motor?: string
  potencia?: string
  peso?: number
}

export interface ImagenMoto {
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface Moto {
  id: string
  nombre: string
  slug: string
  galeria: ImagenMoto[]
  precio: number
  estado: EstadoMoto
  especificaciones?: EspecificacionesMoto
  createdAt: string
  updatedAt: string
}

// Shape reducida para el listado del catálogo (sin especificaciones completas)
export interface MotoCard {
  id: string
  nombre: string
  slug: string
  imagenPrincipal: ImagenMoto
  precio: number
  estado: Exclude<EstadoMoto, 'vendida'>
}
```

---

## Respuesta REST de Payload CMS

El endpoint `GET /api/motos` devuelve:

```json
{
  "docs": [
    {
      "id": "abc123",
      "nombre": "Suzuki GSX-S125",
      "slug": "suzuki-gsx-s125",
      "galeria": [
        {
          "url": "https://res.cloudinary.com/tachosbiker/image/upload/v1/motos/gsx-s125-1.jpg",
          "alt": "Suzuki GSX-S125 roja",
          "width": 1200,
          "height": 800
        }
      ],
      "precio": 38900,
      "estado": "disponible",
      "especificaciones": {
        "año": 2025,
        "cilindraje": 125,
        "tipo": "sport",
        "colores": ["Rojo", "Negro"],
        "motor": "Monocilíndrico 4T SOHC",
        "potencia": "12.9 hp @ 9,000 rpm",
        "peso": 134
      },
      "createdAt": "2026-06-10T12:00:00.000Z",
      "updatedAt": "2026-06-18T08:30:00.000Z"
    }
  ],
  "totalDocs": 8,
  "limit": 100,
  "totalPages": 1,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": false,
  "prevPage": null,
  "nextPage": null
}
```
