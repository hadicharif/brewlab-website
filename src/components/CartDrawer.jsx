import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, Trash2, X } from 'lucide-react'
import { useCart } from '../CartContext'
import { formatPrice, menu, WHATSAPP_NUMBER } from '../data/menu'
import { useLang, NAMES, UI, WORDS, wordAr } from '../i18n'
import { useOpenNow, isClosedToday, OPEN_HOUR, CLOSE_HOUR } from '../hours'
import { MiniMark } from './KeyVisual'
import BestSellers, { useSuggestions } from './BestSellers'
import { useRewards } from '../RewardsContext'
import { prettyPhone } from '../lib/phone'
import { supabase, withTimeout } from '../lib/supabase'

const CUSTOMER_KEY = 'brewlab-customer'
const TIMES = ['asap', 'in30', 'in60', 'choose']

// name and options of a cart line in the chosen language
export function lineText(l, lang) {
  const isMenu = menu.some((m) => m.id === l.id)
  const name = lang === 'ar' ? (isMenu ? NAMES[l.id] : l.nameAr) || l.name : l.name
  const parts = (l.parts || []).map((p) => (lang === 'ar' ? wordAr(p) : p))
  return { name, details: parts.join(lang === 'ar' ? '، ' : ', ') }
}

function loadCustomer() {
  try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || 'null') } catch { return null }
}

function buildMessage({ lines, total, subtotal, form, lang, orderNo }) {
  const L = UI[lang]
  const out = [`*${L.waNew}*${orderNo ? ` #${orderNo}` : ''}`, '']
  lines.forEach((l) => {
    const { name, details } = lineText(l, lang)
    const price = l.lineTotal != null ? ` — ${formatPrice(l.lineTotal)}` : ''
    out.push(`${l.qty} × ${name}${price}`)
    if (details) out.push(`   ↳ ${details}`)
  })
  out.push('')
  if (total != null) out.push(`*${L.waTotal}: ${formatPrice(total)}*`, '')
  else if (subtotal > 0) out.push(`*${L.waSubtotal}: ${formatPrice(subtotal)}*`, '')
  out.push(`${L.waName}: ${form.name}`)
  if (form.phone) out.push(`${L.waPhone}: ${form.phone}`)
  out.push(`${L.waType}: ${form.type === 'delivery' ? L.delivery : L.pickup}`)
  out.push(`${L.waTime}: ${form.time === 'choose' ? form.clock : L[form.time]}`)
  if (form.type === 'delivery') out.push(`${L.waAddress}: ${form.address}`)
  if (form.notes) out.push(`${L.waNotes}: ${form.notes}`)
  return out.join('\n')
}

export default function CartDrawer({ open, onClose }) {
  const { lines, total, subtotal, count, add, decrement, remove, clear } = useCart()
  const { t, lang, rtl } = useLang()
  const openNow = useOpenNow()
  const closedToday = isClosedToday()
  const pad = (h) => String(h).padStart(2, '0')
  const timeMin = `${pad(OPEN_HOUR)}:00`
  const timeMax = CLOSE_HOUR === 24 ? '23:59' : CLOSE_HOUR > OPEN_HOUR ? `${pad(CLOSE_HOUR - 1)}:59` : undefined
  const rewards = useRewards()
  const [placed, setPlaced] = useState(null) // { no, pts }
  const [sending, setSending] = useState(false)
  const saved = useRef(loadCustomer())
  const [form, setForm] = useState(() => ({
    name: saved.current?.name || '',
    phone: saved.current?.phone || '',
    type: saved.current?.type || 'pickup',
    address: saved.current?.address || '',
    notes: '',
    time: 'asap',
    clock: '',
  }))
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [sentUrl, setSentUrl] = useState(null)
  const [upsell, setUpsell] = useState(null) // cart ids when the best-seller pop-up opened
  const [upsellDone, setUpsellDone] = useState(false)
  const closeRef = useRef(null)
  // signed-in members: fill in their name and phone if the form is empty
  useEffect(() => {
    const pr = rewards.profile
    if (!pr) return
    setForm((f) => ({ ...f, name: f.name || pr.name || '', phone: f.phone || prettyPhone(pr.phone) }))
  }, [rewards.profile])

  // lock page scroll, close on Escape, move focus into the drawer
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    setTimeout(() => closeRef.current?.focus(), 50)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => { if (!open) { setSentUrl(null); setUpsell(null) } }, [open])
  const suggestions = useSuggestions(upsell || lines.map((l) => l.baseId || l.id))

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const checkout = (e) => {
    e.preventDefault()
    if (closedToday) return
    const er = {}
    if (!form.name.trim()) er.name = t('errName')
    if (form.type === 'delivery' && !form.address.trim()) er.address = t('errAddress')
    if (form.time === 'choose' && !form.clock) er.clock = t('errTime')
    setErrors(er)
    if (Object.keys(er).length) return
    // first time: suggest best sellers before sending
    if (!upsellDone && suggestions.length) {
      setUpsell(lines.map((l) => l.baseId || l.id))
      setUpsellDone(true)
      return
    }
    send()
  }

  // save the order in the database (if reachable), then open WhatsApp
  const send = async () => {
    setUpsell(null)
    if (sending) return
    setSending(true)

    // remember details on this device only
    try {
      if (remember) {
        const { name, phone, type, address } = form
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name, phone, type, address }))
      } else localStorage.removeItem(CUSTOMER_KEY)
    } catch { /* storage unavailable */ }

    // open the WhatsApp tab now, while the tap still counts, and fill it in after saving
    let win = null
    try { win = window.open('', '_blank') } catch { /* blocked */ }

    let orderNo = null
    if (supabase) {
      try {
        const items = lines.map((l) => {
          const { name, details } = lineText(l, 'en')
          return { name, details, qty: l.qty, price: l.lineTotal ?? null }
        })
        const { data, error } = await withTimeout(supabase.rpc('place_order', {
          p_customer_name: form.name.trim(),
          p_phone: form.phone.trim() || null,
          p_order_type: form.type,
          p_address: form.type === 'delivery' ? form.address.trim() : null,
          p_pickup_time: form.time === 'choose' ? form.clock : UI.en[form.time],
          p_notes: form.notes.trim() || null,
          p_items: items,
          p_total: total ?? null,
          p_lang: lang,
        }), 6000)
        if (error) throw error
        orderNo = data
      } catch (e) { console.warn('Order not saved, sending by WhatsApp only', e) }
    }

    const text = buildMessage({ lines, total, subtotal, form, lang, orderNo })
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
    if (win) { try { win.opener = null; win.location.href = url } catch { win = null } }
    if (!win) { try { window.open(url, '_blank', 'noopener') } catch { /* blocked */ } }

    const pts = orderNo && rewards.account && total != null ? rewards.pointsFor(total) : 0
    setPlaced({ no: orderNo, pts })
    if (orderNo) rewards.refresh?.()
    setSending(false)
    setSentUrl(url)
  }

  const startNew = () => {
    setPlaced(null)
    setUpsellDone(false)
    clear()
    setSentUrl(null)
    setForm((f) => ({ ...f, notes: '', time: 'asap', clock: '' }))
    onClose()
  }

  const off = rtl ? '-100%' : '100%'

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-backdrop" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title"
            initial={{ x: off }} animate={{ x: 0 }} exit={{ x: off }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}
          >
            <div className="drawer-head">
              <h2 id="cart-title">
                {t('yourOrder')} {count > 0 && <span className="drawer-count">{count}</span>}
              </h2>
              <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label={t('close')}>
                <X size={22} />
              </button>
            </div>

            {sentUrl ? (
              <div className="drawer-body sent">
                <MiniMark />
                <h3>{t('readyTitle')}</h3>
                <p>{t('readyBody')}</p>
                {placed?.no && (
                  <p className="order-no">{lang === 'ar' ? 'رقم الطلب' : 'Order number'} <b dir="ltr">#{placed.no}</b></p>
                )}
                {placed?.pts > 0 && (
                  <p className="earn-note">★ {lang === 'ar'
                    ? `ستُضاف ${placed.pts} نقطة إلى حسابك بعد تأكيد طلبك.`
                    : `${placed.pts} points will be added once we confirm your order.`}</p>
                )}
                <a className="btn-whatsapp sent-wa" href={sentUrl} target="_blank" rel="noreferrer">{t('openWa')}</a>
                <div className="sent-actions">
                  <button className="btn-ghost" onClick={startNew}>{t('newOrder')}</button>
                  <button className="btn-reset" style={{ justifyContent: 'center' }} onClick={() => setSentUrl(null)}>{t('editOrder')}</button>
                </div>
              </div>
            ) : lines.length === 0 ? (
              <div className="drawer-body empty">
                <MiniMark />
                <h3>{t('emptyTitle')}</h3>
                <p>{t('emptyBody')}</p>
                <button className="btn-primary" onClick={onClose}>{t('browse')}</button>
              </div>
            ) : (
              <form className="drawer-body" onSubmit={checkout} noValidate>
                <ul className="cart-lines">
                  <AnimatePresence initial={false}>
                    {lines.map((l) => {
                      const { name, details } = lineText(l, lang)
                      return (
                        <motion.li
                          key={l.id} layout
                          className={`cart-line${lines.every((x) => x.lineTotal == null) ? ' no-price' : ''}`}
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                        >
                          <div className="cl-info">
                            <span className="cl-name">{name}</span>
                            {details && <span className="cl-recipe">{details}</span>}
                            {l.price != null && <span className="cl-unit">{formatPrice(l.price)} {t('each')}</span>}
                          </div>
                          <div className="stepper small">
                            <button type="button" onClick={() => decrement(l.id)} aria-label={`− ${name}`}>
                              <Minus size={14} strokeWidth={2.5} />
                            </button>
                            <span>{l.qty}</span>
                            <button type="button" onClick={() => add(l.id)} aria-label={`+ ${name}`}>
                              <Plus size={14} strokeWidth={2.5} />
                            </button>
                          </div>
                          <span className="cl-total">{formatPrice(l.lineTotal)}</span>
                          <button type="button" className="icon-btn cl-remove" onClick={() => remove(l.id)} aria-label={`× ${name}`}>
                            <Trash2 size={16} />
                          </button>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>

                <fieldset className="order-type">
                  <legend>{t('howWant')}</legend>
                  <div className="segmented">
                    {['pickup', 'delivery'].map((tp) => (
                      <label key={tp} className={form.type === tp ? 'is-active' : ''}>
                        <input type="radio" name="type" value={tp} checked={form.type === tp} onChange={set('type')} />
                        {t(tp)}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="order-type">
                  <legend>{form.type === 'delivery' ? t('deliveryTime') : t('pickupTime')}</legend>
                  <div className="chips">
                    {TIMES.map((tm) => (
                      <label key={tm} className={`chip chip-plain chip-sm${form.time === tm ? ' is-on' : ''}`}>
                        <input type="radio" name="time" checked={form.time === tm}
                          onChange={() => { setForm((f) => ({ ...f, time: tm })); setErrors((er) => ({ ...er, clock: undefined })) }} />
                        <span>{tm === 'choose' ? t('chooseTime') : t(tm)}</span>
                      </label>
                    ))}
                  </div>
                  {form.time === 'choose' && (
                    <div className="field field-reveal">
                      <label htmlFor="f-clock" className="sr-only">{t('timeLabel')}</label>
                      <input id="f-clock" type="time" min={timeMin} max={timeMax} step="900" value={form.clock}
                        onChange={set('clock')} aria-invalid={!!errors.clock}
                        aria-describedby={errors.clock ? 'e-clock' : undefined} />
                      {errors.clock && <p className="field-error" id="e-clock">{errors.clock}</p>}
                    </div>
                  )}
                  {!openNow && !closedToday && form.time === 'asap' && <p className="closed-note">{t('closedNote')}</p>}
                </fieldset>

                <div className="field">
                  <label htmlFor="f-name">{t('yourName')}</label>
                  <input id="f-name" value={form.name} onChange={set('name')} autoComplete="name"
                    aria-invalid={!!errors.name} aria-describedby={errors.name ? 'e-name' : undefined} />
                  {errors.name && <p className="field-error" id="e-name">{errors.name}</p>}
                </div>

                <div className="field">
                  <label htmlFor="f-phone">{t('phone')} <span className="optional">{t('optional')}</span></label>
                  <input id="f-phone" type="tel" dir="ltr" value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" />
                </div>

                {form.type === 'delivery' && (
                  <div className="field field-reveal">
                    <label htmlFor="f-address">{t('address')}</label>
                    <textarea id="f-address" rows={2} value={form.address} onChange={set('address')}
                      autoComplete="street-address" aria-invalid={!!errors.address}
                      aria-describedby={errors.address ? 'e-address' : undefined} />
                    {errors.address && <p className="field-error" id="e-address">{errors.address}</p>}
                  </div>
                )}

                <div className="field">
                  <label htmlFor="f-notes">{t('notes')} <span className="optional">{t('optional')}</span></label>
                  <textarea id="f-notes" rows={2} value={form.notes} onChange={set('notes')} placeholder={t('notesPh')} />
                </div>

                <label className="remember">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>{t('remember')}</span>
                </label>

                <div className="drawer-foot">
                  {total != null ? (
                    <div className="total-row"><span>{t('total')}</span><strong>{formatPrice(total)}</strong></div>
                  ) : subtotal > 0 ? (
                    <>
                      <div className="total-row"><span>{t('subtotal')}</span><strong>{formatPrice(subtotal)}</strong></div>
                      <p className="total-note partial">{t('partialNote')}</p>
                    </>
                  ) : (
                    <p className="total-note">{t('totalNote')}</p>
                  )}
                  {rewards.pointsFor(total ?? subtotal) > 0 && (
                    rewards.account ? (
                      <p className="earn-note">
                        ★ {lang === 'ar'
                          ? `ستربح ${rewards.pointsFor(total ?? subtotal)} نقطة مع هذا الطلب (تُضاف بعد تأكيده)`
                          : `You’ll earn ${rewards.pointsFor(total ?? subtotal)} reward points with this order (added once we confirm it)`}
                      </p>
                    ) : (
                      <button type="button" className="earn-note earn-join" onClick={rewards.openRewards}>
                        ★ {lang === 'ar'
                          ? `انضم إلى المكافآت واربح ${rewards.pointsFor(total ?? subtotal)} نقطة مع هذا الطلب`
                          : `Join Rewards to earn ${rewards.pointsFor(total ?? subtotal)} points with this order`}
                      </button>
                    )
                  )}
                  {closedToday && <p className="closed-note closed-today" role="status">{t('closedToday')}</p>}
                  <button type="submit" className="btn-whatsapp" disabled={sending || closedToday}>
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.430 9.430 0 1 1 8 4.42zm8.03-17.46A11.300 11.300 0 0 0 12.04.75C5.800.75.720 5.830.720 12.080c0 2 .52 3.94 1.51 5.66L.62 23.62l6.01-1.58a11.300 11.300 0 0 0 5.41 1.38h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.31-8.010z"/>
                    </svg>
                    {t('send')}
                  </button>
                </div>
              </form>
            )}
            <AnimatePresence>
              {upsell && <BestSellers items={suggestions} onSend={send} onBack={() => setUpsell(null)} />}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
