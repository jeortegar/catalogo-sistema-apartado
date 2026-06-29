import type { Metadata } from 'next'
import { Geist_Mono, DM_Sans, Oxanium } from "next/font/google"

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

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
      className={cn("antialiased", fontMono.variable, "font-sans", dmSans.variable, oxaniumHeading.variable)}
    >
      <body suppressHydrationWarning>
        <SiteHeader logoUrl={siteConfig.logoUrl} logoAlt={siteConfig.logoAlt} />
        {children}
      </body>
    </html>
  )
}
