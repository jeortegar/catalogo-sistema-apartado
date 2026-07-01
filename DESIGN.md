---
name: Grupo Velmot Catálogo Digital
description: Catálogo de motos de importación — auténtico, callejero, local
colors:
  primary: "oklch(0.66 0.19 48)"
  primary-light: "oklch(0.86 0.10 65)"
  primary-dark: "oklch(0.42 0.14 45)"
  asphalt-dark: "oklch(0.145 0.004 65)"
  concrete-light: "oklch(0.985 0.005 85)"
  surface-muted: "oklch(0.97 0.003 85)"
  border-subtle: "oklch(0.922 0.002 85)"
  road-dust: "oklch(0.556 0 0)"
  whatsapp-green: "oklch(0.74 0.20 148)"
  estado-disponible: "oklch(0.65 0.17 145)"
  estado-apartada: "oklch(0.73 0.17 65)"
typography:
  display:
    fontFamily: "Oxanium, monospace"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Oxanium, monospace"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "Oxanium, monospace"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.04em"
rounded:
  sm: "6px"
  md: "8px"
  base: "10px"
  xl: "14px"
  card: "18px"
  pill: "26px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.concrete-light}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "40px"
  button-cta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.concrete-light}"
    rounded: "{rounded.card}"
    padding: "0 24px"
    height: "56px"
  button-cta-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.concrete-light}"
    rounded: "{rounded.card}"
    padding: "0 24px"
    height: "56px"
  badge-disponible:
    backgroundColor: "{colors.estado-disponible}"
    textColor: "{colors.concrete-light}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-apartada:
    backgroundColor: "{colors.estado-apartada}"
    textColor: "{colors.asphalt-dark}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  whatsapp-fab:
    backgroundColor: "{colors.whatsapp-green}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    size: "56px"
  moto-card:
    backgroundColor: "{colors.concrete-light}"
    rounded: "{rounded.card}"
    padding: "0"
  input-field:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.asphalt-dark}"
    rounded: "{rounded.base}"
    height: "36px"
    padding: "0 12px"
---

# Design System: Grupo Velmot Catálogo Digital

## 1. Overview

**Creative North Star: "El Catálogo Impreso"**

La energía de un catálogo de colección bien editado: tipografía fuerte en cuadrícula deliberada, cada foto con espacio para respirar. El diseño habla del objeto que vende, no de sí mismo. Oxanium es la voz mecánica y precisa que une el mundo de la moto con la cultura del impreso; DM Sans es el cuerpo legible que no pide atención. El acento ámbar entra una vez y se gana su lugar, nunca decora sin propósito.

El sistema rechaza la estética de las distribuidoras genéricas de autos (fondos blancos infinitos, azul corporativo, filas idénticas), el frío del e-commerce europeo de lujo, la asepsia de los distribuidores japoneses oficiales, y la oscuridad editorial de sitios como Iron & Resin. Nada de eso es Grupo Velmot: ninguno de esos sitios trata al comprador de igual a igual.

La escena física: un comprador en su celular, en el metro o en una silla en casa, comparando motos. El sitio debe sentirse tan sólido y curado como un catálogo de sneakers de colección que alguien tomó de un estante. El color ámbar es la misma energía de las etiquetas de precio escritas con marcador en una tienda que sabe lo que vale.

**Key Characteristics:**
- Tipografía de alto contraste: Oxanium en números y títulos, DM Sans en cuerpo
- Un solo acento cromático ámbar usado con precisión quirúrgica: precios, CTAs, hover de las tarjetas
- Fondos neutros con calor mínimo (chroma ~0.005, hue 65–85) que no se leen como blanco de app SaaS
- Componentes táctiles: feedback de 150ms, active states visibles, sin rebote ni spring
- Elevación gestual: superficies planas en reposo, sombra solo como respuesta al hover
- Cuadrícula con ritmo: las tarjetas tienen el mismo ancho pero el contenido dentro varía su peso visual

## 2. Colors: La Paleta del Taller

Un sistema de neutrales cálidos con un acento ámbar-naranja como único color de decisión. Todo lo demás soporta; nada distrae.

### Primary
- **Ámbar Taller** (`oklch(0.66 0.19 48)`): El color de acción del sistema. Precios en la ficha de detalle, CTA "Apartar", hover de tarjetas en modo oscuro, estado focus de inputs. Aparece en ≤15% de la superficie de cualquier pantalla. Su escasez es intencional.
- **Ámbar Encendido** (`oklch(0.42 0.14 45)`): Variante dark de hover/active. Se usa cuando el Ámbar Taller necesita confirmar que algo fue presionado.
- **Ámbar Suave** (`oklch(0.86 0.10 65)`): Tint de fondo para callouts, indicadores de precio secundarios, estado hover en tarjetas en modo claro.

### Secondary
- **Verde Conexión** (`oklch(0.74 0.20 148)`): Reservado exclusivamente para todo lo que toca WhatsApp. El FAB, el CTA en empty state, cualquier confirmación de mensaje. No se usa para ningún otro propósito. Su semántica es "contacto humano".

### Tertiary
- **Verde Disponible** (`oklch(0.65 0.17 145)`): Badge de estado "Disponible" en tarjetas y ficha. Al 15% de opacidad como fondo, 100% como texto en modo oscuro.
- **Ámbar Reservada** (`oklch(0.73 0.17 65)`): Badge de estado "Apartada". Al 15% de opacidad como fondo, texto ámbar-oscuro en modo claro, ámbar-claro en modo oscuro.

### Neutral
- **Asfalto Nocturno** (`oklch(0.145 0.004 65)`): Foreground principal en modo claro, background en modo oscuro. Levemente cálido (chroma 0.004, hue 65) para evitar el negro digital muerto.
- **Cemento Blanco** (`oklch(0.985 0.005 85)`): Background en modo claro. Casi blanco con calor mínimo perceptible que diferencia de una página SaaS.
- **Concreto Claro** (`oklch(0.97 0.003 85)`): Background de superficies elevadas (cards en modo claro, muted backgrounds).
- **Línea de Piso** (`oklch(0.922 0.002 85)`): Bordes de tarjetas, separadores, input stroke.
- **Polvo de Ruta** (`oklch(0.556 0 0)`): Texto secundario, labels de filtro, metadata de moto.

### Named Rules
**La Regla del Acento Ganado.** El ámbar entra solamente para precios, CTAs primarias, y respuestas a interacción. Si estás poniendo ámbar en un título, encabezado decorativo, o elemento que no es accionable, no lo pongas.

**La Regla del Verde Único.** `oklch(0.74 0.20 148)` (Verde Conexión) pertenece al WhatsApp. Prohibido usarlo en botones genéricos, highlights, o decoración. Su especificidad semántica es su valor.

## 3. Typography: Mecánica y Legible

**Display / Headline Font:** Oxanium (fallback: monospace)
**Body Font:** DM Sans (fallback: sans-serif)

**Character:** Oxanium trae la precisión del taller mecánico: esquinas limpias, trazos que no se excusan por su geometría. En precios y nombres de moto, su carácter mecánico hace que los números se sientan como datos técnicos dignos de la moto. DM Sans sostiene el sistema con calidez legible; no compite, complementa.

### Hierarchy
- **Display** (Oxanium 700, clamp(2rem, 5vw, 3.5rem), line-height 1.05, tracking -0.02em): Nombre de moto en la ficha de detalle. Máximo una instancia por pantalla. Solo móvil puede reducirlo al valor mínimo.
- **Headline** (Oxanium 700, 1.875rem, line-height 1.1): H1 de página ("Catálogo de Motos"). Una por página.
- **Title** (Oxanium 600, 1.25rem, line-height 1.2): Nombre de moto en tarjeta de catálogo. También aplica al precio en tarjeta cuando está en modo emphasis.
- **Body** (DM Sans 400, 1rem, line-height 1.5): Texto corriente, descripciones, copy de empty states. Máximo 72ch de ancho.
- **Label** (DM Sans 500, 0.75rem, tracking 0.04em): Etiquetas de filtro, metadata de especificación (campo "Año", "Tipo"), badges de estado.

### Named Rules
**La Regla del Precio en Oxanium.** El precio de la moto en la ficha de detalle va en Oxanium, no en DM Sans. El precio es el dato más mecánicamente importante de la página; debe leerse con autoridad técnica, no como texto de párrafo.

**La Regla de la Jerarquía de Doce Puntos.** El ratio mínimo entre niveles tipográficos adyacentes es 1.25. Una escala plana donde todo tiene el mismo peso visual es indistinguible del default de un framework.

## 4. Elevation: Plano con Respuesta

Este sistema es flat por defecto. Las superficies no se elevan en reposo; viven en el mismo plano visual que su contexto. La sombra es un evento, no una propiedad permanente.

Las tarjetas de moto en el catálogo no tienen sombra en reposo. En hover, `box-shadow: 0 8px 32px oklch(0.145 0.004 65 / 0.12)` aparece en 150ms con ease-out. Eso es todo el vocabulario de sombras del sistema.

### Shadow Vocabulary
- **Hover Lift** (`0 8px 32px oklch(0.145 0.004 65 / 0.12)`): Tarjetas de catálogo en estado hover. Aparece en 150ms, desaparece en 150ms. Solo este valor; no hay variantes de shadow más grandes o más oscuras.
- **FAB Anchor** (`0 4px 20px oklch(0.74 0.20 148 / 0.35)`): Exclusiva del WhatsApp FAB. Una sombra tintada en verde que ancla el botón a su posición fija y refuerza su identidad semántica.

### Named Rules
**La Regla del Plano Activo.** Las superficies no se elevan para señalar jerarquía; se elevan para señalar interacción. Si un elemento tiene sombra en reposo, es porque hay una razón funcional, no decorativa.

## 5. Components: Táctiles y Directos

Todos los componentes responden en ≤150ms con ease-out. Active states son visibles (translateY(1px) en botones, opacity-80 en links). Ningún componente usa spring, bounce, ni elastic.

### Buttons
- **Shape:** Píldora completa en botones de navegación (26px radius — `rounded-pill`). Card-radius en CTAs de acción principal (18px — `rounded-card`). Nunca cuadrado.
- **Primary (navegación):** Fondo Ámbar Taller, texto Cemento Blanco, padding 0 24px, altura 40px. Hover: Ámbar Encendido (150ms ease-out). Active: translateY(1px).
- **CTA principal ("Apartar esta moto"):** Fondo Ámbar Taller, texto Cemento Blanco, ancho completo, altura 56px, radius 18px. Hover: Ámbar Encendido. Es el único botón de esta forma en el sistema.
- **Ghost / Secondary:** Sin fondo, borde 1px Línea de Piso, texto Asfalto Nocturno. Para acciones secundarias como "Limpiar filtros".
- **Disabled:** Opacidad 50%, pointer-events none. Sin cambio de color.

### Status Badges
- **Disponible:** Fondo Verde Disponible al 15% de opacidad, texto Verde Disponible al 100%, shape píldora completa, padding 4px 10px, label en DM Sans 500 0.75rem.
- **Apartada:** Fondo Ámbar Reservada al 15%, texto Ámbar Reservada oscuro, misma forma. En dark mode: fondo al 20% opacidad oscuro.
- Prohibido mostrar el badge "Vendida" en el catálogo o en la ficha; las motos vendidas no están en el catálogo.

### Cards (Moto Card)
- **Corner Style:** 18px radius (card) en todas las esquinas.
- **Background:** Cemento Blanco en modo claro; Concreto Claro en modo oscuro (leve diferencia tonal sin sombra).
- **Shadow Strategy:** Ninguna en reposo. Hover Lift en hover (ver Elevation).
- **Border:** 1px Línea de Piso en reposo. Se mantiene en hover.
- **Internal Padding:** 0 en la imagen (fill completo). 16px en el bloque de texto inferior.
- **Image ratio:** 4:3 forzado. object-cover. En error de imagen, placeholder SVG con `object-contain` y padding 32px.
- **Heading:** Oxanium 600 (Title level), 2 líneas máximo con line-clamp.
- **Price:** Oxanium 700 en Ámbar Taller. Es la única aplicación de color primario en la tarjeta.

### Filter Panel
- **Shape:** 18px radius, borde 1px Línea de Piso.
- **Background:** Concreto Claro (no el mismo que el background de página) para establecer separación tonal sin sombra.
- **Inputs dentro:** h-9, radius 10px, fondo Concreto Claro al 50%, borde Línea de Piso. Focus: borde Ámbar Taller, ring ámbar/40.
- **"Limpiar filtros" button:** Solo visible cuando hay filtros activos. Ghost style con ícono X.

### Spec Table
- **Shape:** 18px radius, overflow hidden, borde 1px Línea de Piso.
- **Header:** Texto Label (DM Sans 500, 0.75rem, tracking 0.04em, uppercase) en Polvo de Ruta. Fondo Concreto Claro, borde inferior Línea de Piso.
- **Filas:** Alternancia dt (Polvo de Ruta) / dd (Asfalto Nocturno, font-medium), separadas por borde inferior Línea de Piso. Padding 12px 20px.

### WhatsApp FAB
- **Position:** Fija, bottom 24px right 24px, z-50.
- **Shape:** Círculo completo (56x56px).
- **Color:** Verde Conexión exclusivamente. FAB Anchor shadow siempre visible.
- **Hover:** scale(1.1), 150ms ease-out. Active: scale(0.95).
- **Ícono:** MessageCircle de Lucide, 28px.

### Apartar Warning (Estado Apartada)
- **Shape:** 18px radius, borde 1px amber-200 / dark: amber-800/40.
- **Background:** amber-50 / dark: amber-950/20.
- **Contenido:** Ícono Lock (20px, Ámbar Reservada), heading "Esta moto ya fue apartada" (DM Sans 500), subtext explicativo (DM Sans 400, 0.75rem, muted).
- Prohibido usar un botón deshabilitado aquí. El estado no es "no puedes hacer algo"; es información de que el objeto ya fue reservado.

## 6. Do's and Don'ts

### Do:
- **Do** usar Oxanium para todos los precios, nombres de moto, y el H1 de página. La fuente mecánica es la voz de la marca; no la delegates a DM Sans.
- **Do** dejar el Ámbar Taller para precios y CTAs únicamente. Si tienes tentación de usarlo en un título decorativo, no lo hagas.
- **Do** hacer que las tarjetas de catálogo tengan la imagen en ratio 4:3 forzado con `object-cover`. La consistencia del formato crea la cuadrícula editorial.
- **Do** aplicar Hover Lift (la única sombra del sistema) a los elementos que responden al cursor. La sombra es el lenguaje de "esto se mueve cuando lo tocas".
- **Do** variar el peso visual entre tarjetas mediante el precio y el badge de estado. La cuadrícula tiene ritmo cuando no todos los elementos tienen el mismo peso.

### Don't:
- **Don't** usar el azul de shadcn (`oklch(0.5 0.134 242.749)`) como primary. No tiene nada que ver con Grupo Velmot y es la señal de identidad más fuerte de "plantilla sin customizar".
- **Don't** hacer que el fondo sea `oklch(1 0 0)` puro. Cemento Blanco tiene chroma 0.005 a hue 85; esa diferencia minúscula separa "distribuidora con criterio" de "app SaaS en blanco".
- **Don't** imitar las agencias genéricas de autos: fondos blancos infinitos, filas idénticas de vehículos, tipografía corporativa intercambiable con cualquier competitor.
- **Don't** imitar el e-commerce de lujo europeo: fondo negro total, tipografía serif fría, precios sin contexto. Grupo Velmot es accesible, no exclusivista.
- **Don't** imitar los distribuidores japoneses oficiales (Honda.com, Yamaha MX): demasiado limpio, demasiado técnico, sin voz propia. El manual de marca de un fabricante no es el manual de Grupo Velmot.
- **Don't** usar la estética editorial de sitios como Iron & Resin o Deus Ex Machina: fotografía oscura, cultura custom/vintage muy nicho. Grupo Velmot vende motos de uso diario a compradores reales.
- **Don't** usar gradient text (background-clip: text + gradient). Prohibido en todo el sistema.
- **Don't** usar border-left o border-right como stripe de acento en tarjetas o callouts. Si necesitas señalar énfasis, usa fondo tintado o borde completo.
- **Don't** aplicar sombras en reposo a las tarjetas. La sombra es un evento de hover, no una propiedad permanente.
- **Don't** usar Verde Conexión (`oklch(0.74 0.20 148)`) fuera del contexto de WhatsApp. Su semántica es específica y su valor viene de esa especificidad.
