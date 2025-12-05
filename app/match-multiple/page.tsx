'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { translations } from '../../translations'
import { useToast } from '../../components/ToastContainer'

export default function MatchMultiplePage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [jsonInput, setJsonInput] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = JSON.parse(jsonInput)
      const response = await fetch('/api/match-multiple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Request failed')
      }

      const result = await response.json()
      setResults(result)
      showToast(t.matchMultiple.success || 'Calcul réussi !', 'success')
      if (window.plausible) {
        window.plausible('match_multiple_success')
      }
    } catch (error: any) {
      console.error('Error:', error)
      showToast(error.message || t.matchMultiple.error, 'error')
      if (window.plausible) {
        window.plausible('match_multiple_error')
      }
    } finally {
      setLoading(false)
    }
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
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
          <h2 className="text-3xl font-bold mb-6">{t.matchMultiple.title}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={t.matchMultiple.placeholder}
              required
              className="w-full h-64 rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 font-mono text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-purple-500 text-black font-bold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? t.matchMultiple.loading : t.matchMultiple.submit}
            </button>
          </form>
        </div>

        {results && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-4">{t.matchMultiple.results}</h3>
            <pre className="text-gray-300 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

