# Brief — Tachos Biker Catálogo Digital

**Fecha de brief:** 2026-06-14
**Estado:** BORRADOR — pendiente de validar supuestos secundarios
**Responsable:** Jared Ortega (CTO)
**Tipo de proyecto:** Catálogo digital con sistema de apartado
**Modalidad:** Greenfield

---

## 1. Objetivo de negocio

El sitio debe mostrar el catálogo de motos importadas y permitir apartar una moto con un pago de $1,000 MXN para jóvenes de 15–32 años en México, convirtiendo visitas digitales en visitas físicas donde se cierra la venta.

**Métrica de éxito:** Incremento en ganancias mensuales [PENDIENTE — definir baseline y % objetivo concreto con el cliente]

---

## 2. Público

- **Usuario principal:** Jóvenes de 15 a 32 años, México. Consultan catálogo y disponibilidad online; cierran la compra de forma presencial en tienda.
- **Dispositivo predominante:** Móvil (>70% del tráfico esperado)
- **Nivel técnico del usuario:** Básico a intermedio [SUPUESTO: audiencia juvenil acostumbrada a apps móviles]
- **Geografía:** Solo México — moneda MXN, idioma Español
- **Comportamiento de compra:** El sitio es un showroom digital. El apartado de $1,000 MXN es el único paso transaccional online; la venta completa ocurre en tienda física.

---

## 3. Tipo de sitio y stack tentativo

**Tipo:** Catálogo digital + sistema de apartado (pago único de $1,000 MXN por moto)

**Stack propuesto:**
- Framework: Next.js (App Router) — SEO, rendimiento móvil, SSR
- CMS: Headless CMS (Sanity o Payload) — el admin edita catálogo con frecuencia; interfaz simple sin código
- Base de datos: PostgreSQL — necesaria para gestión de apartados, estado de disponibilidad y campo configurable de monto
- Hosting: La agencia gestiona — Vercel (frontend) + Railway o similar (backend/DB)
- Imágenes / assets: Cloudinary o CDN integrado al CMS [SUPUESTO]
- Pasarela de pagos: Por definir — solo necesita procesar un cobro fijo de $1,000 MXN con tarjeta o SPEI [PENDIENTE: nombre del proveedor]

**Nota de stack:** El alcance real es significativamente más acotado que un e-commerce completo. Un catálogo + apartado es perfectamente viable en el presupuesto y plazo declarados. La complejidad transaccional es mínima: un solo producto "apartado" de precio fijo, sin carrito, sin variantes de precio, sin envíos.

---

## 4. Alcance funcional

### Imprescindibles — MUST ✅

- [ ] **Catálogo de motos:** Listado de ~10 SKUs con fotos, especificaciones técnicas, precio en MXN y estado de disponibilidad (disponible / apartada / vendida).
- [ ] **Comparador de productos:** Comparar 2 o más motos lado a lado (specs, precio, disponibilidad).
- [ ] **Búsqueda avanzada / filtros:** Filtrar por modelo, precio, disponibilidad y características clave.
- [ ] **Página de detalle de moto:** Ficha técnica completa, galería de fotos, precio, variantes y CTA de apartado.
- [ ] **Sistema de apartado:** El usuario paga $1,000 MXN para reservar una moto. Al completar el pago, la moto cambia de estado a "Apartada" en el catálogo automáticamente.
- [ ] **Panel de administración — campo de apartado configurable:** El admin puede marcar una moto como "Apartada" manualmente (para casos en que el apartado ocurra fuera del sitio: por teléfono, en tienda, etc.), y puede configurar el monto del apartado por moto o globalmente.
- [ ] **Pasarela de pago para apartado:** Procesamiento del cobro de $1,000 MXN con tarjeta crédito/débito y/o SPEI [PENDIENTE: confirmar métodos exactos para el apartado].
- [ ] **CMS / Panel de administración:** El admin puede editar productos, precios, fotos, disponibilidad y estado de apartado sin tocar código.
- [ ] **Integración WhatsApp:** Botón o widget de contacto directo por WhatsApp en el catálogo y ficha de moto.
- [ ] **Diseño mobile-first:** UI optimizada para móvil, tono divertido y juvenil, referencia visual Suzuki MX.
- [ ] **Diseño responsive:** Funcional en desktop también [SUPUESTO: aunque el tráfico es mayoritariamente móvil].

### Deseables — NICE TO HAVE 🔵

- [ ] **Notificación al admin** cuando se realiza un apartado online (email o WhatsApp).
- [ ] **Confirmación al usuario** por email o WhatsApp tras apartar exitosamente.
- [ ] **Historial de apartados** en el panel de administración (quién apartó, cuándo, qué moto).
- [ ] **Multi-tienda:** Soporte para múltiples sucursales (solicitado "a futuro").
- [ ] **Calculadora de mensualidades / financiamiento:** Estimador visual informativo (sin procesar el crédito online).

---

## 5. Fuera de alcance — NO incluye 🚫

- **Compra completa online** — el sitio NO vende la moto, solo permite apartarla con $1,000 MXN
- **Carrito de compras** — no existe carrito; el apartado es un flujo directo de un solo ítem
- **Meses sin intereses (MSI)** — el apartado es un cobro fijo de $1,000 MXN; MSI queda excluido en Fase 1
- **Envío por paquetería** — las motos se entregan en tienda física; no aplica logística de envío
- **Facturación CFDI automática** — excluida explícitamente por el cliente
- **Blog / contenido editorial** — excluido explícitamente
- **App móvil nativa** — no solicitada
- **Login / área de usuario / historial de apartados para el comprador** — [SUPUESTO: no fue solicitado; el seguimiento es responsabilidad del admin]
- **Panel de analytics o reportes avanzados**
- **Integración con ERP/sistema contable** en Fase 1 (no existe sistema actual)
- **Multi-tienda** en Fase 1
- **Marketing digital, SEO avanzado** (sin presupuesto de marketing)
- **Diseño de identidad visual / logo** (en desarrollo por el cliente)

---

## 6. Lógica del sistema de apartado — detalle funcional

```
FLUJO USUARIO:
1. Usuario navega catálogo → abre ficha de moto disponible
2. Hace clic en "Apartar esta moto"
3. Ingresa datos de contacto (nombre, teléfono, email) [SUPUESTO: campos mínimos]
4. Paga $1,000 MXN con tarjeta o SPEI
5. Sistema marca la moto como "Apartada" automáticamente
6. [NICE TO HAVE] Usuario recibe confirmación; admin recibe notificación

FLUJO ADMIN:
1. Admin accede al panel de administración
2. Puede cambiar el estado de cualquier moto manualmente:
   - Disponible → Apartada (para apartados hechos fuera del sitio)
   - Apartada → Disponible (si el apartado se cancela o vence)
   - Disponible/Apartada → Vendida
3. Puede configurar el monto del apartado [SUPUESTO: globalmente o por moto]

ESTADOS DE UNA MOTO:
- Disponible (verde) — se puede apartar
- Apartada (amarillo) — ya no se puede apartar desde el sitio
- Vendida (gris) — excluida del catálogo activo [SUPUESTO]
```

---

## 7. Integraciones y restricciones técnicas

| Elemento | Estado | Detalle |
|---|---|---|
| Dominio | No tiene — por comprar | La agencia gestiona la compra y configuración |
| Hosting | La agencia gestiona | Propuesta: Vercel + Railway o equivalente |
| Marca / logo | En desarrollo | El cliente no ha entregado archivos [PENDIENTE] |
| Paleta de colores | Por definir | Referencia: Suzuki MX [SUPUESTO: guía de tono provisional] |
| Pasarela de pago | Definida por el cliente | Solo procesa $1,000 MXN fijos; proveedor no especificado [PENDIENTE] |
| WhatsApp | Integración requerida | Widget de contacto; número de WhatsApp Business [PENDIENTE] |
| CRM / Email marketing | No aplica en Fase 1 | — |
| ERP / Contabilidad | No aplica en Fase 1 | Sin sistema actual |
| Normativas / Privacidad | No especificado | LFPDPPP aplica; se implementa aviso de privacidad estándar [SUPUESTO] |
| Contenido de productos | Listo para usar | El cliente tiene fotos y specs de los 10 SKUs |
| CFDI | No aplica | Excluida explícitamente |

---

## 8. Referencias

| Sitio | URL | Qué rescatar |
|---|---|---|
| Suzuki Motos MX | https://motos.suzuki.com.mx/ | Estructura de catálogo, fichas técnicas, tono visual |

> Preguntar: ¿qué le gusta específicamente de Suzuki MX? ¿Hay algo que NO le guste? ¿Alguna referencia fuera del sector motos?

---

## 9. Presupuesto, fecha y condiciones

| Campo | Valor | Estado |
|---|---|---|
| Presupuesto de desarrollo | Menos de $50,000 MXN | ✅ Alcanzable con alcance actual (catálogo + apartado) |
| Presupuesto de marketing | No contemplado | Confirmado |
| Fecha de lanzamiento | Menos de 1 mes | ✅ Viable con este alcance |
| Anticipo | [SUPUESTO: 50%] | Por acordar |
| Hitos de pago | [SUPUESTO: 50% inicio / 50% entrega] | Por acordar |
| Rondas de revisión de diseño | [SUPUESTO: 2 rondas] | Por fijar en contrato |
| Rondas de revisión de contenido | [SUPUESTO: 1 ronda] | Por fijar en contrato |
| Mantenimiento | Sí, desde el inicio | Modalidad y costo [PENDIENTE] |
| Garantía post-lanzamiento | [SUPUESTO: 30 días] | Por acordar |

> ✅ Con el alcance corregido (catálogo + apartado de $1,000 MXN, sin e-commerce completo), el presupuesto y el plazo son realistas.

---

## 10. Supuestos críticos — confirmar ANTES de iniciar

| # | Supuesto | Pregunta para el cliente |
|---|---|---|
| S1 | El monto del apartado es siempre $1,000 MXN (puede cambiar por configuración del admin, no por el usuario) | ¿El admin puede cambiar el monto del apartado para una moto en particular, o es siempre el mismo para todas? |
| S2 | El proveedor de pasarela de pagos ya está contratado y tiene API disponible | ¿Cuál es el nombre del gateway de pagos? ¿Ya tienen credenciales/API keys? |
| S3 | El cliente tiene o puede entregar identidad visual antes de iniciar el diseño | ¿Cuándo estará lista la identidad visual (logo, colores)? ¿Podemos arrancar con identidad provisional? |
| S4 | El apartado no tiene fecha de vencimiento (no caduca automáticamente) | ¿El apartado vence si el usuario no se presenta en X días? ¿Debe liberarse automáticamente? |

---

## 11. Supuestos secundarios — confirmar antes del diseño

| # | Supuesto | Pregunta para el cliente |
|---|---|---|
| S5 | El tono "divertido y juvenil" = colores vibrantes, tipografía bold, lenguaje informal | ¿Puedes compartirnos 2–3 ejemplos de marcas con el tono visual que buscas? |
| S6 | El comparador soporta máximo 3 motos simultáneas | ¿Cuántas motos quieres que el usuario pueda comparar al mismo tiempo? |
| S7 | El número de WhatsApp Business ya está activo | ¿Ya cuentan con WhatsApp Business? ¿Cuál es el número? |
| S8 | Los datos que el usuario ingresa al apartar son: nombre, teléfono y email | ¿Qué datos de contacto necesitas capturar cuando alguien aparta una moto? |
| S9 | Las variantes de moto son principalmente de color | ¿Qué tipo de variantes tienen los productos (color, cilindraje, versión, otro)? |
| S10 | Las motos "vendidas" desaparecen del catálogo público o se muestran como no disponibles | ¿Quieres que las motos ya vendidas aparezcan en el catálogo (como referencia) o que se oculten? |

---

## 12. Preguntas que faltó hacer

- ¿El admin recibe notificación (email/WhatsApp) cuando alguien aparta online?
- ¿El usuario recibe confirmación tras apartar? ¿Por qué canal?
- ¿Cuántas personas administrarán el panel? ¿Necesitan roles distintos (ej. vendedor vs. dueño)?
- ¿Tienen fotos profesionales de las motos o son fotos de proveedores/importadores?
- ¿El mantenimiento mensual incluye actualizaciones de contenido, soporte técnico o ambos? ¿Costo esperado?

---

## 13. Descripción de una línea — criterio de cierre

```
Catálogo digital mobile-first para Tachos Biker donde jóvenes mexicanos (15–32 años) 
exploran ~10 motos importadas con filtros y comparador, y pueden apartar una moto 
pagando $1,000 MXN online — sin compra completa, sin carrito, sin envíos.
```

---

*Este brief se convierte en `.specify/memory/constitution.md` una vez que los supuestos críticos S1–S4 estén confirmados por el cliente por escrito.*