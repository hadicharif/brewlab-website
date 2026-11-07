import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { supabase, withTimeout } from '../lib/supabase'
import { useRewards } from '../RewardsContext'
import { useLang } from '../i18n'
import { WHATSAPP_NUMBER } from '../data/menu'
import Logo from './Logo'

// what customers can tap; stored in English, shown in their language
export const FEEDBACK_TOPICS = [
  { id: 'Coffee', ar: 'القهوة' },
  { id: 'Food', ar: 'الطعام' },
  { id: 'Sweets', ar: 'الحلويات' },
  { id: 'Service', ar: 'الخدمة' },
  { id: 'Speed', ar: 'السرعة' },
  { id: 'Atmosphere', ar: 'الأجواء' },
  { id: 'Cleanliness', ar: 'النظافة' },
  { id: 'Prices', ar: 'الأسعار' },
]

const T = {
  en: {
    bar: 'Feedback', back: 'Back to the website', lang: 'العربية',
    title: 'How was your Brew Lab visit?',
    intro: 'Tell us what you loved and what we can do better. We read every message.',
    rate: 'Your rating', ratings: ['Not good', 'Could be better', 'Okay', 'Good', 'Loved it'],
    topicsGood: 'What did you like?', topicsBad: 'What went wrong?', pick: 'Tap any that apply.',
    comment: 'Anything else?', commentPh: 'Your drink, our team, an idea…',
    name: 'Name', contact: 'Phone or email', optional: '(optional)',
    sorryNote: 'Sorry it wasn’t great. Leave your number and we’ll get back to you.',
    order: 'About order',
    send: 'Send feedback', sending: 'Sending…', errRate: 'Choose a rating first.',
    thanksTitle: 'Thank you!', thanksGood: 'We’re glad you enjoyed it. See you again soon.',
    thanksBad: 'Thanks for telling us. We’ll use it to do better.',
    thanksCall: 'We’ll be in touch soon.',
    failed: 'We couldn’t send your feedback right now.', viaWa: 'Send it on WhatsApp instead',
    another: 'Back to the menu',
    waHead: 'Feedback',
  },
  ar: {
    bar: 'رأيك', back: 'العودة إلى الموقع', lang: 'English',
    title: 'كيف كانت زيارتك إلى Brew Lab\u200F؟',
    intro: 'أخبرنا بما أحببته وبما يمكننا تحسينه. نقرأ كل رسالة.',
    rate: 'تقييمك', ratings: ['سيئ', 'يمكن أن يكون أفضل', 'مقبول', 'جيد', 'رائع'],
    topicsGood: 'ماذا أعجبك؟', topicsBad: 'ما الذي لم يكن جيداً؟', pick: 'اختر ما ينطبق.',
    comment: 'هل من شيء آخر؟', commentPh: 'مشروبك، فريقنا، فكرة…',
    name: 'الاسم', contact: 'الهاتف أو البريد الإلكتروني', optional: '(اختياري)',
    sorryNote: 'نأسف لأن التجربة لم تكن جيدة. اترك رقمك وسنتواصل معك.',
    order: 'بخصوص الطلب',
    send: 'أرسل رأيك', sending: 'جارٍ الإرسال…', errRate: 'اختر تقييماً أولاً.',
    thanksTitle: 'شكراً لك!', thanksGood: 'سعداء لأنك استمتعت. نراك قريباً.',
    thanksBad: 'شكراً لإخبارنا. سنستفيد من ذلك لنكون أفضل.',
    thanksCall: 'سنتواصل معك قريباً.',
    failed: 'تعذّر إرسال رأيك حالياً.', viaWa: 'أرسله عبر واتساب بدلاً من ذلك',
    another: 'العودة إلى القائمة',
    waHead: 'رأي زبون',
  },
}

const CUSTOMER_KEY = 'brewlab-customer'
const savedCustomer = () => { try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || 'null') } catch { return null } }
const hashParam = (k) => new URLSearchParams(window.location.hash.split('?')[1] || '').get(k)
const ratingFromHash = () => { const r = Number(hashParam('rating')); return r >= 1 && r <= 5 ? r : 0 }
const orderFromHash = () => Number(new URLSearchParams(window.location.hash.split('?')[1] || '').get('order')) || null

export default function FeedbackPage() {
  const { lang, toggle } = useLang()
  const L = T[lang]
  const rw = useRewards()
  const saved = useRef(savedCustomer())
  const [rating, setRating] = useState(ratingFromHash)
  const [hover, setHover] = useState(0)
  const [topics, setTopics] = useState([])
  const [comment, setComment] = useState('')
  const [name, setName] = useState(saved.current?.name || '')
  const [contact, setContact] = useState(saved.current?.phone || '')
  const [orderNo] = useState(orderFromHash)
  const [state, setState] = useState('form') // form | sending | done | failed
  const [err, setErr] = useState('')

  // fill in from the rewards account when signed in
  useEffect(() => {
    if (!rw.account) return
    setName((n) => n || rw.account.name || '')
    setContact((c) => c || rw.account.email || '')
  }, [rw.account])

  const low = rating > 0 && rating <= 3
  const toggleTopic = (id) => setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))

  const waUrl = () => {
    const lines = [`*${L.waHead}*${orderNo ? ` #${orderNo}` : ''}`, '★'.repeat(rating) + '☆'.repeat(5 - rating)]
    if (topics.length) lines.push(topics.map((id) => (lang === 'ar' ? FEEDBACK_TOPICS.find((x) => x.id === id).ar : id)).join(', '))
    if (comment.trim()) lines.push('', comment.trim())
    if (name.trim()) lines.push('', `${L.name}: ${name.trim()}`)
    if (contact.trim()) lines.push(`${L.contact}: ${contact.trim()}`)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!rating) { setErr(L.errRate); document.getElementById('fb-stars')?.focus(); return }
    setErr('')
    if (!supabase) return setState('failed')
    setState('sending')
    try {
      const { error } = await withTimeout(supabase.rpc('submit_feedback', {
        p_rating: rating, p_topics: topics, p_comment: comment, p_name: name, p_contact: contact,
        p_order_id: orderNo, p_lang: lang,
      }), 8000)
      if (error) throw error
      setState('done')
    } catch (e2) {
      console.warn('Feedback not saved', e2)
      setState('failed')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // arrow keys move through the stars (radio group)
  const onStarsKey = (e) => {
    const k = e.key
    const fwd = lang === 'ar' ? 'ArrowLeft' : 'ArrowRight'
    const bwd = lang === 'ar' ? 'ArrowRight' : 'ArrowLeft'
    if (k === fwd || k === 'ArrowUp') { e.preventDefault(); setRating((r) => Math.min(5, r + 1)) }
    if (k === bwd || k === 'ArrowDown') { e.preventDefault(); setRating((r) => Math.max(1, r - 1)) }
  }

  const shown = hover || rating

  let body
  if (state === 'done') {
    body = (
      <div className="fb-done">
        <div className="fb-done-stars" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={30} className={i <= rating ? 'on' : ''} />)}</div>
        <h1>{L.thanksTitle}</h1>
        <p>{low ? L.thanksBad : L.thanksGood}</p>
        {low && contact.trim() && <p>{L.thanksCall}</p>}
        <a className="btn-primary" href="#">{L.another}</a>
      </div>
    )
  } else {
    body = (
      <form className="fb-form" onSubmit={submit} noValidate>
        <h1>{L.title}</h1>
        <p className="fb-intro">{L.intro}</p>
        {orderNo && <p className="fb-order">{L.order} <span dir="ltr">#{orderNo}</span></p>}

        <fieldset className="fb-block">
          <legend>{L.rate}</legend>
          <div id="fb-stars" className="fb-stars" role="radiogroup" aria-label={L.rate} tabIndex={-1}
            onKeyDown={onStarsKey} onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} – ${L.ratings[i - 1]}`}
                tabIndex={rating ? (rating === i ? 0 : -1) : (i === 1 ? 0 : -1)}
                className={i <= shown ? 'on' : ''}
                onMouseEnter={() => setHover(i)} onClick={() => { setRating(i); setErr('') }}>
                <Star size={40} strokeWidth={1.6} aria-hidden="true" />
              </button>
            ))}
          </div>
          <p className="fb-rating-label" aria-live="polite">{shown ? L.ratings[shown - 1] : ' '}</p>
          {err && <p className="field-error">{err}</p>}
        </fieldset>

        {rating > 0 && (
          <>
            <fieldset className="fb-block">
              <legend>{low ? L.topicsBad : L.topicsGood}</legend>
              <p className="fb-help">{L.pick}</p>
              <div className="fb-chips">
                {FEEDBACK_TOPICS.map((t) => (
                  <button key={t.id} type="button" aria-pressed={topics.includes(t.id)}
                    className={`fb-chip${topics.includes(t.id) ? ' on' : ''}`} onClick={() => toggleTopic(t.id)}>
                    {lang === 'ar' ? t.ar : t.id}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="field fb-block">
              <label htmlFor="fb-comment">{L.comment} <span className="optional">{L.optional}</span></label>
              <textarea id="fb-comment" rows={4} maxLength={1000} placeholder={L.commentPh}
                value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>

            {low && <p className="fb-sorry">{L.sorryNote}</p>}
            <div className="fb-row">
              <div className="field">
                <label htmlFor="fb-name">{L.name} <span className="optional">{L.optional}</span></label>
                <input id="fb-name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="fb-contact">{L.contact} <span className="optional">{L.optional}</span></label>
                <input id="fb-contact" dir="ltr" autoComplete="tel" maxLength={120} value={contact} onChange={(e) => setContact(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {state === 'failed' && (
          <div className="fb-failed" role="alert">
            <p>{L.failed}</p>
            <a className="btn-whatsapp" href={waUrl()} target="_blank" rel="noreferrer">{L.viaWa}</a>
          </div>
        )}

        <button type="submit" className="btn-primary fb-send" disabled={state === 'sending'}>
          {state === 'sending' ? L.sending : L.send}
        </button>
      </form>
    )
  }

  return (
    <div className="subpage">
      <header className="subpage-bar">
        <a href="#" className="subpage-logo" aria-label={L.back}><Logo /></a>
        <span className="subpage-title">{L.bar}</span>
        <button className="lang-button" onClick={toggle}>{L.lang}</button>
      </header>
      <main className="subpage-main fb-main">
        {body}
        <a className="link-btn subpage-back" href="#">{L.back}</a>
      </main>
    </div>
  )
}
