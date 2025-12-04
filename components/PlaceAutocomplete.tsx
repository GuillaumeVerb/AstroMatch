'use client'

import { useState, useEffect, useRef } from 'react'

interface PlaceAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  lang: 'fr' | 'en'
}

export default function PlaceAutocomplete({
  value,
  onChange,
  placeholder,
  lang,
}: PlaceAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
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
        )}&limit=5&accept-language=${lang}`
      )
      const data = await response.json()
      const places = data.map((item: any) => {
        const parts = [item.name]
        if (item.state) parts.push(item.state)
        if (item.country) parts.push(item.country)
        return parts.join(', ')
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

  const handleSelect = (suggestion: string) => {
    onChange(suggestion)
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
        className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1a2e] border border-white/20 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-400 text-sm">
              {lang === 'fr' ? 'Recherche...' : 'Searching...'}
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition text-sm"
              >
                {suggestion}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

