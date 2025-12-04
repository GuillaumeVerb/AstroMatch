'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { translations } from '../../translations'

const API_BASE = 'https://web-production-37fb.up.railway.app'

declare global {
  interface Window {
    plausible?: (event: string) => void
  }
}

function FullReportContent() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [report, setReport] = useState<any>(null)
  const [firstname1, setFirstname1] = useState('')
  const [firstname2, setFirstname2] = useState('')
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    const savedLang = localStorage.getItem('astromatch_lang') as 'fr' | 'en' | null
    if (savedLang) setLang(savedLang)

    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      fetch(`${API_BASE}/api/compatibility/astromatch/verify-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      }).then(() => {
        if (window.plausible) {
          window.plausible('premium_unlocked')
        }
      })
    }

    const savedReport = localStorage.getItem('astromatch_report')
    const savedFirstname1 = localStorage.getItem('astromatch_firstname1')
    const savedFirstname2 = localStorage.getItem('astromatch_firstname2')

    if (savedReport) {
      setReport(JSON.parse(savedReport))
      setFirstname1(savedFirstname1 || '')
      setFirstname2(savedFirstname2 || '')
    }
    setLoading(false)
  }, [searchParams])

  const t = translations[lang]

  const handleLangToggle = () => {
    const newLang = lang === 'fr' ? 'en' : 'fr'
    setLang(newLang)
    localStorage.setItem('astromatch_lang', newLang)
  }

  const handleDownloadPDF = async () => {
    if (!report) return

    try {
      const response = await fetch(`${API_BASE}/api/compatibility/astromatch/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: {
            firstname: firstname1,
            date: report.person1?.date || '',
            time: report.person1?.time || '',
            place: report.person1?.place || '',
          },
          person2: {
            firstname: firstname2,
            date: report.person2?.date || '',
            time: report.person2?.time || '',
            place: report.person2?.place || '',
          },
          report,
        }),
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `astromatch-${firstname1}-${firstname2}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      if (window.plausible) {
        window.plausible('pdf_downloaded')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  const handleShare = async () => {
    const text = `Compatibilité entre ${firstname1} & ${firstname2} : ${report?.overall_score || 0}% ✨\nAnalyse ton couple ici : https://astromatch.app`

    try {
      await navigator.clipboard.writeText(text)
      alert(t.report.shareSuccess)
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1020] to-[#120b2e] text-white flex items-center justify-center">
        <p>{t.report.loading}</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1020] to-[#120b2e] text-white flex items-center justify-center">
        <p>{t.report.notFound}</p>
      </div>
    )
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

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
          <h2 className="text-3xl font-bold mb-4">
            {t.report.title.replace('{firstname1}', firstname1).replace('{firstname2}', firstname2)}
          </h2>
          <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent mb-6">
            {report.overall_score}%
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleShare}
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              {t.report.share}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-purple-500 text-black font-bold hover:opacity-90 transition"
            >
              {t.report.downloadPDF}
            </button>
          </div>
        </div>

        {report.analysis && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
            <h3 className="text-2xl font-bold mb-4">{t.report.analysis}</h3>
            <div className="text-gray-300 whitespace-pre-wrap">{JSON.stringify(report.analysis, null, 2)}</div>
          </div>
        )}

        {report.v2 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-2xl font-bold mb-4">{t.report.v2}</h3>
            <div className="text-gray-300 whitespace-pre-wrap">{JSON.stringify(report.v2, null, 2)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FullReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0b1020] to-[#120b2e] text-white flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    }>
      <FullReportContent />
    </Suspense>
  )
}

