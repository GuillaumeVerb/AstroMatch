'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { translations } from '../translations'
import PlaceAutocomplete from '../components/PlaceAutocomplete'

const API_BASE = 'https://web-production-37fb.up.railway.app'

declare global {
  interface Window {
    plausible?: (event: string) => void
  }
}

interface Coordinates {
  lat: string
  lon: string
  country: string
}

export default function HomePage() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [person1_firstname, setPerson1Firstname] = useState('')
  const [person1_date, setPerson1Date] = useState('')
  const [person1_time, setPerson1Time] = useState('')
  const [person1_place, setPerson1Place] = useState('')
  const [person1_coords, setPerson1Coords] = useState<Coordinates | null>(null)
  const [person2_firstname, setPerson2Firstname] = useState('')
  const [person2_date, setPerson2Date] = useState('')
  const [person2_time, setPerson2Time] = useState('')
  const [person2_place, setPerson2Place] = useState('')
  const [person2_coords, setPerson2Coords] = useState<Coordinates | null>(null)
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

  const handlePerson1PlaceChange = (value: string, coords?: Coordinates) => {
    setPerson1Place(value)
    if (coords) {
      setPerson1Coords(coords)
    }
  }

  const handlePerson2PlaceChange = (value: string, coords?: Coordinates) => {
    setPerson2Place(value)
    if (coords) {
      setPerson2Coords(coords)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
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
      }

      // Add coordinates if available
      if (person1_coords) {
        payload.person1.lat = person1_coords.lat
        payload.person1.lon = person1_coords.lon
        payload.person1.country = person1_coords.country
      }
      if (person2_coords) {
        payload.person2.lat = person2_coords.lat
        payload.person2.lon = person2_coords.lon
        payload.person2.country = person2_coords.country
      }

      const response = await fetch(`${API_BASE}/api/compatibility/astromatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] text-white relative overflow-hidden">
      {/* Mystical stars background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>

      {/* Mystical constellation lines */}
      <svg className="fixed inset-0 pointer-events-none opacity-20" width="100%" height="100%">
        <defs>
          <linearGradient id="constellation-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <line x1="10%" y1="20%" x2="25%" y2="35%" stroke="url(#constellation-gradient)" strokeWidth="1" />
        <line x1="25%" y1="35%" x2="40%" y2="25%" stroke="url(#constellation-gradient)" strokeWidth="1" />
        <line x1="60%" y1="15%" x2="75%" y2="30%" stroke="url(#constellation-gradient)" strokeWidth="1" />
        <line x1="75%" y1="30%" x2="85%" y2="45%" stroke="url(#constellation-gradient)" strokeWidth="1" />
        <line x1="20%" y1="70%" x2="35%" y2="80%" stroke="url(#constellation-gradient)" strokeWidth="1" />
        <line x1="70%" y1="60%" x2="85%" y2="75%" stroke="url(#constellation-gradient)" strokeWidth="1" />
      </svg>

      {/* Floating mystical planets */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="planet absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-yellow-400/40 via-orange-500/30 to-red-500/20 rounded-full blur-3xl"></div>
        <div className="planet absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-purple-500/40 via-pink-500/30 to-rose-500/20 rounded-full blur-3xl"></div>
        <div className="planet absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/40 via-cyan-500/30 to-teal-500/20 rounded-full blur-2xl"></div>
        <div className="planet absolute top-1/3 left-1/3 w-28 h-28 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
      </div>

      {/* Mystical symbols */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-1/4 text-6xl transform rotate-12">☯</div>
        <div className="absolute top-1/3 right-1/4 text-5xl transform -rotate-12">☸</div>
        <div className="absolute bottom-1/4 left-1/3 text-4xl transform rotate-45">✦</div>
        <div className="absolute bottom-1/3 right-1/3 text-5xl transform -rotate-45">✧</div>
      </div>

      <nav className="container mx-auto px-4 py-6 flex justify-between items-center relative z-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent animate-pulse">
          ✨ AstroMatch ✨
        </h1>
        <div className="flex gap-4 items-center">
          <Link
            href="/history"
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition backdrop-blur-sm hover:border-yellow-400/50"
          >
            {t.nav.history}
          </Link>
          <button
            onClick={handleLangToggle}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition backdrop-blur-sm hover:border-purple-400/50"
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        {!preview ? (
          <div className="space-y-10">
            {/* Hero section with mystical design */}
            <div className="text-center space-y-6 mb-12">
              <div className="text-7xl mb-4 animate-pulse">🔮</div>
              <h2 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent leading-tight">
                {t.form.title}
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {t.form.subtitle}
              </p>
              <div className="flex justify-center gap-4 text-2xl opacity-60">
                <span>⭐</span>
                <span>🌙</span>
                <span>✨</span>
                <span>🌟</span>
                <span>💫</span>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-white/10 via-white/5 to-white/5 border border-white/20 rounded-3xl p-10 backdrop-blur-2xl shadow-2xl space-y-10 relative overflow-hidden"
            >
              {/* Mystical glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-pink-500/10 opacity-50 blur-3xl"></div>
              
              <div className="relative z-10 grid md:grid-cols-2 gap-10">
                {/* Person 1 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/50">
                      ☀️
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      {t.form.person1}
                    </h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span>✨</span>
                        {t.form.firstname}
                      </label>
                      <input
                        type="text"
                        value={person1_firstname}
                        onChange={(e) => setPerson1Firstname(e.target.value)}
                        required
                        className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition shadow-lg"
                        placeholder={t.form.firstname}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span>📅</span>
                        {t.form.dateLabel}
                      </label>
                      <input
                        type="date"
                        value={person1_date}
                        onChange={(e) => setPerson1Date(e.target.value)}
                        required
                        className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition shadow-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span>🕐</span>
                        {t.form.timeLabel}
                      </label>
                      <input
                        type="time"
                        value={person1_time}
                        onChange={(e) => setPerson1Time(e.target.value)}
                        required
                        className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition shadow-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span>🌍</span>
                        {t.form.place}
                      </label>
                      <PlaceAutocomplete
                        value={person1_place}
                        onChange={handlePerson1PlaceChange}
                        placeholder={t.form.place}
                        lang={lang}
                      />
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <span>💡</span>
                        {t.form.placeHelp}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Person 2 */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50">
                      🌙
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {t.form.person2}
                    </h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span>✨</span>
                        {t.form.firstname}
                      </label>
                      <input
                        type="text"
                        value={person2_firstname}
                        onChange={(e) => setPerson2Firstname(e.target.value)}
                        required
                        className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition shadow-lg"
                        placeholder={t.form.firstname}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span>📅</span>
                        {t.form.dateLabel}
                      </label>
                      <input
                        type="date"
                        value={person2_date}
                        onChange={(e) => setPerson2Date(e.target.value)}
                        required
                        className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition shadow-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span>🕐</span>
                        {t.form.timeLabel}
                      </label>
                      <input
                        type="time"
                        value={person2_time}
                        onChange={(e) => setPerson2Time(e.target.value)}
                        required
                        className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition shadow-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span>🌍</span>
                        {t.form.place}
                      </label>
                      <PlaceAutocomplete
                        value={person2_place}
                        onChange={handlePerson2PlaceChange}
                        placeholder={t.form.place}
                        lang={lang}
                      />
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <span>💡</span>
                        {t.form.placeHelp}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="relative z-10">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <span>📧</span>
                  {t.form.email}
                </label>
                <input
                  type="email"
                  placeholder={t.form.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition shadow-lg"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative z-10 w-full px-8 py-5 rounded-xl bg-gradient-to-r from-yellow-400 via-purple-500 via-pink-500 to-rose-500 text-black font-bold text-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transform duration-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="animate-spin text-2xl">✨</span>
                    {t.form.loading}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {t.form.submit}
                  </span>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/5 border border-white/20 rounded-3xl p-10 backdrop-blur-2xl shadow-2xl text-center space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-pink-500/10 opacity-50 blur-3xl"></div>
            <div className="relative z-10">
              <div className="text-8xl mb-6 animate-pulse">🔮</div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent mb-4">
                {t.preview.title} {preview.overall_score}%
              </h2>
              <p className="text-gray-300 text-xl leading-relaxed mb-8">{t.preview.description}</p>
              <button
                onClick={handleCheckout}
                className="w-full px-8 py-5 rounded-xl bg-gradient-to-r from-yellow-400 via-purple-500 via-pink-500 to-rose-500 text-black font-bold text-xl hover:opacity-90 transition shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transform duration-300"
              >
                {t.preview.unlock}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
