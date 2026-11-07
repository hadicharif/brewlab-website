import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const T = {
  en: { title: 'Scan the member card', hint: 'Point the camera at the QR code on the customer’s phone.', noCam: 'Can’t open the camera. Allow camera access in the browser, or type the card number instead.', close: 'Close' },
  ar: { title: 'امسح بطاقة العضوية', hint: 'وجّه الكاميرا نحو رمز QR على هاتف الزبون.', noCam: 'تعذّر فتح الكاميرا. اسمح للمتصفح باستخدام الكاميرا، أو اكتب رقم البطاقة.', close: 'إغلاق' },
}

const CARD_RE = /^[A-HJ-NP-Z2-9]{8}$/

// Opens the back camera and calls onCode('K7Q2MX9P') when a member card is seen
export default function CardScanner({ lang, onCode, onClose }) {
  const L = T[lang]
  const video = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let stream, raf, stopped = false
    let detector = null
    let jsQR = null
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const found = (text) => {
      const code = String(text || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
      if (!CARD_RE.test(code) || stopped) return false
      stopped = true
      navigator.vibrate?.(60)
      onCode(code)
      return true
    }

    const tick = async () => {
      if (stopped) return
      const v = video.current
      if (v && v.readyState >= 2) {
        try {
          if (detector) {
            const codes = await detector.detect(v)
            if (codes.some((c) => found(c.rawValue))) return
          } else if (jsQR) {
            const w = v.videoWidth, h = v.videoHeight
            const scale = Math.min(1, 640 / Math.max(w, h))
            canvas.width = w * scale; canvas.height = h * scale
            ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const r = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
            if (r && found(r.data)) return
          }
        } catch { /* keep trying */ }
      }
      raf = requestAnimationFrame(tick)
    }

    ;(async () => {
      try {
        if ('BarcodeDetector' in window) {
          const formats = await window.BarcodeDetector.getSupportedFormats?.()
          if (!formats || formats.includes('qr_code')) detector = new window.BarcodeDetector({ formats: ['qr_code'] })
        }
        if (!detector) jsQR = (await import('jsqr')).default
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (stopped) return
        video.current.srcObject = stream
        await video.current.play()
        tick()
      } catch {
        setError(L.noCam)
      }
    })()

    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return createPortal(
    <div className="scan" role="dialog" aria-modal="true" aria-label={L.title} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="scan-head">
        <p>{L.title}</p>
        <button className="icon-btn" onClick={onClose} aria-label={L.close}><X size={24} /></button>
      </div>
      {error ? <p className="scan-error">{error}</p> : (
        <div className="scan-view">
          <video ref={video} playsInline muted />
          <span className="scan-frame" aria-hidden="true" />
        </div>
      )}
      <p className="scan-hint">{L.hint}</p>
    </div>,
    document.body,
  )
}
