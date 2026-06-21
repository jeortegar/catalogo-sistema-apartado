# Data Model: Sistema de Apartado de Motos

**Feature**: 002-sistema-apartado | **Date**: 2026-06-21

## Entidades

### 1. Apartado (Payload CMS Collection: `apartados`)

Registro de cada intento de apartado, independientemente del resultado del pago.

| Campo | Tipo | Requerido | Restricciones | Descripción |
|---|---|---|---|---|
| `id` | UUID (auto) | — | PK | Identificador único |
| `moto` | Relationship → Moto | ✅ | FK, no null | Moto que se intenta apartar |
| `nombreCliente` | Text | ✅ | min 2 chars | Nombre completo del cliente |
| `telefonoCliente` | Text | ✅ | min 10 dígitos, solo dígitos | Teléfono de contacto (MX: 10 dígitos) |
| `emailCliente` | Email | ✅ | formato email válido | Correo de contacto |
| `montoCobrado` | Number | ✅ | > 0 | Monto en MXN al momento de crear el apartado |
| `referenciaConekta` | Text | — | único cuando presente | ID del Order de Conekta |
| `estadoPago` | Enum | ✅ | 'pendiente' \| 'completado' \| 'fallido' | Estado del proceso de pago |
| `aceptoPrivacidad` | Checkbox | ✅ | must be true para crear | El cliente aceptó el aviso LFPDPPP |
| `createdAt` | DateTime (auto) | — | set on create | Timestamp de creación |
| `updatedAt` | DateTime (auto) | — | set on update | Timestamp de última actualización |

**Índice único**: `(moto, estadoPago)` filtrado donde `estadoPago = 'pendiente'` — garantiza que no puede existir más de un apartado pendiente por moto (prevención de race condition).

**Estados del pago y transiciones**:
```
pendiente → completado   (pago confirmado por Conekta)
pendiente → fallido      (pago rechazado o timeout)
```
No existen transiciones desde `completado` o `fallido` — son estados finales.

**Visibilidad en admin**: La colección `apartados` es visible en el panel de Payload CMS. El admin puede ver todos los registros (FR-015) pero no puede modificar `estadoPago` directamente (es gestionado por la lógica de negocio).

---

### 2. ConfiguraciónApartado (Payload CMS Global: `configuracion-apartado`)

Singleton de configuración global del sistema de apartado. Solo existe un registro.

| Campo | Tipo | Requerido | Restricciones | Descripción |
|---|---|---|---|---|
| `montoApartado` | Number | ✅ | > 0, entero | Monto en MXN cobrado por cualquier apartado. Default: 1000 |

**Acceso admin**: Editable desde el panel de Payload CMS en la sección "Globals". El admin puede cambiar el monto en cualquier momento (FR-012). Validación en Payload: `min: 1` (FR-013).

---

### 3. Moto (Payload CMS Collection: `motos`, heredada de spec 001)

No se agregan campos nuevos. Lo que cambia es el comportamiento: el campo `estado` ahora puede ser actualizado de forma programática (además del manual por el admin) al confirmarse un pago de apartado.

| Campo | Cambio respecto a spec 001 |
|---|---|
| `estado` | Sin cambio de schema. Se agrega hook afterChange en Conekta webhook para actualizarlo a 'apartada' automáticamente. |

**Transiciones de estado válidas** (recordatorio de la constitución):
```
disponible → apartada    (pago exitoso o admin manual)
apartada   → disponible  (admin manual: cancelación)
apartada   → vendida     (admin manual: venta confirmada)
disponible → vendida     (admin manual)
vendida    → disponible  (admin manual: reingreso al catálogo)
```

---

## Relaciones

```
Moto (1) ──────── (N) Apartado
                      │
                      └── estadoPago: pendiente | completado | fallido

ConfiguraciónApartado (singleton)
  └── montoApartado: number  ← usado en cada nuevo Apartado
```

---

## Variables de Entorno Requeridas

| Variable | Visibilidad | Descripción |
|---|---|---|
| `CONEKTA_API_KEY` | Server-only | API key privada de Conekta para crear órdenes y verificar pagos |
| `CONEKTA_WEBHOOK_SECRET` | Server-only | Secreto HMAC para verificar firmas de webhooks de Conekta |
| `NEXT_PUBLIC_APP_URL` | Público | URL base del sitio (para construir success_url y failure_url de Conekta) |

---

## Notas de Integridad

- Un cliente puede tener múltiples Apartados en estados 'fallido' (intentos fallidos), pero solo uno en 'pendiente' o 'completado' por moto a la vez.
- Al confirmarse un pago (`Apartado.estadoPago = 'completado'`), el sistema actualiza `Moto.estado = 'apartada'` en la misma operación transaccional.
- El `montoCobrado` en el Apartado se fija al valor de `ConfiguraciónApartado.montoApartado` en el momento de crear el apartado, no al momento del pago — esto garantiza consistencia aunque el admin cambie el monto después.
