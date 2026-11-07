import { ChevronRight, Clock, MapPin, MessageCircle, Star } from 'lucide-react'
import { INSTAGRAM_URL, MAPS_URL, WHATSAPP_NUMBER } from '../data/menu'
import { useLang } from '../i18n'
import Logo from './Logo'

import { prettyPhone } from '../lib/phone'

// simple camera glyph for the Instagram link
const InstaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)
const handleOf = (url) => `@${url.replace(/\/+$/, '').split('/').pop()}`

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="site-footer" id="visit">
      <div className="container footer-inner">
        <Logo className="footer-logo" />
        <div className="footer-cols">
          <div className="footer-col">
            <h2>{t('findUs')}</h2>
            <p className="footer-line"><Clock size={18} aria-hidden="true" /> {t('hours')}</p>
            <a className="btn-directions" href={MAPS_URL} target="_blank" rel="noreferrer">
              <MapPin size={18} aria-hidden="true" /> {t('directions')}
            </a>
          </div>
          <div className="footer-col">
            <h2>{t('askUs')}</h2>
            <ul className="footer-links">
              <li>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
                  <span className="fl-icon"><MessageCircle size={18} aria-hidden="true" /></span>
                  <span className="fl-text"><small>WhatsApp</small><b dir="ltr">{prettyPhone(WHATSAPP_NUMBER)}</b></span>
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                  <span className="fl-icon"><InstaIcon /></span>
                  <span className="fl-text"><small>Instagram</small><b dir="ltr">{handleOf(INSTAGRAM_URL)}</b></span>
                </a>
              </li>
              <li>
                <a href="#feedback">
                  <span className="fl-icon"><Star size={18} aria-hidden="true" /></span>
                  <span className="fl-text"><small>{t('feedbackSmall')}</small><b>{t('feedbackLink')}</b></span>
                  <ChevronRight className="fl-arrow" size={18} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container footer-legal">
        <p dir="ltr" style={{ textAlign: 'start' }}>© {new Date().getFullYear()} Brew Lab Coffee Beacon</p>
        <a className="footer-privacy" href="privacy.html">{t('privacy')}</a>
      </div>
    </footer>
  )
}
