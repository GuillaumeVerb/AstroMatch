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

  const getLevelText = (level: 'low' | 'medium' | 'high') => {
    return t.levels[level]
  }

  const getLevelColor = (level: 'low' | 'medium' | 'high') => {
    if (level === 'low') return 'text-gray-400'
    if (level === 'medium') return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="space-y-2 text-sm">
      <p className="text-xs font-medium text-gray-400 text-center mb-3">{t.title}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">{t.harmony}</span>
          <span className={`font-semibold ${getLevelColor(harmony)}`}>
            {getLevelText(harmony)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">{t.intensity}</span>
          <span className={`font-semibold ${getLevelColor(intensity)}`}>
            {getLevelText(intensity)}
          </span>
        </div>
        {karmic && (
          <div className="flex items-center justify-between">
            <span className="text-gray-300">{t.karmic}</span>
            <span className={`font-semibold ${getLevelColor(karmic)}`}>
              {karmic === 'high' ? (lang === 'fr' ? 'Présent' : 'Present') : getLevelText(karmic)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

