// Google Analytics (GA4). Does nothing until GA_ID is set in src/config.js.
// Only counts visits and actions; never sends names, phone numbers or emails.
import { GA_ID } from '../config'

let started = false

export function startAnalytics() {
  if (started || !GA_ID || typeof window === 'undefined') return
  // no tracking on the staff page or the editor
  if (/^#(staff|editor)/.test(window.location.hash)) return
  started = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(s)
}

// track('order_sent', { value: 12.5, currency: 'USD' })
export function track(name, params = {}) {
  try { if (started && window.gtag) window.gtag('event', name, params) } catch { /* ignore */ }
}
