# Feature Specification: Sistema de Apartado de Motos

**Feature Branch**: `002-sistema-apartado`

**Created**: 2026-06-21

**Status**: Draft

**Input**: Funcionalidades MUST pendientes M5, M6, M7 — Sistema de apartado, panel de admin de estado y monto, pasarela de pago.

## Clarifications

### Session 2026-06-21

- Q: ¿Qué proveedor de pasarela de pagos se usará para el cobro del apartado? → A: Conekta (México-nativo, soporte SPEI + tarjeta + OXXO, PCI-DSS).
- Q: ¿El monto del apartado es configurable globalmente o por moto individualmente? → A: Global — un único monto aplicable a todas las motos, configurable por el admin desde el panel.
- Q: ¿El pago se procesa embebido en el sitio o mediante redirección a la página de Conekta? → A: Redirección a Conekta Hosted Checkout — el usuario es enviado a la página segura de Conekta, paga ahí, y regresa al sitio con el resultado del pago.
- Q: ¿El apartado expira automáticamente después de N días si el cliente no concreta la compra? → A: No — el apartado permanece activo indefinidamente hasta que el admin cambie el estado manualmente. Sin expiración automática en Fase 1.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cliente Aparta una Moto (Priority: P1)

Como cliente interesado en una moto disponible, quiero poder apartarla pagando una cantidad fija de dinero, para reservarla con certeza sin tener que ir a la tienda inmediatamente.

**Why this priority**: Es la funcionalidad transaccional central del sitio — sin ella, el catálogo es solo informativo y el negocio no captura compromisos de compra. El apartado es la conversión clave.

**Independent Test**: Se puede probar navegando a una moto "Disponible", pulsando "Apartar esta moto", completando el pago de prueba, y verificando que: (a) el sistema muestra confirmación de apartado, (b) la moto aparece como "Apartada" en el catálogo público inmediatamente.

**Acceptance Scenarios**:

1. **Given** que un cliente visita la ficha de una moto en estado "Disponible", **When** pulsa el botón "Apartar esta moto", **Then** el sistema muestra el monto del apartado, solicita nombre, teléfono y email, y presenta el aviso de privacidad (LFPDPPP) que el cliente debe aceptar.
2. **Given** que el cliente ha ingresado sus datos y aceptado el aviso de privacidad, **When** confirma y procede al pago, **Then** el sistema lo redirige a la página de pago segura de Conekta (Hosted Checkout) donde ingresa sus datos de tarjeta o elige pagar por SPEI.
3. **Given** que el cliente completa el pago exitosamente en la página de Conekta, **When** Conekta confirma el pago y redirige al cliente de vuelta al sitio, **Then** el sistema actualiza el estado de la moto a "Apartada" de forma automática y muestra una pantalla de confirmación con los detalles del apartado.
4. **Given** que el pago del cliente es rechazado o falla en la página de Conekta, **When** el cliente regresa al sitio, **Then** el estado de la moto NO cambia y el cliente ve un mensaje claro indicando que el pago no se completó, con opción de reintentar.
5. **Given** que el cliente abandona la página de Conekta sin pagar (cierra la ventana o regresa manualmente), **When** vuelve al sitio, **Then** el estado de la moto NO cambia y puede reintentar el apartado.
6. **Given** que una moto está en estado "Apartada" o "Vendida", **When** cualquier usuario intenta acceder al flujo de apartado, **Then** el sistema no presenta el CTA de apartado ni permite iniciar el pago.

---

### User Story 2 - Admin Gestiona Estado de Motos Manualmente (Priority: P2)

Como administrador del negocio, quiero poder cambiar manualmente el estado de cualquier moto (Disponible, Apartada, Vendida) desde el panel de administración, para cubrir casos como apartados acordados en tienda, cancelaciones o ventas directas.

**Why this priority**: El flujo automático de pago online no cubre todas las situaciones del negocio real (clientes que apartan en tienda, clientes que cancelan, motos vendidas fuera del canal digital). El admin necesita control total sobre el estado.

**Independent Test**: Puede probarse entrando al panel de admin, seleccionando una moto en estado "Apartada", cambiando su estado a "Disponible", y verificando que el catálogo público refleja el cambio sin necesidad de redespliegue.

**Acceptance Scenarios**:

1. **Given** que el admin está autenticado en el panel, **When** selecciona una moto, **Then** puede cambiar su estado entre Disponible, Apartada y Vendida mediante una acción explícita (no accidental).
2. **Given** que el admin cambia el estado de una moto, **When** confirma el cambio, **Then** el catálogo público refleja el nuevo estado en menos de 60 segundos.
3. **Given** que el admin marca una moto como "Vendida", **When** el cliente visita el catálogo, **Then** esa moto no aparece en el listado público.
4. **Given** que el admin revierte una moto de "Apartada" a "Disponible", **When** el cliente visita la ficha, **Then** el CTA de apartado vuelve a estar activo.

---

### User Story 3 - Admin Configura el Monto del Apartado (Priority: P3)

Como administrador del negocio, quiero poder configurar el monto del apartado desde el panel de administración, para ajustarlo sin necesidad de modificar código ni contactar al equipo de desarrollo.

**Why this priority**: El monto es una variable de negocio, no técnica. Si el cliente decide ajustarlo (por ejemplo, de $1,000 a $2,000 MXN), debe poder hacerlo por su cuenta.

**Independent Test**: Puede probarse cambiando el monto en la configuración del panel, luego visitando la ficha de una moto disponible y verificando que el CTA muestra el monto actualizado.

**Acceptance Scenarios**:

1. **Given** que el admin accede a la sección de configuración del panel, **When** modifica el monto del apartado, **Then** el nuevo monto se refleja en el CTA de apartado del catálogo público.
2. **Given** que el admin guarda un nuevo monto, **When** un cliente inicia el flujo de apartado, **Then** el pago procesado corresponde exactamente al monto configurado por el admin.
3. **Given** que el admin intenta guardar un monto de $0 o negativo, **When** confirma, **Then** el sistema rechaza el cambio y muestra un mensaje de error claro.

---

### Edge Cases

- **Pago duplicado**: cliente pulsa "pagar" dos veces. El sistema debe procesar solo un pago y no crear dos registros de apartado para la misma moto.
- **Carrera de condición (race condition)**: dos clientes inician el apartado de la misma moto casi simultáneamente. Solo uno debe completar el apartado; el segundo debe recibir un mensaje indicando que la moto ya no está disponible.
- **Timeout de pago**: el cliente es redirigido a Conekta pero la sesión de pago expira antes de completar la transacción. Al regresar al sitio, el estado de la moto no debe cambiar y el cliente puede reintentar.
- **Moto eliminada del CMS durante el flujo**: si el admin elimina o despública una moto mientras el cliente tiene el flujo de pago abierto, el pago debe fallar de forma segura sin cobrar.
- **Monto de apartado a $0**: el sistema debe impedir configurar $0 como monto válido.
- **Expiración de apartado**: Los apartados no expiran automáticamente. El admin gestiona manualmente los vencimientos cambiando el estado de la moto (Disponible, Vendida) desde el panel cuando lo considere oportuno.
- **Datos de contacto inválidos**: teléfono con menos de 10 dígitos o email sin formato válido deben ser rechazados antes de proceder al pago.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar el CTA de "Apartar esta moto" únicamente cuando la moto está en estado "Disponible".
- **FR-002**: El CTA de apartado DEBE mostrar el monto configurado del apartado en MXN antes de que el cliente inicie el flujo de pago.
- **FR-003**: El sistema DEBE solicitar nombre, número de teléfono y correo electrónico del cliente antes de procesar el pago de apartado.
- **FR-004**: El sistema DEBE mostrar un aviso de privacidad (LFPDPPP) que el cliente debe aceptar explícitamente antes de proceder al pago.
- **FR-005**: El sistema DEBE integrar **Conekta** como pasarela de pagos, soportando como mínimo cobro con tarjeta de crédito/débito y SPEI para el monto del apartado. Conekta es PCI-DSS compliant y maneja el almacenamiento de datos de tarjeta de forma independiente del sistema.
- **FR-006**: El sistema NO DEBE almacenar directamente datos sensibles de tarjeta (números, CVV, fechas de expiración); el procesamiento se delega íntegramente a la pasarela.
- **FR-007**: Al recibir la confirmación de pago exitoso desde Conekta (vía webhook o al retornar el cliente a la URL de éxito), el sistema DEBE cambiar el estado de la moto a "Apartada" de forma automática.
- **FR-008**: Si el pago falla o es rechazado, el sistema DEBE mantener el estado actual de la moto sin modificaciones y notificar el error al cliente.
- **FR-009**: El sistema DEBE prevenir condiciones de carrera: si dos clientes intentan apartar la misma moto simultáneamente, solo uno debe completar el apartado.
- **FR-010**: El sistema DEBE registrar cada apartado con: fecha y hora, moto ID, nombre, teléfono y email del cliente, monto cobrado, y referencia de la transacción de la pasarela.
- **FR-011**: El admin DEBE poder cambiar el estado de cualquier moto (Disponible / Apartada / Vendida) manualmente desde el panel de administración.
- **FR-012**: El admin DEBE poder configurar un **monto global de apartado** aplicable a todas las motos desde el panel de administración. El valor por defecto es $1,000 MXN. No existe monto individual por moto.
- **FR-013**: El sistema DEBE validar que el monto del apartado sea mayor a $0 MXN antes de guardar la configuración.
- **FR-014**: Los cambios de estado realizados por el admin DEBEN reflejarse en el catálogo público en menos de 60 segundos.
- **FR-015**: El admin DEBE poder ver el listado de apartados registrados (quién aparta, qué moto, cuándo, estado del pago) desde el panel de administración.

### Key Entities

- **Apartado**: Registro de una reserva. Atributos: moto (referencia), nombre del cliente, teléfono del cliente, correo del cliente, monto cobrado en MXN, referencia de transacción (de la pasarela), estado del pago (pendiente / completado / fallido), fecha y hora de creación.
- **ConfiguraciónApartado**: Configuración global única del sistema de apartado. Atributos: monto del apartado en MXN (valor por defecto $1,000). Es un registro singleton — no existe configuración individual por moto.
- **Moto** (heredada de 001): Entidad ya definida en spec 001. Aquí se extiende con la capacidad de que su estado cambie automáticamente al completarse un apartado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un cliente puede completar el flujo de apartado desde la ficha de la moto (incluyendo ingreso de datos y pago) en menos de 3 minutos.
- **SC-002**: El estado de la moto cambia a "Apartada" en el catálogo público en menos de 30 segundos después de la confirmación del pago exitoso.
- **SC-003**: El 100% de los pagos exitosos resultan en un cambio de estado automático a "Apartada"; el 0% de los pagos fallidos modifican el estado de la moto.
- **SC-004**: Ningún pago duplicado es procesado para la misma moto en el mismo momento (cero condiciones de carrera que resulten en cobros dobles).
- **SC-005**: El admin puede cambiar el estado de cualquier moto manualmente y el cambio se refleja en el catálogo público en menos de 60 segundos, sin intervención del equipo de desarrollo.
- **SC-006**: El admin puede cambiar el monto del apartado desde el panel y el nuevo monto se muestra en el CTA de apartado en menos de 60 segundos.
- **SC-007**: El sistema cumple con los requisitos LFPDPPP: el aviso de privacidad es visible y aceptado antes de cada transacción de apartado.

## Assumptions

- El monto del apartado es un valor global único de $1,000 MXN por defecto, configurable por el admin. No existe configuración por moto individual.
- Se asume que el proveedor de pasarela de pagos será confirmado por el cliente (S2 pendiente); la spec es agnóstica de proveedor para no bloquear el diseño.
- Se asume que el flujo de apartado es para un solo ítem (una moto); no existe concepto de carrito ni de múltiples apartados en una sola transacción.
- Se asume que la confirmación post-pago al cliente se entrega en pantalla (confirmación de éxito en la UI). Notificaciones adicionales (email/WhatsApp automático) son NICE TO HAVE fuera de Fase 1.
- Los apartados no expiran automáticamente. El admin gestiona los vencimientos manualmente. No se requiere job de fondo ni lógica de expiración en Fase 1.
- Se asume que el admin que gestiona estados y monto del apartado es el mismo admin que gestiona el catálogo en el CMS (Payload CMS según restricciones técnicas del proyecto).
- Se asume que el catálogo público (spec 001) ya está implementado y en producción; esta spec extiende la ficha de moto con el flujo de apartado.
