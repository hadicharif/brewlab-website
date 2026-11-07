import { motion, useReducedMotion } from 'framer-motion'
import { groups } from '../data/menu'
import { SHOW_DRINK_LAB } from '../config'
import { useLang } from '../i18n'
import { useOpenNow } from '../hours'
import Logo from './Logo'
import KeyVisual from './KeyVisual'

export default function Hero({ onPickGroup }) {
  const reduce = useReducedMotion()
  const { t, w } = useLang()
  const openNow = useOpenNow()

  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <motion.div
          className="hero-logo"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h1 className="sr-only">Brew Lab Coffee Beacon</h1>
          <Logo className="hero-logo-art" />
        </motion.div>

        <KeyVisual className="hero-visual" />

        <div className="hero-bottom">
          <div>
            <p className={`open-badge${openNow ? ' is-open' : ''}`}>
              <span className="open-dot" aria-hidden="true" />
              {openNow ? t('openNow') : t('closedNow')}
            </p>
            <p className="hero-lede">{t('heroLede')}</p>
          </div>
          <div className="hero-jumps">
            {SHOW_DRINK_LAB && <a className="jump jump-primary" href="#lab">{t('heroBuild')}</a>}
            {groups.map((g) => (
              <button key={g.id} className="jump" onClick={() => onPickGroup(g.id)}>
                {w(g.label)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
