'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { translations } from '../../translations'

export default function HistoryPage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [history, setHistory] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const savedLang = localStorage.getItem('astromatch_lang') as 'fr' | 'en' | null
    if (savedLang) setLang(savedLang)

    const savedHistory = localStorage.getItem('astromatch_history')
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const t = translations[lang]

  const handleLangToggle = () => {
    const newLang = lang === 'fr' ? 'en' : 'fr'
    setLang(newLang)
    localStorage.setItem('astromatch_lang', newLang)
  }

  const handleViewReport = (entry: any) => {
    localStorage.setItem('astromatch_report', JSON.stringify(entry.report))
    localStorage.setItem('astromatch_firstname1', entry.person1_firstname)
    localStorage.setItem('astromatch_firstname2', entry.person2_firstname)
    router.push('/full-report')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] to-[#120b2e] text-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
          AstroMatch
        </h1>
        <div className="flex gap-4 items-center">
          <Link href="/" className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition">
            {t.nav.home}
          </Link>
          <button
            onClick={handleLangToggle}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="text-3xl font-bold mb-6">{t.history.title}</h2>

        {history.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-center">
            <p className="text-gray-300">{t.history.empty}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">
                      {entry.person1_firstname} & {entry.person2_firstname}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(entry.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                    </p>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
                    {entry.overall_score}%
                  </div>
                </div>
                <button
                  onClick={() => handleViewReport(entry)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-purple-500 text-black font-bold hover:opacity-90 transition"
                >
                  {t.history.viewReport}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

