# Contract: Apartado API

**Feature**: 002-sistema-apartado | **Date**: 2026-06-21

Este documento define los contratos de las interfaces que el sistema expone y consume para el flujo de apartado.

---

## 1. Server Action: `iniciarApartado`

**Tipo**: Next.js Server Action  
**Archivo**: `lib/apartado/actions.ts`  
**Invocado desde**: `app/apartar/[slug]/page.tsx` (formulario de cliente)

### Input

```typescript
{
  motoSlug: string           // slug de la moto a apartar
  nombreCliente: string      // mín 2 chars
  telefonoCliente: string    // exactamente 10 dígitos numéricos
  emailCliente: string       // formato email válido
  aceptoPrivacidad: boolean  // debe ser true
}
```

### Output (éxito)

```typescript
{
  success: true
  checkoutUrl: string   // URL de Conekta Hosted Checkout a la que redirigir al cliente
  apartadoId: string    // ID del Apartado creado (para tracking)
}
```

### Output (error)

```typescript
{
  success: false
  error: 'moto_no_disponible' | 'apartado_pendiente_existente' | 'validacion' | 'conekta_error'
  message: string   // mensaje legible para el usuario
}
```

### Precondiciones

- `moto.estado === 'disponible'`
- No existe `Apartado` con `moto = slug` y `estadoPago = 'pendiente'`
- Todos los campos de input son válidos

### Efectos secundarios

1. Crea registro `Apartado` con `estadoPago = 'pendiente'` en Payload CMS
2. Crea Order en Conekta con `checkout.type = 'HostedPayment'`
3. Devuelve `checkoutUrl` para redirect del cliente

---

## 2. Page Route: `GET /apartar/[slug]/exito`

**Tipo**: Next.js Server Component (page)  
**Invocado por**: Conekta redirect después de pago exitoso

### Query Parameters

| Param | Tipo | Descripción |
|---|---|---|
| `order_id` | string | ID del Order de Conekta |
| `apartado_id` | string | ID del Apartado en nuestro sistema |

### Comportamiento del servidor

1. Verificar `apartado_id` existe y pertenece al `order_id`
2. Llamar `GET /orders/{order_id}` en Conekta para verificar estado real
3. Si `order.payment_status === 'paid'`:
   - Actualizar `Apartado.estadoPago = 'completado'`
   - Actualizar `Moto.estado = 'apartada'`
   - Llamar `revalidatePath('/catalogo')` y `revalidatePath('/catalogo/[slug]')`
4. Si no está pagado: redirigir a `/apartar/[slug]/error`
5. Renderizar pantalla de confirmación con detalles del apartado

### Idempotencia

Si el Apartado ya está en estado `completado` (procesado por webhook antes del redirect), no realiza doble actualización — simplemente muestra la confirmación.

---

## 3. API Route: `POST /api/conekta/webhook`

**Tipo**: Next.js API Route Handler  
**Archivo**: `app/api/conekta/webhook/route.ts`  
**Invocado por**: Conekta (evento `charge.paid`)

### Headers requeridos

| Header | Descripción |
|---|---|
| `Conekta-Signature` | Firma HMAC-SHA256 del raw body con `CONEKTA_WEBHOOK_SECRET` |

### Body (evento `charge.paid`)

```json
{
  "type": "charge.paid",
  "data": {
    "object": {
      "id": "ch_xxx",
      "order_id": "ord_xxx",
      "amount": 100000,
      "status": "paid"
    }
  }
}
```

### Comportamiento

1. Verificar firma HMAC — si falla: `return 401`
2. Ignorar eventos que no sean `charge.paid`
3. Buscar Apartado por `referenciaConekta = order_id`
4. Si Apartado ya está `completado`: `return 200` (idempotente)
5. Actualizar `Apartado.estadoPago = 'completado'`
6. Actualizar `Moto.estado = 'apartada'`
7. Llamar `revalidatePath` para catálogo
8. `return 200`

### Respuestas

| Status | Condición |
|---|---|
| `200` | Evento procesado (o ignorado de forma intencional) |
| `400` | Body inválido o evento malformado |
| `401` | Firma de webhook inválida |
| `500` | Error interno al procesar |

**Nota**: Siempre devolver `200` a eventos válidos para evitar que Conekta reintente indefinidamente. Solo `401` y `500` deben devolver error.

---

## 4. Conekta API — Calls Salientes

### 4.1 Crear Checkout Session

**Endpoint**: `POST https://api.conekta.io/orders`  
**Auth**: Bearer `CONEKTA_API_KEY`

**Request body mínimo**:

```json
{
  "currency": "MXN",
  "customer_info": {
    "name": "{nombreCliente}",
    "email": "{emailCliente}",
    "phone": "{telefonoCliente}"
  },
  "line_items": [{
    "name": "Apartado de moto: {moto.nombre}",
    "unit_price": "{montoApartado * 100}",
    "quantity": 1
  }],
  "checkout": {
    "type": "HostedPayment",
    "success_url": "{NEXT_PUBLIC_APP_URL}/apartar/{slug}/exito?order_id={order_id}&apartado_id={apartadoId}",
    "failure_url": "{NEXT_PUBLIC_APP_URL}/apartar/{slug}/error",
    "allowed_payment_methods": ["card", "spei"]
  },
  "metadata": {
    "moto_slug": "{slug}",
    "apartado_id": "{apartadoId}"
  }
}
```

**Nota**: `unit_price` en Conekta es en centavos. $1,000 MXN = `100000`.

### 4.2 Verificar Estado de Order

**Endpoint**: `GET https://api.conekta.io/orders/{order_id}`  
**Auth**: Bearer `CONEKTA_API_KEY`

**Campo a verificar**: `response.payment_status === 'paid'`
