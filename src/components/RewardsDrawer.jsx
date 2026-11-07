import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cake, Gift, Mail, X } from 'lucide-react'
import { useRewards } from '../RewardsContext'
import LoyaltyCard from './LoyaltyCard'
import { useLang } from '../i18n'
import { GOOGLE_LOGIN } from '../config'
import { getRemember, setRemember } from '../lib/supabase'
import { normalizePhone } from '../lib/phone'

const T = {
  en: {
    title: 'Brew Lab Rewards',
    joinTitle: 'Collect points on every order',
    joinBody: (ppd) => `Earn ${ppd} points for every $1, swap them for free drinks and food, and get a free drink on your birthday.`,
    welcome: (n) => `Get ${n} points when you join.`,
    email: 'Your email', sendLink: 'Send me a login link', sending: 'Sending…',
    google: 'Continue with Google', or: 'or use your email', remember: 'Keep me signed in on this device',
    noPassword: 'No password needed. We email you a link that signs you in.',
    checkTitle: 'Check your email', checkBody: (e) => `We sent a login link to ${e}. Open it on this phone to sign in.`,
    otherEmail: 'Use a different email',
    errEmail: 'Enter a valid email address.',
    detailsTitle: 'Almost done', detailsBody: 'Tell us your name and phone number so we know who’s ordering and can reach you about your order.',
    phoneTitle: 'One more thing', phoneBody: 'Add your phone number so we can reach you about your orders and rewards.',
    phoneHelp: 'e.g. 70 123 456', errPhone: 'Enter a valid phone number, e.g. 70 123 456.',
    offers: 'Send me Brew Lab offers and news on WhatsApp',
    name: 'Your name', phone: 'Phone', birthday: 'Your birthday', optional: '(optional)',
    bdayHelp: 'Used only for your birthday drink. It can’t be changed later.',
    save: 'Save', saving: 'Saving…', errName: 'Add your name.',
    hi: (n) => `Hi ${n}`, points: 'points',
    toNext: (n, r) => `${n} points to: ${r}`, top: 'You can redeem every reward',
    bdayTitle: 'Birthday drink',
    bdayReady: 'Happy birthday! Your free drink is ready.',
    bdayDone: 'You’ve had this year’s birthday drink. See you next year!',
    bdayWait: (w, d) => `Unlocks ${w} days before your birthday (${d}).`,
    bdayAdd: 'Add your birthday to get a free drink.',
    rewards: 'Rewards', redeem: 'Redeem', need: (n) => `${n} pts`,
    codeTitle: 'Show this at the counter', codeNote: 'Our staff check this code and give you your reward.',
    done: 'Done', how: 'How it works',
    how1: (ppd) => `You earn ${ppd} points for every $1, online or in the café. Show your card at the counter, and online orders count once we confirm them.`,
    how2: 'Swap points for rewards, then show the code at the counter.',
    how3: 'Your birthday drink appears around your birthday, once a year.',
    activity: 'Activity', pending: 'Waiting for confirmation', used: 'used', none: 'No activity yet.',
    birthdayAct: 'Birthday drink', instore: 'Purchase in the café', signOut: 'Sign out', close: 'Close',
    loading: 'Loading…', offline: 'Rewards are unavailable right now. You can still order as usual.',
    staff: 'Open staff page',
  },
  ar: {
    title: 'مكافآت Brew Lab',
    joinTitle: 'اجمع النقاط مع كل طلب',
    joinBody: (ppd) => `اربح ${ppd} نقاط عن كل دولار، واستبدلها بمشروبات وطعام مجاناً، واحصل على مشروب مجاني في عيد ميلادك.`,
    welcome: (n) => `احصل على ${n} نقطة عند الانضمام.`,
    email: 'بريدك الإلكتروني', sendLink: 'أرسل لي رابط الدخول', sending: 'جارٍ الإرسال…',
    google: 'المتابعة عبر Google', or: 'أو استخدم بريدك الإلكتروني', remember: 'أبقني مسجّلاً على هذا الجهاز',
    noPassword: 'بدون كلمة مرور. نرسل لك رابطاً يسجّل دخولك.',
    checkTitle: 'تفقّد بريدك الإلكتروني', checkBody: (e) => `أرسلنا رابط الدخول إلى ${e}. افتحه على هذا الهاتف لتسجيل الدخول.`,
    otherEmail: 'استخدم بريداً آخر',
    errEmail: 'أدخل بريداً إلكترونياً صحيحاً.',
    detailsTitle: 'خطوة أخيرة', detailsBody: 'أخبرنا اسمك ورقم هاتفك لنعرف من يطلب ونتواصل معك بشأن طلبك.',
    phoneTitle: 'شيء أخير', phoneBody: 'أضف رقم هاتفك لنتواصل معك بشأن طلباتك ومكافآتك.',
    phoneHelp: 'مثلاً 70 123 456', errPhone: 'أدخل رقم هاتف صحيحاً، مثلاً 70 123 456.',
    offers: 'أرسلوا لي عروض وأخبار Brew Lab على واتساب',
    name: 'الاسم', phone: 'رقم الهاتف', birthday: 'تاريخ ميلادك', optional: '(اختياري)',
    bdayHelp: 'نستخدمه فقط لمشروب عيد ميلادك، ولا يمكن تغييره لاحقاً.',
    save: 'حفظ', saving: 'جارٍ الحفظ…', errName: 'أضف اسمك.',
    hi: (n) => `أهلاً ${n}`, points: 'نقطة',
    toNext: (n, r) => `باقي ${n} نقطة للحصول على: ${r}`, top: 'يمكنك استبدال كل المكافآت',
    bdayTitle: 'مشروب عيد الميلاد',
    bdayReady: 'عيد ميلاد سعيد! مشروبك المجاني جاهز.',
    bdayDone: 'حصلت على مشروب عيد ميلادك لهذه السنة. نراك السنة القادمة!',
    bdayWait: (w, d) => `يُفتح قبل عيد ميلادك بـ${w} أيام (${d}).`,
    bdayAdd: 'أضف تاريخ ميلادك لتحصل على مشروب مجاني.',
    rewards: 'المكافآت', redeem: 'استبدل', need: (n) => `${n} نقطة`,
    codeTitle: 'أظهر هذا الرمز عند الكاونتر', codeNote: 'يتحقق فريقنا من الرمز ويعطيك مكافأتك.',
    done: 'تم', how: 'كيف تعمل',
    how1: (ppd) => `تربح ${ppd} نقاط عن كل دولار، أونلاين أو في المقهى. أظهر بطاقتك عند الكاونتر، وتُحتسب الطلبات أونلاين بعد تأكيدها.`,
    how2: 'استبدل النقاط بالمكافآت، ثم أظهر الرمز عند الكاونتر.',
    how3: 'يظهر مشروب عيد ميلادك حول تاريخ ميلادك، مرة في السنة.',
    activity: 'النشاط', pending: 'بانتظار التأكيد', used: 'مستخدم', none: 'لا يوجد نشاط بعد.',
    birthdayAct: 'مشروب عيد الميلاد', instore: 'مشتريات في المقهى', signOut: 'تسجيل الخروج', close: 'إغلاق',
    loading: 'جارٍ التحميل…', offline: 'المكافآت غير متاحة حالياً. يمكنك الطلب كالمعتاد.',
    staff: 'افتح صفحة الموظفين',
  },
}

const fmtDate = (ts, lang) => new Date(ts).toLocaleDateString(lang === 'ar' ? 'ar-LB' : 'en-GB', { day: 'numeric', month: 'short' })
const fmtBday = (iso, lang) => {
  const [, m, d] = iso.split('-').map(Number)
  return new Date(2000, m - 1, d).toLocaleDateString(lang === 'ar' ? 'ar-LB' : 'en-GB', { day: 'numeric', month: 'long' })
}

export default function RewardsDrawer() {
  const { lang, rtl } = useLang()
  const L = T[lang]
  const rw = useRewards()
  const a = rw.account
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState(null)
  const [details, setDetails] = useState({ name: '', phone: '', birthday: '', offers: false })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [shown, setShown] = useState(null)
  const [bdayInput, setBdayInput] = useState('')
  const [remember, setRememberState] = useState(getRemember)
  const toggleRemember = (on) => { setRememberState(on); setRemember(on) }
  const closeRef = useRef(null)

  // signed in with Google: start the details form with their name
  useEffect(() => {
    if (rw.status !== 'needsProfile') return
    const meta = rw.session?.user?.user_metadata || {}
    const fromAccount = rw.profile?.name || meta.full_name || meta.name || ''
    if (fromAccount) setDetails((d) => (d.name ? d : { ...d, name: fromAccount }))
  }, [rw.status, rw.session, rw.profile])

  useEffect(() => {
    if (!rw.open) { setShown(null); setErr(''); return }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && rw.closeRewards()
    window.addEventListener('keydown', onKey)
    setTimeout(() => closeRef.current?.focus(), 50)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [rw.open])

  const run = async (fn) => {
    setBusy(true); setErr('')
    try { await fn() } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }
  const sendLink = (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr(L.errEmail)
    run(async () => { await rw.sendLink(email.trim()); setSentTo(email.trim()) })
  }
  const saveDetails = (e) => {
    e.preventDefault()
    if (!details.name.trim()) return setErr(L.errName)
    const phone = normalizePhone(details.phone)
    if (!phone) return setErr(L.errPhone)
    run(() => rw.saveProfile({ name: details.name.trim(), phone, birthday: details.birthday || null, offers: details.offers }))
  }

  const tiers = rw.tiers
  const ppd = rw.settings.ppd
  const next = a && tiers.find((t) => t.pts > a.points)
  const prevPts = a ? [...tiers].reverse().find((t) => t.pts <= a.points)?.pts || 0 : 0
  const pct = a ? (next ? ((a.points - prevPts) / (next.pts - prevPts)) * 100 : 100) : 0
  const off = rtl ? '-100%' : '100%'
  const year = new Date().getFullYear()

  const actLabel = (h) =>
    h.type === 'birthday' ? L.birthdayAct
      : h.type === 'instore' ? L.instore
      : h.type === 'redeem' ? tiers.find((t) => t.id === h.tier)?.[lang] || h.tier
        : h.label

  const Hero = () => (
    <div className="rw-hero">
      <svg viewBox="0 0 120 90" aria-hidden="true">
        <path d="M50 90V42a24 24 0 0 1 48 0v48z" fill="#ffffff" />
        <path d="M22 90V54a20 20 0 0 1 40 0v36z" fill="#f5b4a1" />
        <circle cx="26" cy="20" r="12" fill="#f5b4a1" /><circle cx="96" cy="10" r="6" fill="#ffffff" />
      </svg>
    </div>
  )

  let body
  if (rw.status === 'offline') {
    body = <div className="drawer-body rw-join"><p>{L.offline}</p></div>
  } else if (rw.status === 'loading') {
    body = <div className="drawer-body rw-join"><p>{L.loading}</p></div>
  } else if (rw.status === 'signedOut') {
    body = sentTo ? (
      <div className="drawer-body rw-join">
        <Mail size={44} aria-hidden="true" />
        <h3>{L.checkTitle}</h3>
        <p>{L.checkBody(sentTo)}</p>
        <button className="link-btn" onClick={() => { setSentTo(null); setEmail('') }}>{L.otherEmail}</button>
      </div>
    ) : (
      <form className="drawer-body rw-join" onSubmit={sendLink} noValidate>
        <Hero />
        <h3>{L.joinTitle}</h3>
        <p>{L.joinBody(ppd)}</p>
        <p className="rw-welcome">★ {L.welcome(rw.settings.welcome)}</p>
        <label className="rw-remember">
          <input type="checkbox" checked={remember} onChange={(e) => toggleRemember(e.target.checked)} />
          {L.remember}
        </label>
        {GOOGLE_LOGIN && (
          <div className="rw-social">
            {GOOGLE_LOGIN && <button type="button" className="btn-google" disabled={busy} onClick={() => run(() => rw.signInWith('google'))}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
              {L.google}
            </button>}
            <p className="rw-or">{L.or}</p>
          </div>
        )}
        <div className="field rw-field">
          <label htmlFor="rw-email">{L.email}</label>
          <input id="rw-email" type="email" dir="ltr" autoComplete="email" inputMode="email" value={email}
            onChange={(e) => { setEmail(e.target.value); setErr('') }} aria-invalid={!!err} aria-describedby={err ? 'rw-err' : 'rw-np'} />
          {err && <p className="field-error" id="rw-err">{err}</p>}
          <p className="rw-help" id="rw-np">{L.noPassword}</p>
        </div>
        <button type="submit" className="btn-primary rw-join-btn" disabled={busy}>{busy ? L.sending : L.sendLink}</button>
      </form>
    )
  } else if (rw.status === 'needsProfile') {
    const phoneOnly = !!rw.profile?.name   // older account: only the phone is missing
    body = (
      <form className="drawer-body rw-join" onSubmit={saveDetails} noValidate>
        <h3>{phoneOnly ? L.phoneTitle : L.detailsTitle}</h3>
        <p>{phoneOnly ? L.phoneBody : L.detailsBody}</p>
        <div className="field rw-field">
          <label htmlFor="rw-name">{L.name}</label>
          <input id="rw-name" autoComplete="given-name" value={details.name}
            onChange={(e) => { setDetails({ ...details, name: e.target.value }); setErr('') }} />
        </div>
        <div className="field rw-field">
          <label htmlFor="rw-phone">{L.phone}</label>
          <input id="rw-phone" type="tel" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="70 123 456" value={details.phone}
            aria-describedby="rw-phone-help" required
            onChange={(e) => { setDetails({ ...details, phone: e.target.value }); setErr('') }} />
          <p className="rw-help" id="rw-phone-help">{L.phoneHelp}</p>
        </div>
        {!rw.profile?.birthday && (
          <div className="field rw-field">
            <label htmlFor="rw-bday">{L.birthday} <span className="optional">{L.optional}</span></label>
            <input id="rw-bday" type="date" value={details.birthday} onChange={(e) => setDetails({ ...details, birthday: e.target.value })} />
            <p className="rw-help">{L.bdayHelp}</p>
          </div>
        )}
        <label className="rw-remember rw-offers">
          <input type="checkbox" checked={details.offers} onChange={(e) => setDetails({ ...details, offers: e.target.checked })} />
          <span>{L.offers}</span>
        </label>
        {err && <p className="field-error">{err}</p>}
        <button type="submit" className="btn-primary rw-join-btn" disabled={busy}>{busy ? L.saving : L.save}</button>
      </form>
    )
  } else if (shown) {
    body = (
      <div className="drawer-body rw-code">
        <h3>{L.codeTitle}</h3>
        <p className="rw-code-label">{shown.label}</p>
        <div className="rw-code-box" dir="ltr">{shown.code}</div>
        <p>{L.codeNote}</p>
        <button className="btn-primary" onClick={() => setShown(null)}>{L.done}</button>
      </div>
    )
  } else if (a) {
    body = (
      <div className="drawer-body rw-account">
        <LoyaltyCard name={a.name} points={a.points} code={a.cardCode} lang={lang} />
        <div className="rw-progress">
          <div className="rw-bar" aria-hidden="true"><motion.span initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }} /></div>
          <p className="rw-next">{next ? L.toNext(next.pts - a.points, next[lang]) : L.top}</p>
        </div>
        {err && <p className="field-error rw-err">{err}</p>}

        <div className={`rw-bday${rw.birthdayReady ? ' is-ready' : ''}`}>
          <Cake size={26} aria-hidden="true" />
          <div className="rw-bday-text">
            <p className="rw-bday-title">{L.bdayTitle}</p>
            {!a.birthday ? (
              <>
                <p>{L.bdayAdd}</p>
                <div className="rw-bday-add">
                  <input type="date" value={bdayInput} onChange={(e) => setBdayInput(e.target.value)} aria-label={L.birthday} />
                  <button className="btn-redeem" disabled={!bdayInput || busy} onClick={() => run(() => rw.updateBirthday(bdayInput))}>{L.save}</button>
                </div>
                <p className="rw-help">{L.bdayHelp}</p>
              </>
            ) : rw.birthdayReady ? (
              <>
                <p>{L.bdayReady}</p>
                <button className="btn-redeem" disabled={busy}
                  onClick={() => run(async () => { const c = await rw.redeemBirthday(); setShown({ label: L.bdayTitle, code: c }) })}>{L.redeem}</button>
              </>
            ) : (
              <p>{a.birthdayYear === year ? L.bdayDone : L.bdayWait(rw.settings.window, fmtBday(a.birthday, lang))}</p>
            )}
          </div>
        </div>

        <h3 className="rw-h">{L.rewards}</h3>
        <ul className="rw-tiers">
          {tiers.map((t) => {
            const ok = a.points >= t.pts
            return (
              <li key={t.id} className={ok ? 'ok' : ''}>
                <Gift size={20} aria-hidden="true" />
                <span className="rw-tier-name">{t[lang]}{ok && <small className="rw-tier-small">{L.need(t.pts)}</small>}</span>
                {ok ? (
                  <button className="btn-redeem" disabled={busy}
                    onClick={() => run(async () => { const c = await rw.redeem(t.id); setShown({ label: t[lang], code: c }) })}>{L.redeem}</button>
                ) : (
                  <span className="rw-tier-pts">{L.need(t.pts)}</span>
                )}
              </li>
            )
          })}
        </ul>

        <h3 className="rw-h">{L.how}</h3>
        <ol className="rw-how"><li>{L.how1(ppd)}</li><li>{L.how2}</li><li>{L.how3}</li></ol>

        <h3 className="rw-h">{L.activity}</h3>
        {a.history.length ? (
          <ul className="rw-activity">
            {a.history.map((h, i) => (
              <li key={i}>
                <span>
                  {actLabel(h)}
                  {h.code && <small dir="ltr"> {h.code}{h.used ? ` (${L.used})` : ''}</small>}
                  {h.type === 'pending' && <small className="rw-pending"> {L.pending}</small>}
                </span>
                <span className="rw-act-meta">
                  {h.pts !== 0 && <b className={h.pts < 0 ? 'neg' : ''} dir="ltr">{h.pts > 0 ? `+${h.pts}` : h.pts}</b>} {fmtDate(h.at, lang)}
                </span>
              </li>
            ))}
          </ul>
        ) : <p className="rw-help">{L.none}</p>}

        {a.isStaff && <a className="btn-ghost rw-staff" href="#staff" onClick={rw.closeRewards}>{L.staff}</a>}
        {(a.isOwner || a.isSocial) && <a className="btn-ghost rw-staff" href="#editor" onClick={rw.closeRewards}>{lang === 'ar' ? 'تعديل الموقع' : 'Edit website'}</a>}
        <button className="btn-reset rw-signout" onClick={rw.signOut}>{L.signOut}</button>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {rw.open && (
        <>
          <motion.div className="drawer-backdrop" onClick={rw.closeRewards} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="drawer rewards" role="dialog" aria-modal="true" aria-labelledby="rw-title"
            initial={{ x: off }} animate={{ x: 0 }} exit={{ x: off }} transition={{ type: 'spring', stiffness: 360, damping: 38 }}>
            <div className="drawer-head">
              <h2 id="rw-title">{L.title}</h2>
              <button ref={closeRef} className="icon-btn" onClick={rw.closeRewards} aria-label={L.close}><X size={22} /></button>
            </div>
            {body}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
