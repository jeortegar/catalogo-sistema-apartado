import { fetchFromCMS } from './client'

const USE_MOCKS = process.env.USE_MOCK_DATA === 'true'
const CMS_URL = process.env.PAYLOAD_CMS_URL ?? ''

interface PayloadMediaRaw {
  url: string
  width?: number
  height?: number
  alt?: string
}

interface ConfiguracionSitioRaw {
  logotipo?: PayloadMediaRaw | null
  imagenHero?: PayloadMediaRaw | null
  subtituloHero?: string | null
}

export interface SiteConfig {
  logoUrl: string | null
  logoAlt: string
  heroUrl: string | null
  heroWidth: number | null
  heroHeight: number | null
  heroAlt: string
  subtituloHero: string
}

const FALLBACK: SiteConfig = {
  logoUrl: '/assets/logo.png',
  logoAlt: 'Grupo Velmot',
  heroUrl: '/assets/hero.png',
  heroWidth: 1920,
  heroHeight: 1080,
  heroAlt: 'Grupo Velmot — motos de importación',
  subtituloHero: 'Motos de importación. Apartas en línea.',
}

function resolveUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null
  return rawUrl.startsWith('http') ? rawUrl : `${CMS_URL}${rawUrl}`
}

export async function getSiteConfig(): Promise<SiteConfig> {
  if (USE_MOCKS) return FALLBACK

  try {
    const data = await fetchFromCMS<ConfiguracionSitioRaw>(
      '/api/globals/configuracion-sitio',
      3600,
    )

    const logo = data.logotipo
    const hero = data.imagenHero

    return {
      logoUrl: resolveUrl(logo?.url) ?? FALLBACK.logoUrl,
      logoAlt: logo?.alt ?? FALLBACK.logoAlt,
      heroUrl: resolveUrl(hero?.url) ?? FALLBACK.heroUrl,
      heroWidth: hero?.width ?? null,
      heroHeight: hero?.height ?? null,
      heroAlt: hero?.alt ?? FALLBACK.heroAlt,
      subtituloHero: data.subtituloHero ?? FALLBACK.subtituloHero,
    }
  } catch {
    return FALLBACK
  }
}
