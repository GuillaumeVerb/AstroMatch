'use client'

interface ShareButtonsProps {
  firstname1: string
  firstname2: string
  score: number
  lang: 'fr' | 'en'
  onShare?: () => void
}

export default function ShareButtons({
  firstname1,
  firstname2,
  score,
  lang,
  onShare,
}: ShareButtonsProps) {
  const shareText = lang === 'fr'
    ? `🔮 Compatibilité entre ${firstname1} & ${firstname2} : ${score}% ✨\n\nDécouvre ta compatibilité astrologique ici :`
    : `🔮 Compatibility between ${firstname1} & ${firstname2} : ${score}% ✨\n\nDiscover your astrological compatibility here:`

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?share=${encodeURIComponent(firstname1)}-${encodeURIComponent(firstname2)}-${score}`
    : `https://astromatch.app?share=${encodeURIComponent(firstname1)}-${encodeURIComponent(firstname2)}-${score}`

  const fullShareText = `${shareText}\n${shareUrl}`

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}`
    window.open(url, '_blank', 'width=550,height=420')
    onShare?.()
  }

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(url, '_blank', 'width=550,height=420')
    onShare?.()
  }

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`
    window.open(url, '_blank')
    onShare?.()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText)
      alert(lang === 'fr' ? 'Lien copié dans le presse-papiers !' : 'Link copied to clipboard!')
      onShare?.()
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const handleEmail = () => {
    const subject = lang === 'fr' 
      ? `Notre compatibilité astrologique : ${score}%`
      : `Our astrological compatibility: ${score}%`
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullShareText)}`
    window.location.href = url
    onShare?.()
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-300 text-center">
        {lang === 'fr' ? '✨ Partagez votre score ✨' : '✨ Share your score ✨'}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleTwitter}
          className="px-4 py-2 rounded-xl bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/30 transition backdrop-blur-sm flex items-center gap-2"
          aria-label="Share on Twitter"
        >
          <span className="text-lg">🐦</span>
          <span className="text-sm">Twitter</span>
        </button>
        <button
          onClick={handleFacebook}
          className="px-4 py-2 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/30 hover:bg-[#1877F2]/30 transition backdrop-blur-sm flex items-center gap-2"
          aria-label="Share on Facebook"
        >
          <span className="text-lg">📘</span>
          <span className="text-sm">Facebook</span>
        </button>
        <button
          onClick={handleWhatsApp}
          className="px-4 py-2 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 hover:bg-[#25D366]/30 transition backdrop-blur-sm flex items-center gap-2"
          aria-label="Share on WhatsApp"
        >
          <span className="text-lg">💬</span>
          <span className="text-sm">WhatsApp</span>
        </button>
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition backdrop-blur-sm flex items-center gap-2"
          aria-label="Copy link"
        >
          <span className="text-lg">📋</span>
          <span className="text-sm">{lang === 'fr' ? 'Copier' : 'Copy'}</span>
        </button>
        <button
          onClick={handleEmail}
          className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition backdrop-blur-sm flex items-center gap-2"
          aria-label="Share via email"
        >
          <span className="text-lg">📧</span>
          <span className="text-sm">Email</span>
        </button>
      </div>
    </div>
  )
}

