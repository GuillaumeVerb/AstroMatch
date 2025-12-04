import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AstroMatch - Compatibilité Astrologique',
  description: 'Découvrez votre compatibilité astrologique avec votre partenaire',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <Script
          strategy="afterInteractive"
          data-domain="astromatch.app"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}

