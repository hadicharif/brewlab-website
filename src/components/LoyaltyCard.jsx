import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import QRCode from 'qrcode'
import { X } from 'lucide-react'
import Logo from './Logo'

const T = {
  en: {
    card: 'Member card', points: 'points', tap: 'Tap to show at the counter',
    showTitle: 'Show this to our staff', showNote: 'They scan it to add points for what you buy in the café.',
    bright: 'Tip: turn up your screen brightness.', close: 'Close',
  },
  ar: {
    card: 'بطاقة العضوية', points: 'نقطة', tap: 'اضغط لإظهارها عند الكاونتر',
    showTitle: 'أظهر هذه البطاقة لفريقنا', showNote: 'يمسحونها لإضافة نقاط على مشترياتك في المقهى.',
    bright: 'نصيحة: ارفع سطوع الشاشة.', close: 'إغلاق',
  },
}

// K7Q2MX9P → "K7Q2 MX9P" (easier to read out)
export const prettyCode = (c) => (c ? `${c.slice(0, 4)} ${c.slice(4)}` : '')

function useQrSvg(code) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    if (!code) return
    QRCode.toString(code, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#3f3f3f', light: '#ffffff' } })
      .then(setSvg).catch(() => setSvg(''))
  }, [code])
  return svg
}

// The customer's digital loyalty card, inside the Rewards panel
export default function LoyaltyCard({ name, points, code, lang }) {
  const L = T[lang]
  const svg = useQrSvg(code)
  const [big, setBig] = useState(false)

  useEffect(() => {
    if (!big) return
    const onKey = (e) => e.key === 'Escape' && setBig(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [big])

  return (
    <>
      <button type="button" className="lc" onClick={() => code && setBig(true)} disabled={!code} aria-label={`${L.card}: ${L.tap}`}>
        <span className="lc-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="lc-top">
          <Logo className="lc-logo" />
          <span className="lc-label">{L.card}</span>
        </span>
        <span className="lc-main">
          <span className="lc-who">
            <span className="lc-name">{name}</span>
            <span className="lc-points"><b dir="ltr">{points}</b> {L.points}</span>
          </span>
          {svg && <span className="lc-qr" dangerouslySetInnerHTML={{ __html: svg }} />}
        </span>
        {code && (
          <span className="lc-bottom">
            <span className="lc-code" dir="ltr">{prettyCode(code)}</span>
            <span className="lc-tap">{L.tap}</span>
          </span>
        )}
      </button>

      {big && createPortal(
        <div className="lc-full" role="dialog" aria-modal="true" aria-label={L.card} onClick={() => setBig(false)} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="lc-full-inner" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn lc-full-close" onClick={() => setBig(false)} aria-label={L.close} autoFocus><X size={24} /></button>
            <Logo className="lc-full-logo" />
            <p className="lc-full-title">{L.showTitle}</p>
            <div className="lc-full-qr" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="lc-full-name">{name}</p>
            <p className="lc-full-code" dir="ltr">{prettyCode(code)}</p>
            <p className="lc-full-note">{L.showNote}</p>
            <p className="lc-full-note">{L.bright}</p>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
