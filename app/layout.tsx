import type { Metadata } from 'next'
import { DM_Sans, Oxanium } from "next/font/google"

import "./globals.css"
import { SiteHeader } from "@/components/layout/site-header"
import { cn } from "@/lib/utils";
import { brand } from '@/lib/config/brand'
import { getSiteConfig } from '@/lib/payload/siteConfig'

export const metadata: Metadata = {
  metadataBase: new URL(brand.sitioUrl),
}

const oxaniumHeading = Oxanium({subsets:['latin'],variable:'--font-heading'});

const dmSans = DM_Sans({subsets:['latin'],variable:'--font-sans'})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteConfig = await getSiteConfig()

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn("antialiased font-sans", dmSans.variable, oxaniumHeading.variable)}
    >
      <body suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring focus:shadow-md"
        >
          Ir al contenido principal
        </a>
        <SiteHeader logoUrl={siteConfig.logoUrl} logoAlt={siteConfig.logoAlt} />
        <div id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </div>
      </body>
    </html>
  )
}
