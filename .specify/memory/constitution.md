<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - I. Catálogo + Apartado: referencia a sección "Fuera de Alcance" de este
    documento (antes solo apuntaba a docs/brief.md); aprobación ahora exige
    forma escrita.
  - Restricciones Técnicas y Stack: añadida restricción de CodeGraph y
    cumplimiento PCI-DSS para pasarela.
- Added principles:
  - VI. CodeGraph — Dependencias Visibles y Acotadas (ver Apéndice B)
- Added sections:
  - Funcionalidades MUST (M1–M10 del brief §4)
  - Fuera de Alcance — Fase 1 (lista completa del brief §5)
  - Rondas de Revisión Acordadas (2 diseño, 1 contenido)
  - Principios de Calidad (código revisado siempre, aprobaciones por escrito,
    verificación manual del flujo de apartado)
  - Apéndice B — Principio CodeGraph (definición, capas, tabla de módulos,
    reglas operativas)
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check es runtime;
    no requiere edición estática)
  - ✅ .specify/templates/spec-template.md (Assumptions + NEEDS CLARIFICATION
    ya soportados; alineados con S1–S4)
  - ✅ .specify/templates/tasks-template.md (genérico; sin referencias
    específicas a principios de este proyecto)
  - ✅ CLAUDE.md (sin referencias a la constitución)
- Follow-up TODOs:
  - TODO(S1): Confirmar con cliente si monto del apartado es configurable por
    moto o solo globalmente.
  - TODO(S2): Confirmar proveedor de pasarela de pagos y disponibilidad de
    credenciales/API.
  - TODO(S3): Confirmar fecha de entrega de identidad visual definitiva.
  - TODO(S4): Confirmar si el apartado vence automáticamente tras N días.
  - TODO(CODEGRAPH): Evaluar herramienta de visualización automática del grafo
    (Madge o Mermaid) una vez definida la estructura de directorios.
-->

# Tachos Biker Catálogo Digital Constitution

## Core Principles

### I. Catálogo + Apartado, No E-commerce Completo (Disciplina de Alcance)

El sitio es un showroom digital: catálogo de motos importadas más un sistema de
apartado de pago único y fijo. El proyecto NO DEBE implementar carrito de
compras, compra completa online, variantes de precio múltiples, lógica de
envío/paquetería, meses sin intereses (MSI), ni facturación CFDI automática.

Toda funcionalidad nueva DEBE evaluarse contra la sección "Fuera de Alcance" de
este documento y de `docs/brief.md`. Cualquier desviación requiere
justificación explícita registrada en `Complexity Tracking` del plan y
aprobación por escrito del responsable de proyecto antes de implementarse.

**Rationale**: El presupuesto declarado (menos de $50,000 MXN) y el plazo de
lanzamiento (menos de 1 mes) solo son viables si el alcance permanece acotado
a catálogo + apartado. Expandir el alcance invalida las estimaciones de
presupuesto y tiempo.

### II. Mobile-First y Tono Juvenil

Toda interfaz DEBE diseñarse mobile-first (>70% del tráfico esperado es móvil)
y DEBE permanecer funcional y responsive en desktop. El tono visual DEBE ser
divertido y juvenil, dirigido a usuarios de 15–32 años en México, usando Suzuki
MX (https://motos.suzuki.com.mx/) como referencia de estructura de catálogo y
tono visual hasta que el cliente entregue identidad visual definitiva.

El idioma del sitio DEBE ser español (México) y la moneda DEBE mostrarse en
MXN. No se requiere soporte multi-idioma ni multi-moneda.

**Rationale**: El público objetivo es joven, predominantemente móvil y
mexicano; optimizar para cualquier otro perfil desperdicia presupuesto y diluye
el tono de marca esperado.

### III. Integridad del Sistema de Apartado

El apartado es el único paso transaccional online: un cobro fijo y configurable
(valor por defecto $1,000 MXN). Al completarse un pago de apartado exitoso, el
sistema DEBE actualizar automáticamente el estado de la moto a "Apartada" sin
intervención manual del admin.

Los estados válidos de una moto son exactamente tres y DEBEN respetarse en
todo el sistema:

- **Disponible** (verde) — puede apartarse desde el sitio.
- **Apartada** (amarillo) — ya no puede apartarse desde el sitio.
- **Vendida** (gris) — excluida del catálogo activo.

El admin DEBE poder cambiar manualmente el estado de cualquier moto (incluyendo
revertir Apartada → Disponible o marcar Vendida) para cubrir apartados
realizados fuera del sitio. El admin DEBE poder configurar el monto del
apartado globalmente y/o por moto
[NEEDS CLARIFICATION: S1 — confirmar si el monto es configurable por moto o
únicamente global].

**Rationale**: La promesa de negocio depende de que la disponibilidad mostrada
en el catálogo sea siempre confiable; un estado desincronizado genera apartados
duplicados y rompe la confianza del usuario.

### IV. Administración Sin Código

Todo contenido del catálogo (productos, especificaciones, precios, fotos,
disponibilidad y estado de apartado) DEBE ser editable por el admin a través de
un panel/CMS sin requerir cambios de código ni despliegues. Operaciones de
contenido del día a día NO DEBEN requerir intervención del equipo de
desarrollo.

**Rationale**: El cliente edita el catálogo con frecuencia y no tiene
conocimientos técnicos; un flujo que requiera un deploy por cada cambio de
contenido es inviable operativamente y fuera del presupuesto de mantenimiento.

### V. Cumplimiento y Confianza para Usuarios Mexicanos

El sitio DEBE incluir un aviso de privacidad conforme a la LFPDPPP para los
datos capturados durante el apartado (nombre, teléfono, email).

El procesamiento de pagos DEBE delegarse a un proveedor de pasarela compatible
con PCI-DSS; el sistema NO DEBE almacenar directamente datos sensibles de
tarjeta. La pasarela DEBE soportar como mínimo el cobro de $1,000 MXN vía
tarjeta crédito/débito y/o SPEI
[NEEDS CLARIFICATION: S2 — confirmar proveedor de pasarela].

El sitio DEBE incluir un botón o widget de contacto por WhatsApp, visible en
el catálogo y en la ficha de cada moto.

**Rationale**: La confianza es crítica para que un usuario joven complete un
pago online antes de visitar la tienda; los requisitos legales de privacidad y
seguridad de pagos son no negociables en México.

### VI. CodeGraph — Dependencias Visibles y Acotadas (ver Apéndice B)

Cada módulo o capa del sistema DEBE tener un único propietario de dependencias
claramente definido. Las dependencias entre capas DEBEN fluir en una sola
dirección: UI → Servicios de aplicación → Dominio → Infraestructura. Las
dependencias circulares entre módulos están PROHIBIDAS.

Todo nuevo módulo o integración externa (pasarela de pagos, CMS, DB, WhatsApp)
DEBE registrarse en el CodeGraph del proyecto (ver Apéndice B) antes de ser
implementado, para que el impacto en el resto del sistema sea revisable sin
necesidad de leer código fuente.

**Rationale**: Con un equipo pequeño y plazo corto, las dependencias ocultas
son la principal fuente de bugs regresivos y retrasos. Un grafo explícito
permite detectar acoplamientos problemáticos antes de escribir código.

## Funcionalidades MUST — Alcance Comprometido

Las siguientes funcionalidades son **imprescindibles** y DEBEN estar completas
antes del lanzamiento. Toda spec y plan generado DEBE mapear sus user stories
a al menos uno de estos ítems:

| # | Funcionalidad | Detalle |
|---|---------------|---------|
| M1 | Catálogo de motos | Listado ~10 SKUs: fotos, specs, precio MXN, estado de disponibilidad |
| M2 | Comparador de productos | Comparar 2 o más motos lado a lado (specs, precio, disponibilidad) |
| M3 | Búsqueda avanzada / filtros | Filtrar por modelo, precio, disponibilidad y características clave |
| M4 | Página de detalle de moto | Ficha técnica completa, galería, precio, variantes, CTA de apartado |
| M5 | Sistema de apartado | Usuario paga $1,000 MXN → moto cambia automáticamente a "Apartada" |
| M6 | Panel admin — estado y monto | Admin cambia estado manualmente; configura monto del apartado |
| M7 | Pasarela de pago | Cobro de $1,000 MXN con tarjeta y/o SPEI [S2 pendiente] |
| M8 | CMS / Panel de administración | Edición de productos, precios, fotos, disponibilidad sin código |
| M9 | Integración WhatsApp | Botón/widget de contacto en catálogo y ficha de moto |
| M10 | Diseño mobile-first | UI optimizada para móvil, tono juvenil, responsive en desktop |

Cualquier tarea que no contribuya directamente a completar M1–M10 DEBE
justificarse como prerequisito técnico o clasificarse como NICE TO HAVE y
marcarse como tal en el plan.

## Fuera de Alcance — Fase 1

Las siguientes funcionalidades están **explícitamente excluidas**. Incluirlas
sin aprobación por escrito del responsable es una violación del Principio I:

| Exclusión | Razón |
|-----------|-------|
| Compra completa online | El sitio solo aparta motos; la venta cierra en tienda física |
| Carrito de compras | El apartado es un flujo directo de un solo ítem; no hay carrito |
| Meses sin intereses (MSI) | Apartado es cobro fijo; MSI queda excluido en Fase 1 |
| Envío por paquetería | Las motos se entregan en tienda; no aplica logística de envío |
| Facturación CFDI automática | Excluida explícitamente por el cliente |
| Blog / contenido editorial | Excluido explícitamente |
| App móvil nativa | No solicitada |
| Login / área de usuario para comprador | No solicitado; seguimiento es responsabilidad del admin |
| Panel de analytics o reportes avanzados | Fuera de presupuesto |
| Integración ERP / sistema contable | No existe sistema actual en Fase 1 |
| Multi-tienda / multi-sucursal | Solicitado "a futuro"; queda fuera de Fase 1 |
| Marketing digital / SEO avanzado | Sin presupuesto de marketing |
| Diseño de identidad visual / logo | En desarrollo por el cliente; no es responsabilidad del equipo |

## Restricciones Técnicas y Stack

- **Framework**: Next.js (App Router), hospedado en Vercel.
- **CMS**: Payload CMS (self-hosted) para gestión de catálogo sin código.
- **Base de datos**: PostgreSQL para apartados, estado de disponibilidad y
  configuración del monto de apartado, hospedada en Railway o equivalente.
- **Pasarela de pagos**: proveedor por definir [NEEDS CLARIFICATION: S2];
  debe soportar exclusivamente el cobro fijo de apartado (sin carrito, sin
  variantes de precio) y DEBE cumplir PCI-DSS.
- **Imágenes/assets**: Cloudinary o CDN integrado al CMS.
- **Geografía y moneda**: Solo México — MXN, español (México).
- **Integraciones excluidas en Fase 1**: ERP/contabilidad, CFDI automático,
  CRM/email marketing, multi-tienda, app móvil nativa, login para compradores.

Toda dependencia externa DEBE estar registrada en el CodeGraph (Apéndice B)
antes de ser integrada al código.

## Rondas de Revisión Acordadas

Las rondas de revisión están fijadas contractualmente y NO DEBEN excederse sin
aprobación por escrito del responsable:

| Tipo de revisión | Rondas | Condición de activación |
|-----------------|--------|------------------------|
| Revisión de diseño (UI/UX) | **2 rondas** | Después del mockup inicial y después de la primera iteración |
| Revisión de contenido | **1 ronda** | Después de la carga inicial de los ~10 SKUs |

Toda retroalimentación DEBE entregarse por escrito (email o documento) dentro
del plazo acordado. Revisiones adicionales se cotizarán por separado y
requerirán aprobación escrita del responsable antes de ejecutarse.

## Principios de Calidad

### Código revisado siempre

Todo código que toque el flujo de apartado (pasarela, cambio de estado de
moto, panel de admin) MUST pasar revisión por al menos un miembro del equipo
distinto al autor antes de mergearse a la rama principal. El código de
catálogo (solo lectura, sin transacciones) SHOULD pasar revisión, con
excepción de hotfixes urgentes documentados en `Complexity Tracking`.

### Aprobaciones por escrito

Toda decisión que afecte alcance, integraciones externas, diseño de base de
datos o flujos de pago DEBE registrarse por escrito (en el spec, plan o en un
comentario de PR) antes de implementarse. La comunicación verbal no cuenta
como aprobación a efectos de este documento.

### Verificación manual del flujo de apartado

Antes de marcar como completa cualquier feature que toque el flujo de
apartado, el equipo DEBE ejecutar un plan de prueba manual que cubra:

1. **Flujo de usuario**: navegar catálogo → abrir ficha → pagar $1,000 MXN
   → verificar que la moto cambia automáticamente a estado "Apartada".
2. **Flujo de admin**: ver el apartado en el panel → cambiar estado
   manualmente → confirmar que el catálogo público refleja el cambio.

## Flujo de Trabajo y Resolución de Supuestos

- Toda spec o plan DEBE marcar con `[NEEDS CLARIFICATION]` cualquier decisión
  que dependa de los Supuestos Críticos S1–S4 de `docs/brief.md`, hasta que
  el cliente los confirme por escrito:
  - **S1**: ¿El monto del apartado es configurable por moto o siempre global?
  - **S2**: ¿Qué proveedor de pasarela de pagos se usará y ya cuenta con
    credenciales/API?
  - **S3**: ¿Cuándo estará lista la identidad visual definitiva (logo, colores)?
  - **S4**: ¿El apartado expira automáticamente después de N días?
- Si una decisión depende de un supuesto no confirmado, el equipo DEBE: (a)
  solicitar confirmación al cliente, o (b) documentar explícitamente en la
  sección "Assumptions" del spec la decisión asumida y su impacto si el
  supuesto cambia.

## Governance

Esta constitución prevalece sobre cualquier práctica de desarrollo ad-hoc o
preferencia individual. En caso de conflicto entre esta constitución y un spec,
plan o tarea, la constitución prevalece y el artefacto en conflicto DEBE
corregirse o justificarse en `Complexity Tracking`.

**Procedimiento de enmienda**: Cambios requieren (1) actualizar este documento,
(2) incrementar la versión según versionado semántico (MAJOR: eliminación o
redefinición incompatible de principios; MINOR: nuevo principio o expansión
material; PATCH: aclaraciones o correcciones de redacción), y (3) registrar los
cambios en un Sync Impact Report al inicio de este archivo.

**Revisión de cumplimiento**: Todo `/speckit-plan` DEBE ejecutar el
"Constitution Check" contra los principios anteriores antes de la Fase 0 y
nuevamente después del diseño de Fase 1. Toda violación no resuelta DEBE
documentarse en `Complexity Tracking` con justificación explícita.

**Responsable**: Jared Ortega (CTO) es el responsable de aprobar excepciones de
alcance, resolver los Supuestos Críticos S1–S4 con el cliente y firmar las
aprobaciones por escrito requeridas por los Principios de Calidad.

**Version**: 1.1.0 | **Ratified**: 2026-06-15 | **Last Amended**: 2026-06-17

---

## Apéndice B — Principio CodeGraph: Dependencias Visibles y Acotadas

El CodeGraph es un mapa explícito y versionado de todos los módulos del sistema
y sus dependencias. Su propósito es hacer visibles los acoplamientos antes de
que generen bugs regresivos o retrasos de implementación.

### Capas del sistema (flujo de dependencias unidireccional)

```
UI (Next.js Pages / Components)
  ↓
Servicios de aplicación (lógica de negocio: apartado, catálogo, admin)
  ↓
Dominio (entidades: Moto, Apartado, Estado)
  ↓
Infraestructura (PostgreSQL, Payload CMS, Pasarela de pagos, WhatsApp, CDN)
```

Las dependencias SOLO DEBEN fluir hacia abajo. Ninguna capa de infraestructura
DEBE importar directamente de la capa UI, ni el dominio DEBE conocer detalles
de implementación de la infraestructura.

### Registro de módulos e integraciones (estado inicial)

| Módulo / Integración | Capa | Propietario | Depende de | Estado |
|----------------------|------|-------------|------------|--------|
| Catálogo (listado + filtros) | UI → Servicios | Equipo dev | Payload CMS, PostgreSQL | Por implementar |
| Ficha de moto | UI → Servicios | Equipo dev | Catálogo, Apartado | Por implementar |
| Comparador | UI → Servicios | Equipo dev | Catálogo | Por implementar |
| Sistema de apartado | Servicios → Infraestructura | Equipo dev | Pasarela de pagos, PostgreSQL | Por implementar |
| Panel de admin (CMS) | UI → CMS | Equipo dev | Payload CMS | Por implementar |
| Pasarela de pagos | Infraestructura | [S2 pendiente] | Externo / PCI-DSS | [S2 pendiente] |
| Payload CMS | Infraestructura | Equipo dev | PostgreSQL | Por implementar |
| PostgreSQL | Infraestructura | Railway | — | Por implementar |
| WhatsApp widget | UI | Equipo dev | Externo (número [S7 pendiente]) | Por implementar |
| Cloudinary / CDN | Infraestructura | Equipo dev | Externo | Por implementar |

### Reglas operativas

1. Antes de integrar cualquier nueva dependencia externa, DEBE añadirse una
   fila a la tabla anterior con propietario y capas afectadas.
2. Si una nueva dependencia introduce un ciclo (A depende de B y B depende de
   A), el ciclo DEBE romperse antes de hacer merge; el plan DEBE documentar
   cómo en `Complexity Tracking`.
3. El CodeGraph se revisa en el "Constitution Check" de cada `/speckit-plan`.
   Si el diseño propuesto modifica la tabla de módulos, el plan DEBE actualizar
   este Apéndice B como parte de su entregable.
4. TODO(CODEGRAPH): Evaluar herramienta de visualización automática (Madge para
   Next.js o diagrama Mermaid en el repo) una vez definida la estructura de
   directorios del proyecto.
