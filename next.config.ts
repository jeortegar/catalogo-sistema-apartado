import type { NextConfig } from "next"

const isLocalCMS = process.env.PAYLOAD_CMS_URL?.startsWith("http://localhost")

const nextConfig: NextConfig = {
  images: {
    // Next.js blocks fetch to private IPs in the image optimizer (anti-SSRF).
    // When the CMS runs locally we skip optimization entirely; in prod the CMS
    // is on a public Railway hostname and optimization works normally.
    unoptimized: isLocalCMS,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.railway.app" },
      { protocol: "https", hostname: "cms-catalogo-sistema-apartado.vercel.app" },
      { protocol: "https", hostname: "www.yamaha-motor.com.mx" },
      { protocol: "http", hostname: "localhost", port: "3001" },
    ],
  },
  headers: async () => {
    if (process.env.NODE_ENV !== "development") return []
    return [
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ]
  },
}

export default nextConfig
