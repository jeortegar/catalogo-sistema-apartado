# Quickstart: Validación del Catálogo de Motos

**Feature**: 001-catalogo-motos | **Date**: 2026-06-18

Guía para verificar que el catálogo funciona end-to-end una vez implementado.

## Prerrequisitos

1. **Payload CMS corriendo** con la colección `motos` configurada ([data-model.md](data-model.md))
2. **Al menos 3 motos de prueba** cargadas en el CMS:
   - Moto A: `estado = disponible`, con todas las especificaciones
   - Moto B: `estado = apartada`, con imagen pero sin especificaciones
   - Moto C: `estado = vendida` (para verificar exclusión)
3. **Variables de entorno configuradas** en `.env.local`:
   ```
   PAYLOAD_CMS_URL=http://localhost:3001
   NEXT_PUBLIC_WHATSAPP_NUMBER=5512345678
   ```
4. **Servidor de desarrollo corriendo**: `npm run dev`

---

## Escenario 1: Listado del catálogo

**URL**: `http://localhost:3000/catalogo`

**Verificar**:
- [ ] Moto A y Moto B aparecen en el listado — Moto C NO aparece
- [ ] Moto A y Moto B muestran foto, nombre, precio en MXN y etiqueta de estado
- [ ] El orden es más reciente primero (la última cargada al CMS aparece primera)
- [ ] El botón flotante de WhatsApp es visible sin hacer scroll
- [ ] En mobile (DevTools → iPhone 12): layout en columna, sin scroll horizontal

---

## Escenario 2: Filtros del catálogo

**URL**: `http://localhost:3000/catalogo`

**Verificar**:
- [ ] Filtro "Solo disponibles": muestra solo Moto A
- [ ] Filtro "Solo apartadas": muestra solo Moto B
- [ ] Filtro "Todos": muestra Moto A y Moto B
- [ ] Filtro por tipo (si Moto A es `sport`): al seleccionar `sport`, solo aparece Moto A
- [ ] Búsqueda por nombre: escribir parte del nombre de Moto A → aparece Moto A, desaparece Moto B
- [ ] Sin resultados: aplicar filtro que excluye todo → mensaje amigable + botón WhatsApp visible

---

## Escenario 3: Ficha de moto con especificaciones

**URL**: `http://localhost:3000/catalogo/{slug-moto-a}`

**Verificar**:
- [ ] Galería de imágenes navegable (al menos 1 foto)
- [ ] Nombre, precio en MXN y estado "Disponible" visibles
- [ ] Los 7 campos de especificaciones aparecen: Año, Cilindraje, Tipo, Color(es), Motor, Potencia, Peso
- [ ] Botón "Apartar esta moto" visible y llamativo (Moto A está disponible)
- [ ] Botón flotante de WhatsApp visible
- [ ] Al pulsar WhatsApp: abre `wa.me/5512345678?text=...` con nombre de la moto en el mensaje

---

## Escenario 4: Ficha de moto sin especificaciones (Moto B)

**URL**: `http://localhost:3000/catalogo/{slug-moto-b}`

**Verificar**:
- [ ] Galería de imágenes funciona
- [ ] Estado "Apartada" visible
- [ ] Botón de apartado ausente o deshabilitado (Moto B está apartada)
- [ ] Los campos de especificaciones vacíos **no aparecen** (no se muestran etiquetas en blanco)

---

## Escenario 5: Catálogo vacío

1. Cambiar Moto A y Moto B a `estado = vendida` en el CMS
2. Esperar hasta 60 segundos (ISR revalidation) o recargar con `?_rsc=1`

**Verificar**:
- [ ] Catálogo no muestra motos
- [ ] Mensaje amigable visible ("Pronto habrá motos disponibles" o similar)
- [ ] Botón de WhatsApp presente para consultar disponibilidad

---

## Escenario 6: Imagen no disponible

1. En el CMS, cargar una moto con una URL de imagen rota (ej. `https://invalid.url/foto.jpg`)

**Verificar**:
- [ ] El layout del catálogo no se rompe
- [ ] Aparece imagen de placeholder (`moto-placeholder.svg`)

---

## Escenario 7: Slug inválido

**URL**: `http://localhost:3000/catalogo/moto-que-no-existe`

**Verificar**:
- [ ] Responde con página 404 de Next.js (no error 500)

---

## Comandos de verificación técnica

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Build de producción (verifica ISR y static params)
npm run build

# Ver páginas generadas en build output
# Buscar: /catalogo (Static), /catalogo/[slug] (ISR)
```

## Métricas de éxito a verificar (SC-001, SC-002)

- SC-001: Navegar desde catálogo hasta ficha de moto debe tomar <60 segundos (flujo manual)
- SC-002: Usar DevTools → Network → throttle a "Fast 4G" → verificar que el catálogo carga en <3 segundos (LCP en Performance tab)
