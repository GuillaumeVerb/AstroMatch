'use client'

import { translations } from '../translations'

interface IntensityScoresProps {
  report: any
  lang: 'fr' | 'en'
}

export default function IntensityScores({ report, lang }: IntensityScoresProps) {
  const t = translations[lang].preview.intensity

  // Extract scores from report
  const getScore = (key: string): 'low' | 'medium' | 'high' | null => {
    if (!report) return null

    // Try different paths in the report structure
    const value = report.v2_dimensions?.[key] || 
                  report.v2?.dimensions?.[key] ||
                  report.analysis?.v2_dimensions?.[key] ||
                  report[key]

    if (typeof value === 'number') {
      if (value < 40) return 'low'
      if (value < 70) return 'medium'
      return 'high'
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase()
      if (lower.includes('faible') || lower.includes('low') || lower.includes('weak')) return 'low'
      if (lower.includes('moyen') || lower.includes('medium') || lower.includes('modéré')) return 'medium'
      if (lower.includes('fort') || lower.includes('high') || lower.includes('strong')) return 'high'
    }

    return null
  }

  const harmony = getScore('harmony') || getScore('emotional_harmony') || 'medium'
  const intensity = getScore('intensity') || getScore('intensity_score') || 'medium'
  const karmic = getScore('karmic_destiny') || getScore('karmic') || getScore('destiny') || null
  const communication = getScore('communication') || getScore('communication_score') || null
  const passion = getScore('passion') || getScore('passion_score') || null
  const trust = getScore('trust') || getScore('trust_score') || null
  const destiny = getScore('destiny') || getScore('destiny_score') || null
  const firstImpression = getScore('first_impression') || getScore('first_impression_score') || null

  const getLevelText = (level: 'low' | 'medium' | 'high') => {
    if (level === 'low') return lang === 'fr' ? 'Faible' : 'Low'
    if (level === 'medium') return lang === 'fr' ? 'Moyen' : 'Medium'
    return lang === 'fr' ? 'Fort' : 'High'
  }

  const getLevelStars = (level: 'low' | 'medium' | 'high') => {
    if (level === 'low') return '⭐️'
    if (level === 'medium') return '⭐️⭐️'
    return '⭐️⭐️⭐️'
  }

  const getLevelColor = (level: 'low' | 'medium' | 'high') => {
    if (level === 'low') return 'text-gray-400'
    if (level === 'medium') return 'text-yellow-400'
    return 'text-green-400'
  }

  const getItemIcon = (type: string) => {
    const icons: Record<string, string> = {
      harmony: '💛',
      intensity: '🔥',
      karmic: '🜁',
      communication: '💬',
      passion: '❤️',
      trust: '🤝',
      destiny: '🌟',
      firstImpression: '✨',
    }
    return icons[type] || '⭐️'
  }

  // Score items with their labels
  const scoreItems = [
    { value: harmony, key: 'harmony', label: t.harmony },
    { value: intensity, key: 'intensity', label: t.intensity },
    { value: karmic, key: 'karmic', label: t.karmic },
    { value: communication, key: 'communication', label: t.communication },
    { value: passion, key: 'passion', label: t.passion },
    { value: trust, key: 'trust', label: t.trust },
    { value: destiny, key: 'destiny', label: t.destiny },
    { value: firstImpression, key: 'firstImpression', label: t.firstImpression },
  ].filter(item => item.value !== null)

  return (
    <div className="space-y-2 text-sm">
      <p className="text-xs font-medium text-gray-400 text-center mb-3">{t.title}</p>
      <div className="space-y-2.5">
        {scoreItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-300 flex items-center gap-1.5">
              {getItemIcon(item.key)} {item.label}
            </span>
            <span className={`font-semibold ${getLevelColor(item.value as 'low' | 'medium' | 'high')} flex items-center gap-1.5`}>
              {item.key === 'karmic' && item.value === 'high' 
                ? (lang === 'fr' ? '⭐️⭐️⭐️ Présent' : '⭐️⭐️⭐️ Present')
                : `${getLevelStars(item.value as 'low' | 'medium' | 'high')} ${getLevelText(item.value as 'low' | 'medium' | 'high')}`
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

