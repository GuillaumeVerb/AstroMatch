'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { translations } from '../translations'
import { useToast } from '../components/ToastContainer'
import PlaceAutocomplete from '../components/PlaceAutocomplete'
import CompatibilityGauge from '../components/CompatibilityGauge'
import ShareButtons from '../components/ShareButtons'
import IntensityScores from '../components/IntensityScores'

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
  const [usePersonalLabels, setUsePersonalLabels] = useState(false)
  const [person1_firstname, setPerson1Firstname] = useState('')
  const [person1_date, setPerson1Date] = useState('')
  const [person1_time, setPerson1Time] = useState('12:00')
  const [person1_place, setPerson1Place] = useState('')
  const [person1_coords, setPerson1Coords] = useState<Coordinates | null>(null)
  const [person2_firstname, setPerson2Firstname] = useState('')
  const [person2_date, setPerson2Date] = useState('')
  const [person2_time, setPerson2Time] = useState('12:00')
  const [person2_place, setPerson2Place] = useState('')
  const [person2_coords, setPerson2Coords] = useState<Coordinates | null>(null)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { showToast } = useToast()

  useEffect(() => {
    const savedLang = localStorage.getItem('astromatch_lang') as 'fr' | 'en' | null
    if (savedLang) setLang(savedLang)

    // Charger les données du formulaire sauvegardées
    const savedForm = localStorage.getItem('astromatch_form_data')
    if (savedForm) {
      try {
        const formData = JSON.parse(savedForm)
        setPerson1Firstname(formData.person1_firstname || '')
        setPerson1Date(formData.person1_date || '')
        setPerson1Time(formData.person1_time || '12:00')
        setPerson1Place(formData.person1_place || '')
        if (formData.person1_coords) {
          setPerson1Coords(formData.person1_coords)
        }
        setPerson2Firstname(formData.person2_firstname || '')
        setPerson2Date(formData.person2_date || '')
        setPerson2Time(formData.person2_time || '12:00')
        setPerson2Place(formData.person2_place || '')
        if (formData.person2_coords) {
          setPerson2Coords(formData.person2_coords)
        }
        setEmail(formData.email || '')
      } catch (e) {
        console.error('Error loading form data:', e)
      }
    }
  }, [])

  const t = translations[lang]

  const validateEmail = (email: string): boolean => {
    // Regex pour valider un email avec un domaine valide
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email) && email.length > 0 && email.length <= 254
  }

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
    setError(null)
    setLoading(true)

    try {
      // Validation
      if (!person1_firstname || !person1_date || !person1_time || !person1_place) {
        setError(lang === 'fr' ? 'Veuillez remplir tous les champs pour la personne 1' : 'Please fill all fields for person 1')
        setLoading(false)
        return
      }
      if (!person2_firstname || !person2_date || !person2_time || !person2_place) {
        setError(lang === 'fr' ? 'Veuillez remplir tous les champs pour la personne 2' : 'Please fill all fields for person 2')
        setLoading(false)
        return
      }
      if (!email) {
        setError(lang === 'fr' ? 'Veuillez entrer votre email' : 'Please enter your email')
        setLoading(false)
        return
      }

      if (!validateEmail(email)) {
        setError(t.form.emailInvalid)
        setLoading(false)
        return
      }

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

      console.log('Sending payload:', payload)

      // Use Next.js API route to proxy the request (avoids CORS issues)
      const response = await fetch('/api/astromatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API Error: ${response.status}`)
      }

      const report = await response.json()
      console.log('Report received:', report)

      // Save email (non-blocking)
      fetch('/api/save-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(err => console.error('Error saving email:', err))

      // Log (non-blocking)
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1_firstname,
          person2_firstname,
          email,
        }),
      }).catch(err => console.error('Error logging:', err))

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

      // Sauvegarder les données du formulaire pour les conserver
      localStorage.setItem('astromatch_form_data', JSON.stringify({
        person1_firstname,
        person1_date,
        person1_time,
        person1_place,
        person1_coords,
        person2_firstname,
        person2_date,
        person2_time,
        person2_place,
        person2_coords,
        email,
      }))

      setPreview(report)

      if (window.plausible) {
        window.plausible('compatibility_calculated')
      }
    } catch (error: any) {
      console.error('Error:', error)
      const errorMessage = error?.message || 
        (lang === 'fr' 
          ? 'Une erreur est survenue. Veuillez réessayer.' 
          : 'An error occurred. Please try again.')
      setError(errorMessage)
      showToast(errorMessage, 'error')
      if (window.plausible) {
        window.plausible('compatibility_error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNewCalculation = () => {
    setPreview(null)
    // Les données du formulaire restent intactes grâce à localStorage
    // L'utilisateur peut modifier et recalculer
    if (window.plausible) {
      window.plausible('new_calculation_clicked')
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

  const handleShare = () => {
    if (window.plausible) {
      window.plausible('score_shared')
    }
  }

  // Extract insights from report with improved format handling
  const getInsights = () => {
    if (!preview) return null

    const insights: {
      strongest?: string
      weakest?: string
      potential?: string
      firstImpression?: string
      destiny?: string
      hiddenTension?: string
      communication?: string
      karmic?: string
    } = {}

    // Extract strongest dimension - try multiple paths
    const strongestPaths = [
      preview.strongest_dimension,
      preview.analysis?.strongest_dimension,
      preview.v2_dimensions?.strongest,
      preview.v2?.strongest_dimension,
      preview.dimensions?.strongest,
    ]
    
    for (const path of strongestPaths) {
      if (path && typeof path === 'string' && path.trim().length > 0) {
        insights.strongest = path.trim()
        break
      }
    }

    // Extract weakest dimension - try multiple paths
    const weakestPaths = [
      preview.weakest_dimension,
      preview.analysis?.weakest_dimension,
      preview.v2_dimensions?.weakest,
      preview.v2?.weakest_dimension,
      preview.dimensions?.weakest,
    ]
    
    for (const path of weakestPaths) {
      if (path && typeof path === 'string' && path.trim().length > 0) {
        insights.weakest = path.trim()
        break
      }
    }

    // Extract potential from interpretation - try multiple paths and formats
    const descPaths = [
      preview.interpretation?.description,
      preview.analysis?.interpretation?.description,
      preview.description,
      preview.analysis?.description,
      preview.summary,
    ]

    for (const desc of descPaths) {
      if (desc && typeof desc === 'string' && desc.trim().length > 20) {
        // Try to extract a meaningful sentence
        const sentences = desc.split(/[.!?]/).filter((s: string) => s.trim().length > 20 && s.trim().length < 150)
        if (sentences.length > 0) {
          // Take first meaningful sentence or one that mentions "potentiel", "évolution", "relation"
          const meaningful = sentences.find((s: string) => 
            /potentiel|évolution|relation|compatibilité|harmonie/i.test(s)
          ) || sentences[0]
          insights.potential = meaningful.trim() + '.'
          break
        }
      }
    }

    // Fallback: if no potential found, create a generic one based on score
    if (!insights.potential && preview.overall_score) {
      if (preview.overall_score >= 70) {
        insights.potential = lang === 'fr' 
          ? 'Relation équilibrée, terrain favorable pour une belle évolution.'
          : 'Balanced relationship, favorable ground for beautiful evolution.'
      } else if (preview.overall_score >= 50) {
        insights.potential = lang === 'fr'
          ? 'Bonne compatibilité – Relation équilibrée avec un potentiel d\'évolution.'
          : 'Good compatibility – Balanced relationship with evolution potential.'
      } else {
        insights.potential = lang === 'fr'
          ? 'Relation avec des défis à surmonter, mais un potentiel de croissance mutuelle.'
          : 'Relationship with challenges to overcome, but potential for mutual growth.'
      }
    }

    // Extract first impression
    const firstImpressionPaths = [
      preview.first_impression,
      preview.analysis?.first_impression,
      preview.v2?.first_impression,
      preview.dimensions?.first_impression,
    ]
    for (const path of firstImpressionPaths) {
      if (path && typeof path === 'string' && path.trim().length > 10) {
        insights.firstImpression = path.trim()
        break
      }
    }

    // Extract destiny
    const destinyPaths = [
      preview.destiny,
      preview.analysis?.destiny,
      preview.v2?.destiny,
      preview.destiny_score,
    ]
    for (const path of destinyPaths) {
      if (path && typeof path === 'string' && path.trim().length > 10) {
        insights.destiny = path.trim()
        break
      }
    }

    // Extract hidden tension
    const tensionPaths = [
      preview.hidden_tension,
      preview.analysis?.hidden_tension,
      preview.v2?.hidden_tension,
      preview.tension,
      preview.analysis?.tension,
    ]
    for (const path of tensionPaths) {
      if (path && typeof path === 'string' && path.trim().length > 10) {
        insights.hiddenTension = path.trim()
        break
      }
    }

    // Extract multiple insights from description
    const commDescPaths = [
      preview.interpretation?.description,
      preview.analysis?.interpretation?.description,
      preview.description,
      preview.analysis?.description,
    ]
    
    let allSentences: string[] = []
    for (const desc of commDescPaths) {
      if (desc && typeof desc === 'string') {
        const sentences = desc.split(/[.!?]/).filter((s: string) => s.trim().length > 15 && s.trim().length < 120)
        allSentences = [...allSentences, ...sentences]
      }
    }

    // Extract communication insight
    if (!insights.communication && allSentences.length > 0) {
      const commSentence = allSentences.find((s: string) => 
        /communication|dialogue|échange|parler|écouter|conversation/i.test(s)
      )
      if (commSentence) {
        insights.communication = commSentence.trim() + '.'
      }
    }

    // Extract karmic insight
    if (!insights.karmic && allSentences.length > 0) {
      const karmicSentence = allSentences.find((s: string) => 
        /karmique|karma|destin|mission|réincarnation|nœud|lunaire/i.test(s)
      )
      if (karmicSentence) {
        insights.karmic = karmicSentence.trim() + '.'
      }
    }

    // Extract hidden tension from sentences
    if (!insights.hiddenTension && allSentences.length > 0) {
      const tensionSentence = allSentences.find((s: string) => 
        /tension|défi|challenge|difficulté|conflit|opposition/i.test(s)
      )
      if (tensionSentence) {
        insights.hiddenTension = tensionSentence.trim() + '.'
      }
    }

    // Extract destiny from sentences if not found
    if (!insights.destiny && allSentences.length > 0) {
      const destinySentence = allSentences.find((s: string) => 
        /destin|destinée|avenir|futur|évolution|croissance/i.test(s)
      )
      if (destinySentence) {
        insights.destiny = destinySentence.trim() + '.'
      }
    }

    // Extract first impression from sentences if not found
    if (!insights.firstImpression && allSentences.length > 0) {
      const firstImpSentence = allSentences.find((s: string) => 
        /première|impression|rencontre|attirance|magnétisme/i.test(s)
      )
      if (firstImpSentence) {
        insights.firstImpression = firstImpSentence.trim() + '.'
      }
    }

    // Generate generic insights based on score if we don't have enough
    const score = preview.overall_score || 50
    const hasEnoughInsights = Object.keys(insights).filter(k => insights[k as keyof typeof insights]).length >= 3

    if (!hasEnoughInsights) {
      // Generate generic insights based on score
      if (!insights.strongest && score >= 60) {
        insights.strongest = lang === 'fr' 
          ? 'Une connexion émotionnelle solide et une bonne compréhension mutuelle.'
          : 'A strong emotional connection and good mutual understanding.'
      }
      
      if (!insights.weakest && score < 70) {
        insights.weakest = lang === 'fr'
          ? 'Des différences de vision à harmoniser pour une relation durable.'
          : 'Differences in vision to harmonize for a lasting relationship.'
      }

      if (!insights.destiny) {
        insights.destiny = lang === 'fr'
          ? score >= 60 
            ? 'Un potentiel d\'évolution positive et de croissance mutuelle.'
            : 'Un chemin d\'évolution avec des défis à transformer en opportunités.'
          : score >= 60
            ? 'A potential for positive evolution and mutual growth.'
            : 'A path of evolution with challenges to transform into opportunities.'
      }

      if (!insights.communication && allSentences.length > 0) {
        // Take any meaningful sentence about the relationship
        const genericSentence = allSentences.find((s: string) => 
          /relation|couple|partenariat|union|harmonie/i.test(s)
        )
        if (genericSentence) {
          insights.communication = genericSentence.trim() + '.'
        }
      }
    }

    return insights
  }

  const insights = getInsights()

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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/50">
                        ☀️
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        {usePersonalLabels ? t.form.person1Label : t.form.person1}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUsePersonalLabels(!usePersonalLabels)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition text-xs text-gray-300 flex items-center gap-1.5"
                      title={lang === 'fr' ? 'Basculer entre "Personne 1/2" et "Vous/Partenaire"' : 'Toggle between "Person 1/2" and "You/Partner"'}
                    >
                      <span>{usePersonalLabels ? '💁' : '👤'}</span>
                      <span className="hidden sm:inline">{usePersonalLabels ? t.form.person1Label : t.form.person1}</span>
                    </button>
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
                      <p className="text-xs text-gray-400 mt-1.5">{t.form.timeHelp}</p>
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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50">
                        🌙
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        {usePersonalLabels ? t.form.person2Label : t.form.person2}
                      </h3>
                    </div>
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
                      <p className="text-xs text-gray-400 mt-1.5">{t.form.timeHelp}</p>
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

              {/* Motivation text */}
              <div className="relative z-10 text-center">
                <p className="text-sm text-gray-400 italic">
                  {t.form.motivation}
                </p>
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
                  onChange={(e) => {
                    const newEmail = e.target.value
                    setEmail(newEmail)
                    if (newEmail && !validateEmail(newEmail)) {
                      setEmailError(t.form.emailInvalid)
                    } else {
                      setEmailError(null)
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value && !validateEmail(e.target.value)) {
                      setEmailError(t.form.emailInvalid)
                    } else {
                      setEmailError(null)
                    }
                  }}
                  required
                  className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition shadow-lg ${
                    emailError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                      : 'border-white/20 focus:border-yellow-400 focus:ring-yellow-400/50'
                  }`}
                />
                {emailError && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    {emailError}
                  </p>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="relative z-10 bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200" role="alert" aria-live="assertive">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">⚠️</span>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                aria-label={t.form.submit}
                aria-busy={loading}
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

              {/* Privacy & Trust Text */}
              <div className="relative z-10 text-center pt-2">
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t.form.privacy}
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white/10 via-white/5 to-white/5 border border-white/20 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden" style={{ boxShadow: '0 0 40px rgba(255,0,150,0.15)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Mystical gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-pink-500/10 opacity-50 blur-3xl"></div>
            
            <div className="relative z-10 space-y-5">
              {/* Title with names - Score removed from title */}
              <div className="text-center space-y-2 relative">
                {/* Nouveau calcul button - top right */}
                <button
                  onClick={handleNewCalculation}
                  className="absolute top-0 right-0 px-4 py-2 rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 transition text-sm text-gray-300 flex items-center gap-2"
                  aria-label={lang === 'fr' ? 'Nouveau calcul' : 'New calculation'}
                >
                  <span>↻</span>
                  <span>{lang === 'fr' ? 'Nouveau calcul' : 'New calculation'}</span>
                </button>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                  {t.preview.title.replace('{firstname1}', person1_firstname).replace('{firstname2}', person2_firstname)}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">👑</span>
                  <p className="text-sm text-yellow-400 font-medium bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/30">
                    {t.preview.badge}
                  </p>
                </div>
              </div>

              {/* Compatibility Gauge with Score */}
              <div className="flex flex-col items-center justify-center py-3 space-y-3">
                <CompatibilityGauge score={preview.overall_score} size={140} />
                {/* Micro-text under gauge */}
                <p className="text-xs text-gray-400 text-center px-4">
                  {t.preview.gaugeSubtext}
                </p>
                {/* Mini Intensity Scores */}
                <IntensityScores report={preview} lang={lang} />
              </div>

              {/* Share Buttons */}
              <div className="py-2 bg-white/5 border border-white/10 rounded-2xl p-5" style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 0 40px rgba(255,0,150,0.08)' }}>
                <ShareButtons
                  firstname1={person1_firstname}
                  firstname2={person2_firstname}
                  score={preview.overall_score}
                  lang={lang}
                  onShare={handleShare}
                />
              </div>

              {/* Free Insights */}
              {insights && (insights.strongest || insights.weakest || insights.potential || insights.firstImpression || insights.destiny || insights.hiddenTension || insights.communication || insights.karmic) && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3" style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 0 40px rgba(255,0,150,0.08)' }}>
                  <h3 className="text-base font-bold text-center text-gray-200">{t.preview.insights.title}</h3>
                  <div className="space-y-2.5 text-left">
                    {insights.potential && (
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl">✨</span>
                        <div className="flex-1">
                          <p className="font-semibold text-purple-400 text-sm">{t.preview.insights.potential}</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{insights.potential}</p>
                        </div>
                      </div>
                    )}
                    {insights.strongest && (
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl">💪</span>
                        <div className="flex-1">
                          <p className="font-semibold text-yellow-400 text-sm">{t.preview.insights.strongest}</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{insights.strongest}</p>
                        </div>
                      </div>
                    )}
                    {insights.weakest && (
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl">⚡</span>
                        <div className="flex-1">
                          <p className="font-semibold text-orange-400 text-sm">{t.preview.insights.weakest}</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{insights.weakest}</p>
                        </div>
                      </div>
                    )}
                    {insights.firstImpression && (
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl">👁️</span>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-400 text-sm">{t.preview.insights.firstImpression}</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{insights.firstImpression}</p>
                        </div>
                      </div>
                    )}
                    {insights.destiny && (
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl">🌟</span>
                        <div className="flex-1">
                          <p className="font-semibold text-pink-400 text-sm">{t.preview.insights.destiny}</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{insights.destiny}</p>
                        </div>
                      </div>
                    )}
                    {insights.hiddenTension && (
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl">⚖️</span>
                        <div className="flex-1">
                          <p className="font-semibold text-red-400 text-sm">{t.preview.insights.hiddenTension}</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{insights.hiddenTension}</p>
                        </div>
                      </div>
                    )}
                    {insights.communication && (
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl">💬</span>
                        <div className="flex-1">
                          <p className="font-semibold text-cyan-400 text-sm">{t.preview.insights.communication}</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{insights.communication}</p>
                        </div>
                      </div>
                    )}
                    {insights.karmic && (
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl">🜁</span>
                        <div className="flex-1">
                          <p className="font-semibold text-violet-400 text-sm">{t.preview.insights.karmic}</p>
                          <p className="text-gray-300 text-xs leading-relaxed">{insights.karmic}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Benefits List */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3" style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 0 40px rgba(255,0,150,0.08)' }}>
                <h3 className="text-base font-bold text-center text-gray-200">{t.preview.benefits.title}</h3>
                <ul className="space-y-1.5 text-left">
                  {t.preview.benefits.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PDF Premium Encart */}
              <div className="bg-gradient-to-r from-yellow-500/10 via-purple-500/10 to-pink-500/10 border border-yellow-400/20 rounded-2xl p-4 text-center" style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 0 40px rgba(255,0,150,0.08)' }}>
                <p className="text-base font-bold text-yellow-400 mb-1">{t.preview.pdf.title}</p>
                <p className="text-xs text-gray-300">{t.preview.pdf.desc}</p>
              </div>

              {/* CTA Button - Using primary variant */}
              <button
                onClick={handleCheckout}
                className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-purple-500 via-pink-500 to-rose-500 text-black font-bold text-lg hover:opacity-90 transition shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105 transform duration-300"
              >
                {t.preview.cta.primary}
              </button>

              {/* Enhanced Guarantee Section */}
              <div className="space-y-1.5">
                {t.preview.guarantee.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-green-400">✔</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Target Audience Section - Moved to bottom */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3" style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 0 40px rgba(255,0,150,0.08)' }}>
                <h3 className="text-base font-bold text-center text-gray-200">{t.preview.target.title}</h3>
                <p className="text-xs text-gray-400 text-center mb-2">{t.preview.target.description}</p>
                <ul className="space-y-1.5 text-left">
                  {t.preview.target.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-purple-400 mt-0.5">✓</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
