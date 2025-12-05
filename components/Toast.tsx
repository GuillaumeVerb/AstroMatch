'use client'

import { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    success: 'bg-green-500/90',
    error: 'bg-red-500/90',
    info: 'bg-blue-500/90',
    warning: 'bg-yellow-500/90',
  }[type]

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[type]

  return (
    <div
      className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm border border-white/20 flex items-center gap-3 min-w-[300px] max-w-[500px] animate-slide-in`}
      role="alert"
      aria-live="assertive"
    >
      <span className="text-xl font-bold">{icon}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition text-xl font-bold"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  )
}

