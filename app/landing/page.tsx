'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { translations } from '../../translations'

export default function LandingPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')

  useEffect(() => {
    const savedLang = localStorage.getItem('astromatch_lang') as 'fr' | 'en' | null
    if (savedLang) setLang(savedLang)
  }, [])

  const t = translations[lang]

  const handleLangToggle = () => {
    const newLang = lang === 'fr' ? 'en' : 'fr'
    setLang(newLang)
    localStorage.setItem('astromatch_lang', newLang)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] to-[#120b2e] text-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
          AstroMatch
        </h1>
        <button
          onClick={handleLangToggle}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition"
        >
          {lang === 'fr' ? 'EN' : 'FR'}
        </button>
      </nav>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
          {t.landing.hero.title}
        </h2>
        <p className="text-xl mb-8 text-gray-300">{t.landing.hero.subtitle}</p>
        <Link
          href="/"
          className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-purple-500 text-black font-bold hover:opacity-90 transition"
        >
          {t.landing.hero.cta}
        </Link>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-bold mb-4">{t.landing.features.one.title}</h3>
            <p className="text-gray-300">{t.landing.features.one.desc}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-bold mb-4">{t.landing.features.two.title}</h3>
            <p className="text-gray-300">{t.landing.features.two.desc}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-xl font-bold mb-4">{t.landing.features.three.title}</h3>
            <p className="text-gray-300">{t.landing.features.three.desc}</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">{t.landing.cta.title}</h2>
        <Link
          href="/"
          className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-purple-500 text-black font-bold hover:opacity-90 transition"
        >
          {t.landing.cta.button}
        </Link>
      </section>
    </div>
  )
}

