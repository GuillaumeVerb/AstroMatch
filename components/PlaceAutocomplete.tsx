'use client'

import { useState, useEffect, useRef } from 'react'

export interface PlaceResult {
  display: string
  lat: string
  lon: string
  country: string
}

interface PlaceAutocompleteProps {
  value: string
  onChange: (value: string, coordinates?: { lat: string; lon: string; country: string }) => void
  placeholder: string
  lang: 'fr' | 'en'
}

export default function PlaceAutocomplete({
  value,
  onChange,
  placeholder,
  lang,
}: PlaceAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchPlaces = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=8&accept-language=${lang}&addressdetails=1`
      )
      const data = await response.json()
      const places: PlaceResult[] = data.map((item: any) => {
        const parts: string[] = []
        if (item.name) parts.push(item.name)
        if (item.address?.city || item.address?.town || item.address?.village) {
          parts.push(item.address.city || item.address.town || item.address.village)
        }
        if (item.address?.state) parts.push(item.address.state)
        if (item.address?.country) parts.push(item.address.country)
        
        return {
          display: parts.length > 0 ? parts.join(', ') : item.display_name,
          lat: item.lat,
          lon: item.lon,
          country: item.address?.country || '',
        }
      })
      setSuggestions(places)
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching places:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    searchPlaces(newValue)
  }

  const handleSelect = (suggestion: PlaceResult) => {
    onChange(suggestion.display, {
      lat: suggestion.lat,
      lon: suggestion.lon,
      country: suggestion.country,
    })
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true)
        }}
        placeholder={placeholder}
        required
        className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1a2e]/95 border border-white/20 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {isLoading ? (
            <div className="px-4 py-3 text-gray-400 text-sm flex items-center gap-2">
              <span className="animate-spin">✨</span>
              {lang === 'fr' ? 'Recherche...' : 'Searching...'}
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-4 py-3 text-white hover:bg-white/10 transition text-sm border-b border-white/5 last:border-0"
              >
                <div className="font-medium">{suggestion.display}</div>
                {suggestion.country && (
                  <div className="text-xs text-gray-400 mt-1">📍 {suggestion.country}</div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
