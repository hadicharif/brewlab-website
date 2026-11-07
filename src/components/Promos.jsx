import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { announcements, promos } from '../data/promos'
import { useLang } from '../i18n'

// Thin rotating bar at the very top of the page
export function AnnouncementBar() {
  const { lang } = useLang()
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (reduce) return
    if (announcements.length < 2) return
    const id = setInterval(() => setI((n) => (n + 1) % announcements.length), 4500)
    return () => clearInterval(id)
  }, [reduce])

  if (hidden || !announcements.length) return null
  return (
    <div className="announce" role="region" aria-label="Announcements">
      <div className="container announce-inner">
        <AnimatePresence mode="wait">
          <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}>
            {announcements[i][lang]}
          </motion.p>
        </AnimatePresence>
        <button className="announce-close" onClick={() => setHidden(true)} aria-label={lang === 'ar' ? 'إغلاق' : 'Close'}>
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

// Promotion cards
export function PromoCards({ onOpenItem, onOpenSection, onOpenLab }) {
  const { lang } = useLang()
  return (
    <section className="promos" aria-label={lang === 'ar' ? 'العروض' : 'Offers'}>
      <div className="container promo-grid">
        {promos.map((p) => (
          <article key={p.id} className={`promo promo-${p.tone}`}>
            <svg className="promo-shape" viewBox="0 0 120 120" aria-hidden="true">
              <path d="M30 120V60a30 30 0 0 1 60 0v60z" />
              <circle cx="96" cy="22" r="14" />
            </svg>
            <p className="promo-tag">{p.tag[lang]}</p>
            <h3 className="promo-title">{p.title[lang]}</h3>
            <p className="promo-body">{p.body[lang]}</p>
            <button
              className="promo-cta"
              onClick={() => (p.lab ? onOpenLab() : p.item ? onOpenItem(p.item) : onOpenSection(p.section))}
            >
              {p.cta[lang]}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
