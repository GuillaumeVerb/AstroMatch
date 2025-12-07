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

  // Get all available dimensions from v2_dimensions
  const getAllDimensions = () => {
    const dimensions: Record<string, any> = {}
    
    // Try to get v2_dimensions object
    const v2Dims = report?.v2_dimensions || 
                  report?.v2?.dimensions || 
                  report?.analysis?.v2_dimensions ||
                  {}
    
    // Extract all numeric or string values
    Object.keys(v2Dims).forEach(key => {
      const value = v2Dims[key]
      if (value !== null && value !== undefined) {
        dimensions[key] = value
      }
    })
    
    return dimensions
  }

  // Map dimension keys to display names and icons
  const dimensionMap: Record<string, { label: string, icon: string, key: string }> = {
    harmony: { label: t.harmony, icon: '💛', key: 'harmony' },
    emotional_harmony: { label: t.harmony, icon: '💛', key: 'harmony' },
    intensity: { label: t.intensity, icon: '🔥', key: 'intensity' },
    intensity_score: { label: t.intensity, icon: '🔥', key: 'intensity' },
    karmic: { label: t.karmic, icon: '🜁', key: 'karmic' },
    karmic_destiny: { label: t.karmic, icon: '🜁', key: 'karmic' },
    destiny: { label: t.destiny, icon: '🌟', key: 'destiny' },
    communication: { label: t.communication, icon: '💬', key: 'communication' },
    communication_score: { label: t.communication, icon: '💬', key: 'communication' },
    passion: { label: t.passion, icon: '❤️', key: 'passion' },
    passion_score: { label: t.passion, icon: '❤️', key: 'passion' },
    trust: { label: t.trust, icon: '🤝', key: 'trust' },
    trust_score: { label: t.trust, icon: '🤝', key: 'trust' },
    first_impression: { label: t.firstImpression, icon: '✨', key: 'firstImpression' },
    first_impression_score: { label: t.firstImpression, icon: '✨', key: 'firstImpression' },
  }

  const allDimensions = getAllDimensions()
  
  // Build score items from available dimensions
  const scoreItems: Array<{ value: 'low' | 'medium' | 'high', key: string, label: string, icon: string }> = []
  const processedKeys = new Set<string>()
  
  // First, try to get known dimensions
  Object.keys(dimensionMap).forEach(dimKey => {
    if (allDimensions[dimKey] !== undefined && !processedKeys.has(dimensionMap[dimKey].key)) {
      const score = getScore(dimKey)
      if (score) {
        scoreItems.push({
          value: score,
          key: dimensionMap[dimKey].key,
          label: dimensionMap[dimKey].label,
          icon: dimensionMap[dimKey].icon,
        })
        processedKeys.add(dimensionMap[dimKey].key)
      }
    }
  })
  
  // Fallback: ensure we have at least harmony and intensity
  if (!processedKeys.has('harmony')) {
    const harmonyScore = getScore('harmony') || getScore('emotional_harmony') || 'medium'
    scoreItems.unshift({ value: harmonyScore as 'low' | 'medium' | 'high', key: 'harmony', label: t.harmony, icon: '💛' })
  }
  if (!processedKeys.has('intensity')) {
    const intensityScore = getScore('intensity') || getScore('intensity_score') || 'medium'
    scoreItems.push({ value: intensityScore as 'low' | 'medium' | 'high', key: 'intensity', label: t.intensity, icon: '🔥' })
  }

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

  return (
    <div className="space-y-2 text-sm">
      <p className="text-xs font-medium text-gray-400 text-center mb-3">{t.title}</p>
      <div className="space-y-2.5">
        {scoreItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-300 flex items-center gap-1.5">
              {item.icon} {item.label}
            </span>
            <span className={`font-semibold ${getLevelColor(item.value)} flex items-center gap-1.5`}>
              {item.key === 'karmic' && item.value === 'high' 
                ? (lang === 'fr' ? '⭐️⭐️⭐️ Présent' : '⭐️⭐️⭐️ Present')
                : `${getLevelStars(item.value)} ${getLevelText(item.value)}`
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

