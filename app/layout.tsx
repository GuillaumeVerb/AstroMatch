import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { ToastProvider } from '../components/ToastContainer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'AstroMatch - Compatibilité Astrologique',
  description: 'Découvrez votre compatibilité astrologique avec votre partenaire. Analyse précise basée sur les positions planétaires, aspects et dynamiques karmiques.',
  keywords: 'astrologie, compatibilité, couple, horoscope, relation, astromatch',
  authors: [{ name: 'AstroMatch' }],
  openGraph: {
    title: 'AstroMatch - Compatibilité Astrologique',
    description: 'Découvrez votre compatibilité astrologique avec votre partenaire',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'AstroMatch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AstroMatch - Compatibilité Astrologique',
    description: 'Découvrez votre compatibilité astrologique avec votre partenaire',
  },
  robots: {
    index: true,
    follow: true,
  },
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
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

