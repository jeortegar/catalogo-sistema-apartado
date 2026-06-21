# Feature Specification: Catálogo de Motos en Venta

**Feature Branch**: `001-catalogo-motos`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "Como cliente quiero ver el catalogo de motos que estan en venta"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar Catálogo Completo (Priority: P1)

Como cliente, quiero ver todas las motos disponibles en un listado visual con fotos, precios y disponibilidad, para decidir cuáles me interesan sin tener que contactar a nadie.

**Why this priority**: Es el punto de entrada principal del sitio. Sin el listado, ninguna otra funcionalidad tiene sentido. Debe entregar valor inmediato al visitante.

**Independent Test**: Puede probarse visitando la página de catálogo y verificando que se muestran todas las motos con estatus "Disponible" o "Apartada", con foto, nombre, precio en MXN y etiqueta de estado.

**Acceptance Scenarios**:

1. **Given** que un cliente visita el catálogo, **When** la página carga, **Then** ve una cuadrícula/listado de motos con foto principal, nombre del modelo, precio en MXN y etiqueta de disponibilidad (Disponible / Apartada).
2. **Given** que existen motos con estado "Vendida", **When** el cliente ve el catálogo, **Then** esas motos NO aparecen en el listado público.
3. **Given** que el catálogo tiene motos, **When** el cliente accede desde un dispositivo móvil, **Then** el listado es legible y usable sin necesidad de hacer zoom ni scroll horizontal.

---

### User Story 2 - Filtrar y Buscar Motos (Priority: P2)

Como cliente, quiero filtrar las motos por características clave (precio, disponibilidad, modelo) para encontrar rápidamente las opciones que se ajustan a lo que busco.

**Why this priority**: Con ~10 SKUs es manejable sin filtros, pero la búsqueda mejora significativamente la experiencia y es parte del alcance comprometido (M3).

**Independent Test**: Puede probarse seleccionando un filtro (ej. "Solo disponibles") y verificando que el listado se actualiza mostrando únicamente motos que cumplen el criterio.

**Acceptance Scenarios**:

1. **Given** que el cliente está en el catálogo, **When** selecciona el filtro "Solo disponibles", **Then** el listado muestra únicamente motos con estado "Disponible".
2. **Given** que el cliente ingresa un término de búsqueda (ej. nombre de modelo), **When** confirma la búsqueda, **Then** el listado muestra solo motos cuyo nombre o modelo contiene ese término.
3. **Given** que el cliente aplica un rango de precio, **When** el filtro se aplica, **Then** solo aparecen motos dentro del rango especificado.
4. **Given** que ninguna moto coincide con los filtros activos, **When** el resultado está vacío, **Then** se muestra un mensaje amigable indicando que no hay resultados y sugiriendo ampliar los filtros.

---

### User Story 3 - Ver Detalle de una Moto (Priority: P2)

Como cliente, quiero ver la ficha completa de una moto específica (galería, especificaciones técnicas, precio, estado) para evaluar si quiero apartarla.

**Why this priority**: Es el paso natural después de descubrir una moto en el catálogo; necesario para completar el recorrido hasta el apartado.

**Independent Test**: Puede probarse navegando desde el catálogo a una moto y verificando que la ficha muestra galería de imágenes, especificaciones, precio y CTA de apartado (si está disponible).

**Acceptance Scenarios**:

1. **Given** que el cliente hace clic en una moto del catálogo, **When** se abre la ficha, **Then** ve una galería navegable de fotos, especificaciones técnicas completas, precio en MXN y estado de disponibilidad.
2. **Given** que la moto está en estado "Disponible", **When** el cliente ve la ficha, **Then** aparece un botón llamativo de "Apartar esta moto".
3. **Given** que la moto está en estado "Apartada", **When** el cliente ve la ficha, **Then** el botón de apartado está deshabilitado o ausente, y se muestra claramente que ya no está disponible.
4. **Given** que el cliente está en la ficha de cualquier moto, **When** busca cómo contactar, **Then** ve un botón o widget de WhatsApp visible para hacer preguntas directamente.

---

### User Story 4 - Contactar por WhatsApp desde el Catálogo (Priority: P3)

Como cliente, quiero poder contactar a la tienda por WhatsApp directamente desde el catálogo o la ficha de una moto, sin tener que buscar el número aparte.

**Why this priority**: Refuerza la confianza y reduce la fricción de contacto, especialmente para el público joven (M9 del alcance comprometido).

**Independent Test**: Puede probarse verificando que el botón de WhatsApp es visible en la página de catálogo y en la ficha de moto, y que al pulsarlo abre WhatsApp con el número de la tienda.

**Acceptance Scenarios**:

1. **Given** que el cliente está en el catálogo o en la ficha de una moto, **When** la página carga, **Then** ve un botón flotante de WhatsApp visible sin necesidad de hacer scroll.
2. **Given** que el cliente toca el botón de WhatsApp, **When** se abre la acción, **Then** se abre WhatsApp (app o web) con el número de la tienda y un mensaje predefinido, listo para enviar.

---

### Edge Cases

- **Catálogo vacío** (todas las motos en estado "Vendida" o sin motos cargadas): el sistema muestra un mensaje amigable ("Pronto habrá motos disponibles") junto al botón flotante de WhatsApp para que el cliente consulte disponibilidad directamente.
- **Imagen de moto no disponible**: se muestra una imagen de respaldo genérica (placeholder) para no romper el layout del listado o la ficha.
- **Catálogo con exactamente 1 moto**: el listado funciona con normalidad; no se requiere diseño especial.
- **Ficha sin especificaciones técnicas cargadas**: los campos vacíos se omiten de la vista del cliente; no se muestran etiquetas sin valor.
- **Filtros combinados sin resultados**: se muestra el mensaje de "No hay resultados" (FR-006) con opción de limpiar todos los filtros activos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar un listado de motos con foto principal, nombre de modelo, precio en MXN y etiqueta de estado (Disponible / Apartada), ordenado por fecha de carga descendente (más reciente primero).
- **FR-002**: El sistema DEBE excluir del listado público las motos con estado "Vendida".
- **FR-003**: El sistema DEBE permitir filtrar las motos por estado de disponibilidad (Disponible, Apartada, o ambas).
- **FR-004**: El sistema DEBE permitir filtrar las motos por rango de precio en MXN.
- **FR-005**: El sistema DEBE permitir buscar motos por nombre o modelo mediante texto libre.
- **FR-006**: El sistema DEBE mostrar un mensaje amigable cuando ninguna moto coincide con los filtros activos.
- **FR-007**: El sistema DEBE permitir al cliente acceder a la ficha completa de cualquier moto desde el listado.
- **FR-008**: La ficha de moto DEBE mostrar galería de imágenes navegable, especificaciones técnicas, precio en MXN y estado de disponibilidad.
- **FR-009**: La ficha de moto DEBE mostrar el CTA de apartado únicamente cuando la moto está en estado "Disponible".
- **FR-010**: El catálogo y la ficha de moto DEBEN mostrar un botón flotante de WhatsApp que al pulsarse abre WhatsApp directamente (deep link `wa.me/número`) con un mensaje predefinido opcional. El botón debe ser visible en todo momento sin necesidad de hacer scroll.
- **FR-011**: Todo el contenido del catálogo (fotos, precios, especificaciones, estado) DEBE ser editable por el admin sin cambios de código ni despliegues.
- **FR-012**: El catálogo DEBE ser funcional y usable en dispositivos móviles (diseño responsive).
- **FR-013**: Cuando no existan motos visibles en el catálogo, el sistema DEBE mostrar un mensaje amigable y el botón de WhatsApp para que el cliente pueda consultar disponibilidad.

### Key Entities

- **Moto**: Unidad en venta. Atributos: nombre/modelo, galería de fotos, precio MXN, estado (Disponible / Apartada / Vendida), y las siguientes especificaciones técnicas fijas: Año, Cilindraje (cc), Tipo (scooter / sport / naked / custom), Color(es), Motor, Potencia, Peso.
- **Estado de Moto**: Enumeración de tres valores exactos — Disponible (verde), Apartada (amarillo), Vendida (gris). Determina visibilidad en catálogo y disponibilidad del CTA de apartado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un cliente puede encontrar una moto de su interés y acceder a su ficha completa en menos de 60 segundos desde que entra al catálogo.
- **SC-002**: El catálogo carga y muestra el listado completo de motos en menos de 3 segundos en una conexión móvil estándar (4G).
- **SC-003**: El 100% de las motos con estado "Disponible" o "Apartada" aparecen en el catálogo; el 0% de las motos "Vendidas" aparecen.
- **SC-004**: Los filtros de disponibilidad y precio producen resultados correctos en el 100% de los casos.
- **SC-005**: El botón de WhatsApp es visible y funcional en el catálogo y en la ficha de moto en dispositivos móviles y desktop.
- **SC-006**: El admin puede actualizar precio, foto o estado de una moto y el cambio se refleja en el catálogo público sin intervención del equipo de desarrollo.

## Clarifications

### Session 2026-06-18

- Q: ¿Qué especificaciones técnicas deben mostrarse en la ficha de cada moto? → A: Set fijo de 7 campos — Año, Cilindraje (cc), Tipo (scooter/sport/naked/custom), Color(es), Motor, Potencia, Peso.
- Q: ¿Cómo se ordenan las motos en el catálogo por defecto? → A: Por fecha de carga, más reciente primero.
- Q: ¿Cómo funciona la integración de WhatsApp? → A: Botón flotante con deep link (`wa.me/número`) y mensaje predefinido; sin widget embebido de terceros.
- Q: ¿Qué muestra el catálogo cuando está completamente vacío? → A: Mensaje amigable ("Pronto habrá motos disponibles") + botón de WhatsApp para consultar disponibilidad.

## Assumptions

- Se asume que el catálogo contendrá aproximadamente 10 SKUs en el lanzamiento inicial.
- Se asume que el número de WhatsApp de la tienda será provisto por el cliente antes del lanzamiento; el widget usará ese número fijo.
- Se asume que las motos "Vendidas" deben ocultarse completamente del catálogo público (no solo deshabilitadas).
- Se asume que los filtros operan sobre el catálogo visible (sin motos Vendidas), no sobre el inventario total.
- Las especificaciones técnicas mostradas en la ficha son un set fijo de 7 campos: Año, Cilindraje (cc), Tipo, Color(es), Motor, Potencia y Peso. El admin los completa al cargar cada moto en el CMS.
- Se asume que la identidad visual definitiva (colores, tipografía, logo) será provista por el cliente; hasta entonces se usará Suzuki MX como referencia de tono y estructura.
- Se asume que el catálogo no requiere paginación en Fase 1 dado el volumen de ~10 motos; se mostrará el listado completo.
- **[NEEDS CLARIFICATION: S3 — ¿Cuándo estará disponible la identidad visual definitiva (logo, colores, tipografía) para aplicarla al catálogo?]**
