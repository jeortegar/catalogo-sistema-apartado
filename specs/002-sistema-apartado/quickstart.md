# Quickstart: Validación del Sistema de Apartado

**Feature**: 002-sistema-apartado | **Date**: 2026-06-21

Guía de validación end-to-end para verificar que el sistema de apartado funciona correctamente en entorno local y staging.

---

## Prerrequisitos

1. Feature 001 (Catálogo) implementada y funcionando (`/catalogo` accesible, con al menos una moto en estado "Disponible")
2. Variables de entorno configuradas (ver [data-model.md](data-model.md#variables-de-entorno-requeridas)):
   - `CONEKTA_API_KEY` — usar API key de **modo prueba** de Conekta
   - `CONEKTA_WEBHOOK_SECRET` — secreto de webhook de Conekta (modo prueba)
   - `NEXT_PUBLIC_APP_URL` — URL del entorno local o staging (ej. `http://localhost:3000`)
3. Payload CMS corriendo con la colección `apartados` y el Global `configuracion-apartado` registrados
4. Para webhooks en local: túnel público activo (ej. `ngrok http 3000`) y URL del túnel configurada en el dashboard de Conekta como webhook endpoint

---

## Escenario 1: Flujo de Apartado Exitoso (Happy Path)

**Objetivo**: Verificar que un cliente puede apartar una moto y el estado cambia automáticamente.

### Pasos

1. Navegar a `/catalogo` y seleccionar una moto en estado **"Disponible"**
2. En la ficha de la moto, verificar que el botón **"Apartar esta moto"** es visible y muestra el monto (`$1,000 MXN` por defecto)
3. Pulsar el botón → verificar que aparece el formulario solicitando nombre, teléfono y email
4. Verificar que el aviso de privacidad (LFPDPPP) es visible y requiere aceptación explícita
5. Completar el formulario con datos válidos:
   - Nombre: `Test Cliente`
   - Teléfono: `5512345678`
   - Email: `test@example.com`
   - Aceptar aviso de privacidad: ✅
6. Confirmar → verificar que el navegador redirige a la página de Conekta Hosted Checkout
7. En la página de Conekta, usar **tarjeta de prueba**: `4111 1111 1111 1111`, cualquier fecha futura, CVV `123`
8. Completar el pago → verificar redirect de regreso al sitio a `/apartar/[slug]/exito`

### Resultados esperados

- La página de éxito muestra: nombre de la moto, monto cobrado, nombre del cliente
- Al volver al catálogo (`/catalogo`), la moto ahora muestra badge **"APARTADA"**
- En la ficha de la moto (`/catalogo/[slug]`), el botón de apartado ya no es visible
- En el panel de Payload CMS → colección `apartados`: existe un registro con `estadoPago = 'completado'` para esa moto

---

## Escenario 2: Pago Rechazado

**Objetivo**: Verificar que un pago fallido no cambia el estado de la moto.

### Pasos

1. Navegar a la ficha de una moto "Disponible" e iniciar el flujo de apartado
2. En la página de Conekta, usar **tarjeta de rechazo de prueba**: `4000 0000 0000 0002`
3. Intentar completar el pago

### Resultados esperados

- Conekta muestra error de pago rechazado
- Al regresar al sitio, llega a `/apartar/[slug]/error` con mensaje claro
- La moto sigue en estado "Disponible" en el catálogo
- En Payload CMS → `apartados`: el registro tiene `estadoPago = 'fallido'` (o 'pendiente' si Conekta no generó el webhook de fallo)

---

## Escenario 3: Intento de Apartar Moto Ya Apartada

**Objetivo**: Verificar que no es posible iniciar el flujo de apartado en una moto ya apartada.

### Pasos

1. Completar primero el Escenario 1 exitosamente
2. En otra ventana/incógnito, navegar a la ficha de la misma moto

### Resultados esperados

- El botón "Apartar esta moto" **no es visible**
- La ficha muestra el badge "APARTADA"
- No existe ninguna ruta/URL para iniciar el pago de esa moto

---

## Escenario 4: Admin Cambia Estado Manualmente

**Objetivo**: Verificar que el admin puede revertir un apartado a "Disponible".

### Pasos

1. Con una moto en estado "Apartada" (resultado del Escenario 1)
2. Acceder al panel de Payload CMS → colección `motos`
3. Seleccionar la moto → cambiar `estado` de `apartada` a `disponible` → Guardar

### Resultados esperados

- En el catálogo público, la moto vuelve a mostrar badge "DISPONIBLE" en menos de 60 segundos
- El botón "Apartar esta moto" vuelve a estar visible en la ficha

---

## Escenario 5: Admin Cambia Monto del Apartado

**Objetivo**: Verificar que el monto del CTA se actualiza cuando el admin cambia la configuración.

### Pasos

1. Acceder al panel de Payload CMS → Globals → `Configuración de Apartado`
2. Cambiar `montoApartado` de `1000` a `2000` → Guardar

### Resultados esperados

- Al visitar la ficha de cualquier moto disponible, el botón muestra **"Apartar esta moto: $2,000 MXN"**
- El formulario de apartado muestra el nuevo monto
- El pago en Conekta (si se completa) cobra $2,000 MXN

---

## Escenario 6: Verificación del Webhook

**Objetivo**: Confirmar que el webhook procesa correctamente un pago (backup del redirect).

### Pasos (requiere ngrok o equivalente)

1. Asegurarse de que el endpoint de webhook está registrado en el dashboard de Conekta: `{ngrok_url}/api/conekta/webhook`
2. Completar el Escenario 1 pero **cerrar la ventana del navegador en la página de Conekta** antes del redirect de regreso
3. Esperar 10-30 segundos

### Resultados esperados

- La moto cambia a estado "Apartada" en el catálogo (sin haber visitado la success_url)
- En Payload CMS → `apartados`: el registro tiene `estadoPago = 'completado'`
- Los logs del servidor muestran recepción y procesamiento del webhook con `200 OK`

---

## Verificación de Variables de Entorno

```bash
# Verificar que las variables están disponibles
echo $CONEKTA_API_KEY       # debe mostrar key_xxx...
echo $CONEKTA_WEBHOOK_SECRET # debe mostrar secreto
echo $NEXT_PUBLIC_APP_URL    # debe mostrar URL base
```

## Referencia Rápida: Tarjetas de Prueba de Conekta

| Tarjeta | Resultado |
|---|---|
| `4111 1111 1111 1111` | Pago exitoso |
| `4000 0000 0000 0002` | Pago rechazado |
| `4000 0000 0000 0069` | Tarjeta expirada |

**CVV**: Cualquier 3 dígitos | **Fecha**: Cualquier fecha futura
