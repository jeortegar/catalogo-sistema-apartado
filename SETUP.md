# Guía de instalación y configuración

Este es un catálogo digital con sistema de apartado (reserva con depósito) construido con Next.js, Payload CMS y Conekta.

## Requisitos previos

- Node.js 20+
- Cuenta en [Railway](https://railway.app) (para alojar Payload CMS + PostgreSQL)
- Cuenta en [Conekta](https://app.conekta.com) (pasarela de pago)
- Cuenta en [Vercel](https://vercel.com) (para alojar el front-end)

---

## Paso 1 — Clonar e instalar

```bash
git clone <url-del-repo>
cd <nombre-del-proyecto>
npm install
cp .env.local.example .env.local
```

---

## Paso 2 — Configurar variables de entorno

Abre `.env.local` y rellena cada variable:

| Variable | Dónde obtenerla |
|---|---|
| `NEXT_PUBLIC_SITE_NAME` | El nombre de tu negocio |
| `NEXT_PUBLIC_SITE_URL` | Tu dominio final (ej. `https://minegocio.com`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Tu número en formato `521XXXXXXXXXX` |
| `PAYLOAD_CMS_URL` | URL de tu instancia Payload en Railway |
| `PAYLOAD_API_KEY` | Generada en Payload → Settings → API Keys |
| `CONEKTA_API_KEY` | Conekta → Developers → API Keys (usa test key en dev) |
| `CONEKTA_WEBHOOK_SECRET` | Conekta → Developers → Webhooks |
| `NEXT_PUBLIC_APP_URL` | Igual a `NEXT_PUBLIC_SITE_URL` |
| `REVALIDATE_SECRET` | Token aleatorio: `openssl rand -hex 32` |
| `USE_MOCK_DATA` | `true` para desarrollo sin CMS activo |

---

## Paso 3 — Configurar Payload CMS

1. Crea un nuevo proyecto en Railway con la plantilla **Payload CMS + PostgreSQL**.
2. En el panel de Payload, registra manualmente las siguientes colecciones usando el schema de la carpeta `cms/` como referencia:
   - `cms/collections/Motos.ts` → colección `Motos`
   - `cms/collections/Apartados.ts` → colección `Apartados`
   - `cms/globals/ConfiguracionApartado.ts` → global `Configuracion-Apartado`
3. Ve a **Settings → API Keys**, activa la opción y copia la key a `PAYLOAD_API_KEY`.
4. Configura el hook `afterChange` en la colección `Motos` para que llame a:
   ```
   GET https://tu-dominio.com/api/revalidate?secret=TU_REVALIDATE_SECRET&path=/catalogo
   ```

---

## Paso 4 — Configurar Conekta

1. Crea tu cuenta en [app.conekta.com](https://app.conekta.com).
2. En **Developers → API Keys** copia tu `test key` (empieza con `key_test_...`).
3. En **Developers → Webhooks**, agrega un nuevo webhook:
   - URL: `https://tu-dominio.com/api/conekta/webhook`
   - Evento: `charge.paid`
4. Copia el **Webhook Secret** a `CONEKTA_WEBHOOK_SECRET`.
5. Cuando estés listo para producción, cambia a tu `live key`.

---

## Paso 5 — Branding

### Nombre del negocio
Edita `NEXT_PUBLIC_SITE_NAME` en `.env.local`. Todos los títulos, metas y mensajes de WhatsApp se actualizan automáticamente.

### Logo
Reemplaza el archivo `public/assets/logo.png` con tu logo (recomendado: PNG cuadrado, 80×80px mínimo).

### Colores
Los colores del tema están definidos como variables CSS en `app/globals.css`. Busca la sección `@theme` y ajusta los valores de `--color-primary` y `--color-accent`.

### Fuentes
Las fuentes se configuran en `app/layout.tsx`. Cambia las importaciones de `next/font/google` según tu preferencia.

---

## Paso 6 — Deploy en Vercel

1. Conecta tu repositorio en [vercel.com/new](https://vercel.com/new).
2. En **Environment Variables**, agrega todas las variables de `.env.local` (excepto `USE_MOCK_DATA`).
3. Asegúrate de que `NEXT_PUBLIC_SITE_URL` apunte a tu dominio de producción.
4. Despliega. Vercel detecta Next.js automáticamente.

---

## Desarrollo local sin CMS

```bash
# En .env.local:
USE_MOCK_DATA=true

npm run dev
```

Los datos mock se editan en `lib/payload/mocks.ts`.

---

## Comandos útiles

```bash
npm run dev        # servidor de desarrollo (puerto 3000)
npm run build      # build de producción
npm run typecheck  # verificación de tipos (sin tests)
npm run lint       # ESLint
npm run format     # Prettier
```
