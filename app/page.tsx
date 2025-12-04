'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { translations } from '../translations'

const API_BASE = 'https://web-production-37fb.up.railway.app'

declare global {
  interface Window {
    plausible?: (event: string) => void
  }
}

export default function HomePage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [person1_firstname, setPerson1Firstname] = useState('')
  const [person1_date, setPerson1Date] = useState('')
  const [person1_time, setPerson1Time] = useState('')
  const [person1_place, setPerson1Place] = useState('')
  const [person2_firstname, setPerson2Firstname] = useState('')
  const [person2_date, setPerson2Date] = useState('')
  const [person2_time, setPerson2Time] = useState('')
  const [person2_place, setPerson2Place] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const router = useRouter()

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
      const response = await fetch(`${API_BASE}/api/compatibility/astromatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: {
            firstname: person1_firstname,
            date: person1_date,
            time: person1_time,
            place: person1_place,
          },
          person2: {
            firstname: person2_firstname,
            date: person2_date,
            time: person2_time,
            place: person2_place,
          },
          email,
        }),
      })

      const report = await response.json()

      await fetch(`${API_BASE}/api/compatibility/astromatch/save-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      await fetch(`${API_BASE}/api/compatibility/astromatch/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1_firstname,
          person2_firstname,
          email,
        }),
      })

      const historyEntry = {
        date: new Date().toISOString(),
        overall_score: report.overall_score || 0,
        person1_firstname,
        person2_firstname,
        report,
      }

      const history = JSON.parse(localStorage.getItem('astromatch_history') || '[]')
      history.unshift(historyEntry)
      localStorage.setItem('astromatch_history', JSON.stringify(history))

      localStorage.setItem('astromatch_report', JSON.stringify(report))
      localStorage.setItem('astromatch_firstname1', person1_firstname)
      localStorage.setItem('astromatch_firstname2', person2_firstname)

      setPreview(report)

      if (window.plausible) {
        window.plausible('compatibility_calculated')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (window.plausible) {
      window.plausible('paywall_viewed')
    }
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        person1_firstname,
        person2_firstname,
      }),
    })
    const { url } = await response.json()
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1020] to-[#120b2e] text-white">
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
          AstroMatch
        </h1>
        <div className="flex gap-4 items-center">
          <Link href="/history" className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition">
            {t.nav.history}
          </Link>
          <button
            onClick={handleLangToggle}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {!preview ? (
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-3xl font-bold mb-6">{t.form.title}</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">{t.form.person1}</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={t.form.firstname}
                    value={person1_firstname}
                    onChange={(e) => setPerson1Firstname(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="date"
                    value={person1_date}
                    onChange={(e) => setPerson1Date(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="time"
                    value={person1_time}
                    onChange={(e) => setPerson1Time(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="text"
                    placeholder={t.form.place}
                    value={person1_place}
                    onChange={(e) => setPerson1Place(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">{t.form.person2}</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={t.form.firstname}
                    value={person2_firstname}
                    onChange={(e) => setPerson2Firstname(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="date"
                    value={person2_date}
                    onChange={(e) => setPerson2Date(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="time"
                    value={person2_time}
                    onChange={(e) => setPerson2Time(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
                  />
                  <input
                    type="text"
                    placeholder={t.form.place}
                    value={person2_place}
                    onChange={(e) => setPerson2Place(e.target.value)}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <input
                type="email"
                placeholder={t.form.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-purple-500 text-black font-bold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? t.form.loading : t.form.submit}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-3xl font-bold mb-4">
              {t.preview.title} {preview.overall_score}%
            </h2>
            <p className="text-gray-300 mb-6">{t.preview.description}</p>
            <button
              onClick={handleCheckout}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-purple-500 text-black font-bold hover:opacity-90 transition"
            >
              {t.preview.unlock}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

