import { useCallback, useEffect, useState } from 'react'
import { Cake, Check, RefreshCw, ScanLine, Star, X } from 'lucide-react'
import CardScanner from './CardScanner'
import { prettyCode } from './LoyaltyCard'
import { FEEDBACK_TOPICS } from './FeedbackPage'
import { supabase } from '../lib/supabase'
import { useRewards } from '../RewardsContext'
import { useLang } from '../i18n'
import { formatPrice } from '../data/menu'
import Logo from './Logo'

const T = {
  en: {
    title: 'Staff', back: 'Back to the website', lang: 'العربية',
    signIn: 'Sign in with your staff email to continue.', signInBtn: 'Sign in',
    notStaff: 'This account doesn’t have staff access. Ask the owner to add you.',
    offline: 'Can’t reach the database right now.', loading: 'Loading…',
    pending: 'Waiting to confirm', recent: 'Done today', none: 'No orders waiting.',
    refresh: 'Refresh', confirm: 'Confirm', cancel: 'Cancel', cancelAsk: 'Cancel this order?',
    pickup: 'Pickup', delivery: 'Delivery', member: 'Rewards member',
    noTotal: 'Some items have no price. Enter the final total:', totalPh: 'Total $',
    confirmed: (n, p) => `Order #${n} confirmed${p ? `, ${p} points added` : ''}.`,
    cancelled: (n) => `Order #${n} cancelled.`,
    codeTitle: 'Check a reward code', codePh: 'Code, e.g. K7Q2MX', check: 'Check and use',
    codeOk: (r, c) => `Valid: give ${c || 'the customer'} ${r}. The code is now used.`,
    statusConfirmed: 'confirmed', statusCancelled: 'cancelled',
    tabOrders: 'Orders', tabFeedback: 'Feedback', tabRewards: 'Rewards',
    rwMonth: 'This month', rwGiven: 'rewards redeemed', rwBday: 'birthday drinks', rwSpent: 'points spent', rwWaiting: 'waiting at the counter',
    rwAll: 'All', rwWait: 'Waiting', rwDone: 'Given', rwSearch: 'Search name or code', rwNone: 'No rewards redeemed yet.',
    rwBirthday: 'Birthday drink', rwGivenAt: (t) => `Given ${t}`, rwGiveNow: 'Give now',
    rwGivenMsg: (r, n) => `Done: ${r} given to ${n}.`,
    cardTitle: 'Member card', scan: 'Scan card', cardPh: 'Card number', find: 'Find',
    purchase: 'Purchase total $', willGet: (p) => `= ${p} points`, addPts: 'Add points', clear: 'Next customer',
    bdayReady: 'Birthday drink available this week', memberPts: (p) => `${p} points`,
    added: (n, p, t) => `Added ${p} points to ${n}. New balance: ${t} points.`, inStore: 'In store',
    fbNone: 'No feedback yet.', fbAvg: (a, n) => `${a} average from ${n} reviews (last 30 days)`,
    markRead: 'Mark as read', markUnread: 'Mark as unread', member: 'Rewards member', order: 'Order',
    showRead: 'Show read feedback',
  },
  ar: {
    title: 'الموظفون', back: 'العودة إلى الموقع', lang: 'English',
    signIn: 'سجّل الدخول ببريد الموظف للمتابعة.', signInBtn: 'تسجيل الدخول',
    notStaff: 'هذا الحساب ليس لديه صلاحية الموظفين. اطلب من المالك إضافتك.',
    offline: 'لا يمكن الوصول إلى قاعدة البيانات حالياً.', loading: 'جارٍ التحميل…',
    pending: 'بانتظار التأكيد', recent: 'تمّت اليوم', none: 'لا توجد طلبات بالانتظار.',
    refresh: 'تحديث', confirm: 'تأكيد', cancel: 'إلغاء', cancelAsk: 'إلغاء هذا الطلب؟',
    pickup: 'استلام', delivery: 'توصيل', member: 'عضو في المكافآت',
    noTotal: 'بعض الأصناف بلا سعر. أدخل المجموع النهائي:', totalPh: 'المجموع $',
    confirmed: (n, p) => `تم تأكيد الطلب #${n}${p ? `، وأُضيفت ${p} نقطة` : ''}.`,
    cancelled: (n) => `تم إلغاء الطلب #${n}.`,
    codeTitle: 'تحقّق من رمز مكافأة', codePh: 'الرمز، مثل K7Q2MX', check: 'تحقّق واستخدم',
    codeOk: (r, c) => `صالح: أعطِ ${c || 'الزبون'} ${r}. تم استخدام الرمز.`,
    statusConfirmed: 'مؤكد', statusCancelled: 'ملغى',
    tabOrders: 'الطلبات', tabFeedback: 'الآراء', tabRewards: 'المكافآت',
    rwMonth: 'هذا الشهر', rwGiven: 'مكافأة مستبدلة', rwBday: 'مشروب عيد ميلاد', rwSpent: 'نقطة مصروفة', rwWaiting: 'بانتظار الاستلام',
    rwAll: 'الكل', rwWait: 'بانتظار', rwDone: 'مُعطاة', rwSearch: 'ابحث بالاسم أو الرمز', rwNone: 'لا توجد مكافآت مستبدلة بعد.',
    rwBirthday: 'مشروب عيد الميلاد', rwGivenAt: (t) => `أُعطيت ${t}`, rwGiveNow: 'أعطِ الآن',
    rwGivenMsg: (r, n) => `تم: أُعطيت ${r} إلى ${n}.`,
    cardTitle: 'بطاقة العضوية', scan: 'امسح البطاقة', cardPh: 'رقم البطاقة', find: 'بحث',
    purchase: 'مجموع المشتريات $', willGet: (p) => `= ${p} نقطة`, addPts: 'أضف النقاط', clear: 'الزبون التالي',
    bdayReady: 'مشروب عيد الميلاد متاح هذا الأسبوع', memberPts: (p) => `${p} نقطة`,
    added: (n, p, t) => `أُضيفت ${p} نقطة إلى ${n}. الرصيد الجديد: ${t} نقطة.`, inStore: 'في المقهى',
    fbNone: 'لا توجد آراء بعد.', fbAvg: (a, n) => `متوسط ${a} من ${n} تقييم (آخر 30 يوماً)`,
    markRead: 'تمّت القراءة', markUnread: 'غير مقروء', member: 'عضو في المكافآت', order: 'الطلب',
    showRead: 'إظهار الآراء المقروءة',
  },
}

const day = (ts, lang) => new Date(ts).toLocaleDateString(lang === 'ar' ? 'ar-LB' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Beirut' })
const time = (ts) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Beirut' })

export default function StaffPage() {
  const { lang, toggle } = useLang()
  const L = T[lang]
  const rw = useRewards()
  const [orders, setOrders] = useState(null)
  const [done, setDone] = useState([])
  const [totals, setTotals] = useState({})
  const [msg, setMsg] = useState(null) // { ok, text }
  const [busy, setBusy] = useState(null)
  const [code, setCode] = useState('')
  const [tab, setTab] = useState('orders')
  const [feedback, setFeedback] = useState(null)
  const [redeemed, setRedeemed] = useState(null)
  const [rwFilter, setRwFilter] = useState('all')
  const [rwSearch, setRwSearch] = useState('')
  const [showRead, setShowRead] = useState(false)
  // member card
  const [scanning, setScanning] = useState(false)
  const [cardInput, setCardInput] = useState('')
  const [member, setMember] = useState(null) // { name, points, card_code, birthday_ready }
  const [amount, setAmount] = useState('')

  const isStaff = rw.account?.isStaff

  const load = useCallback(async () => {
    if (!supabase) return
    const since = new Date(); since.setHours(0, 0, 0, 0)
    const [p, d] = await Promise.all([
      supabase.from('orders').select('*').eq('status', 'pending').order('created_at'),
      supabase.from('orders').select('id, customer_name, total, status, points, order_type, confirmed_at')
        .neq('status', 'pending').gte('confirmed_at', since.toISOString()).order('confirmed_at', { ascending: false }).limit(30),
    ])
    if (p.error) { setMsg({ ok: false, text: p.error.message }); return }
    setOrders(p.data); setDone(d.data || [])
    const rd = await supabase.from('redemptions')
      .select('id, kind, tier_id, points, code, status, created_at, used_at, customer:profiles!redemptions_user_id_fkey(name, card_code)')
      .order('created_at', { ascending: false }).limit(300)
    if (!rd.error) setRedeemed(rd.data)
    const f = await supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(150)
    if (!f.error) setFeedback(f.data)
  }, [])

  const toggleSeen = async (f) => {
    setFeedback((list) => list.map((x) => (x.id === f.id ? { ...x, seen: !f.seen } : x)))
    const { error } = await supabase.rpc('mark_feedback_seen', { p_id: f.id, p_seen: !f.seen })
    if (error) { setMsg({ ok: false, text: error.message }); load() }
  }

  // load now and every 20 seconds
  useEffect(() => {
    if (!isStaff) return
    load()
    const id = setInterval(load, 20000)
    return () => clearInterval(id)
  }, [isStaff, load])

  const act = async (o, kind) => {
    if (kind === 'cancel' && !window.confirm(L.cancelAsk)) return
    setBusy(o.id); setMsg(null)
    const res = kind === 'confirm'
      ? await supabase.rpc('confirm_order', { p_order_id: o.id, p_total: o.total == null && totals[o.id] ? Number(totals[o.id]) : null })
      : await supabase.rpc('cancel_order', { p_order_id: o.id })
    setBusy(null)
    if (res.error) setMsg({ ok: false, text: res.error.message })
    else setMsg({ ok: true, text: kind === 'confirm' ? L.confirmed(o.id, res.data) : L.cancelled(o.id) })
    load()
  }

  const findCard = async (code) => {
    if (!code?.trim()) return
    setScanning(false); setBusy('card'); setMsg(null); setMember(null); setAmount('')
    const { data, error } = await supabase.rpc('staff_find_card', { p_code: code })
    setBusy(null)
    if (error) return setMsg({ ok: false, text: error.message })
    setMember(data?.[0] || null); setCardInput('')
  }

  const addPurchase = async (e) => {
    e.preventDefault()
    const amt = Number(amount)
    if (!member || !(amt > 0)) return
    setBusy('card'); setMsg(null)
    const { data, error } = await supabase.rpc('staff_add_purchase', { p_code: member.card_code, p_amount: amt })
    setBusy(null)
    if (error) return setMsg({ ok: false, text: error.message })
    const r = data?.[0]
    setMsg({ ok: true, text: L.added(member.name || '—', r.points_added, r.new_points) })
    setMember(null); setAmount('')
    load()
  }

  const checkCode = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setBusy('code'); setMsg(null)
    const { data, error } = await supabase.rpc('use_code', { p_code: code.trim() })
    setBusy(null)
    if (error) setMsg({ ok: false, text: error.message })
    else { const r = data?.[0]; setMsg({ ok: true, text: L.codeOk(r?.reward, r?.customer) }); setCode('') }
  }

  // rewards tab: history of redeemed points
  const tierName = (r) => (r.kind === 'birthday' ? L.rwBirthday : (rw.tiers.find((t) => t.id === r.tier_id)?.[lang] || r.tier_id))
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const thisMonth = (redeemed || []).filter((r) => Date.parse(r.created_at) >= monthStart.getTime())
  const rwStats = {
    given: thisMonth.filter((r) => r.kind === 'reward').length,
    bday: thisMonth.filter((r) => r.kind === 'birthday').length,
    spent: thisMonth.reduce((a, r) => a + (r.points || 0), 0),
    waiting: (redeemed || []).filter((r) => r.status === 'issued').length,
  }
  const q = rwSearch.trim().toLowerCase()
  const rwList = (redeemed || [])
    .filter((r) => rwFilter === 'all' || (rwFilter === 'wait' ? r.status === 'issued' : r.status === 'used'))
    .filter((r) => !q || (r.customer?.name || '').toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
  const giveNow = async (r) => {
    setBusy(`rw${r.id}`); setMsg(null)
    const { error } = await supabase.rpc('use_code', { p_code: r.code })
    setBusy(null)
    if (error) setMsg({ ok: false, text: error.message })
    else setMsg({ ok: true, text: L.rwGivenMsg(tierName(r), r.customer?.name || '—') })
    load()
  }
  const rewardsView = redeemed === null ? <p className="staff-note">{L.loading}</p> : (
    <>
      <div className="rw-stats">
        <p className="rw-stats-title">{L.rwMonth}</p>
        <div><b dir="ltr">{rwStats.given}</b><span>{L.rwGiven}</span></div>
        <div><b dir="ltr">{rwStats.bday}</b><span>{L.rwBday}</span></div>
        <div><b dir="ltr">{rwStats.spent}</b><span>{L.rwSpent}</span></div>
        <div className={rwStats.waiting ? 'is-waiting' : ''}><b dir="ltr">{rwStats.waiting}</b><span>{L.rwWaiting}</span></div>
      </div>
      <div className="rw-tools">
        <div className="rw-filter" role="group">
          {[['all', L.rwAll], ['wait', L.rwWait], ['done', L.rwDone]].map(([k, label]) => (
            <button key={k} type="button" aria-pressed={rwFilter === k} className={rwFilter === k ? 'on' : ''} onClick={() => setRwFilter(k)}>{label}</button>
          ))}
        </div>
        <input type="search" placeholder={L.rwSearch} aria-label={L.rwSearch} value={rwSearch} onChange={(e) => setRwSearch(e.target.value)} />
      </div>
      {rwList.length === 0 ? <p className="staff-note">{L.rwNone}</p> : (
        <ul className="staff-done rw-history">
          {rwList.map((r) => (
            <li key={r.id} className={r.status === 'issued' ? 'is-waiting' : ''}>
              <div className="rh-main">
                <b>{tierName(r)}</b>
                <span>{r.customer?.name || '—'} · <span dir="ltr">{r.code}</span>{r.points ? <> · <span dir="ltr">−{r.points}</span></> : null}</span>
              </div>
              <div className="rh-side">
                <span className="rh-date">{day(r.created_at, lang)} · {time(r.created_at)}</span>
                {r.status === 'used'
                  ? <span className="rh-badge done">{L.rwGivenAt(`${day(r.used_at, lang)} ${time(r.used_at)}`)}</span>
                  : <button type="button" className="btn-redeem" disabled={busy === `rw${r.id}`} onClick={() => giveNow(r)}>{L.rwGiveNow}</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )

  // feedback tab
  const unseen = (feedback || []).filter((f) => !f.seen).length
  const month = (feedback || []).filter((f) => Date.parse(f.created_at) > Date.now() - 30 * 86400000)
  const avg = month.length ? (month.reduce((a, f) => a + f.rating, 0) / month.length).toFixed(1) : null
  const list = (feedback || []).filter((f) => showRead || !f.seen)
  const topicName = (id) => (lang === 'ar' ? FEEDBACK_TOPICS.find((t) => t.id === id)?.ar || id : id)
  const feedbackView = feedback === null ? <p className="staff-note">{L.loading}</p> : (
    <>
      {avg && <p className="fb-avg"><Star size={20} aria-hidden="true" /> {L.fbAvg(avg, month.length)}</p>}
      <label className="fb-showread"><input type="checkbox" checked={showRead} onChange={(e) => setShowRead(e.target.checked)} /> {L.showRead}</label>
      {list.length === 0 ? <p className="staff-note">{L.fbNone}</p> : (
        <ul className="staff-orders">
          {list.map((f) => (
            <li key={f.id} className={`staff-order fb-item r${f.rating}${f.seen ? ' seen' : ''}`}>
              <div className="so-top">
                <span className="fb-stars-sm" aria-label={`${f.rating}/5`}>{'★'.repeat(f.rating)}<span>{'★'.repeat(5 - f.rating)}</span></span>
                <span>{day(f.created_at, lang)} · {time(f.created_at)}</span>
                {f.order_id && <span className="so-type">{L.order} <span dir="ltr">#{f.order_id}</span></span>}
              </div>
              {f.topics?.length > 0 && <div className="fb-tags">{f.topics.map((t) => <span key={t}>{topicName(t)}</span>)}</div>}
              {f.comment && <p className="fb-comment" dir="auto">{f.comment}</p>}
              {(f.name || f.contact || f.user_id) && (
                <p className="so-line">
                  {f.name}
                  {f.contact && <> · <a href={/@/.test(f.contact) ? `mailto:${f.contact}` : `https://wa.me/${f.contact.replace(/\D/g, '').replace(/^0/, '961')}`} target="_blank" rel="noreferrer" dir="ltr">{f.contact}</a></>}
                  {f.user_id && <span className="so-member">★ {L.member}</span>}
                </p>
              )}
              <div className="so-actions"><button className="btn-reset" onClick={() => toggleSeen(f)}>{f.seen ? L.markUnread : <><Check size={18} aria-hidden="true" /> {L.markRead}</>}</button></div>
            </li>
          ))}
        </ul>
      )}
    </>
  )

  let body
  if (rw.status === 'offline') body = <p className="staff-note">{L.offline}</p>
  else if (rw.status === 'loading') body = <p className="staff-note">{L.loading}</p>
  else if (!rw.account) body = (
    <div className="staff-note">
      <p>{L.signIn}</p>
      <button className="btn-primary" onClick={rw.openRewards}>{L.signInBtn}</button>
    </div>
  )
  else if (!isStaff) body = <p className="staff-note">{L.notStaff}</p>
  else body = (
    <>
      {msg && <p className={`staff-msg ${msg.ok ? 'ok' : 'bad'}`} role="status">{msg.text}</p>}

      <section className="staff-code staff-member" aria-labelledby="sm-title">
        <h2 id="sm-title" className="sm-title">{L.cardTitle}</h2>
        {!member ? (
          <div className="sm-find">
            <button type="button" className="btn-primary sm-scan" onClick={() => setScanning(true)}><ScanLine size={20} aria-hidden="true" /> {L.scan}</button>
            <form className="sm-type" onSubmit={(e) => { e.preventDefault(); findCard(cardInput) }}>
              <input dir="ltr" autoCapitalize="characters" autoComplete="off" placeholder={L.cardPh} aria-label={L.cardPh}
                value={cardInput} onChange={(e) => setCardInput(e.target.value.toUpperCase())} />
              <button className="btn-ghost" disabled={busy === 'card' || !cardInput.trim()}>{L.find}</button>
            </form>
          </div>
        ) : (
          <form className="sm-member" onSubmit={addPurchase}>
            <div className="sm-who">
              <p className="sm-name">{member.name || '—'}</p>
              <p className="sm-meta"><span dir="ltr">{prettyCode(member.card_code)}</span> · {L.memberPts(member.points)}</p>
              {member.birthday_ready && <p className="sm-bday"><Cake size={18} aria-hidden="true" /> {L.bdayReady}</p>}
            </div>
            <label className="sm-amount">{L.purchase}
              <span>
                <input type="number" min="0" step="0.5" inputMode="decimal" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} />
                {Number(amount) > 0 && <b>{L.willGet(Math.floor(Number(amount)) * rw.settings.ppd)}</b>}
              </span>
            </label>
            <div className="so-actions">
              <button className="btn-primary" disabled={busy === 'card' || !(Number(amount) > 0)}><Check size={18} aria-hidden="true" /> {L.addPts}</button>
              <button type="button" className="btn-reset" onClick={() => { setMember(null); setAmount('') }}>{L.clear}</button>
            </div>
          </form>
        )}
      </section>
      {scanning && <CardScanner lang={lang} onCode={findCard} onClose={() => setScanning(false)} />}

      <form className="staff-code" onSubmit={checkCode}>
        <label htmlFor="staff-code">{L.codeTitle}</label>
        <div>
          <input id="staff-code" dir="ltr" autoCapitalize="characters" autoComplete="off" placeholder={L.codePh}
            value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <button className="btn-primary" disabled={busy === 'code' || !code.trim()}>{L.check}</button>
        </div>
      </form>

      <div className="staff-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'orders'} className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>
          {L.tabOrders} {orders?.length > 0 && <span className="drawer-count">{orders.length}</span>}
        </button>
        <button role="tab" aria-selected={tab === 'rewards'} className={tab === 'rewards' ? 'on' : ''} onClick={() => setTab('rewards')}>
          {L.tabRewards} {rwStats.waiting > 0 && <span className="drawer-count">{rwStats.waiting}</span>}
        </button>
        <button role="tab" aria-selected={tab === 'feedback'} className={tab === 'feedback' ? 'on' : ''} onClick={() => setTab('feedback')}>
          {L.tabFeedback} {unseen > 0 && <span className="drawer-count">{unseen}</span>}
        </button>
      </div>

      {tab === 'feedback' ? feedbackView : tab === 'rewards' ? rewardsView : (<>
      <div className="staff-head">
        <h2>{L.pending} {orders && <span className="drawer-count">{orders.length}</span>}</h2>
        <button className="btn-ghost" onClick={load}><RefreshCw size={16} aria-hidden="true" /> {L.refresh}</button>
      </div>

      {orders === null ? <p className="staff-note">{L.loading}</p>
        : orders.length === 0 ? <p className="staff-note">{L.none}</p>
          : (
            <ul className="staff-orders">
              {orders.map((o) => (
                <li key={o.id} className="staff-order">
                  <div className="so-top">
                    <b dir="ltr">#{o.id}</b>
                    <span>{time(o.created_at)}</span>
                    <span className="so-type">{o.order_type === 'delivery' ? L.delivery : L.pickup}{o.pickup_time ? ` · ${o.pickup_time}` : ''}</span>
                  </div>
                  <p className="so-name">
                    {o.customer_name}
                    {o.phone && <a href={`tel:${o.phone}`} dir="ltr"> {o.phone}</a>}
                    {o.user_id && <span className="so-member">★ {L.member}</span>}
                  </p>
                  {o.address && <p className="so-line">{o.address}</p>}
                  <ul className="so-items">
                    {(o.items || []).map((i, k) => (
                      <li key={k}>
                        <span>{i.qty} × {i.name}{i.details && <small> · {i.details}</small>}</span>
                        <span dir="ltr">{i.price != null ? formatPrice(i.price) : '—'}</span>
                      </li>
                    ))}
                  </ul>
                  {o.notes && <p className="so-line so-notes">“{o.notes}”</p>}
                  {o.total != null ? (
                    <p className="so-total"><span dir="ltr">{formatPrice(Number(o.total))}</span></p>
                  ) : (
                    <label className="so-nototal">{L.noTotal}
                      <input type="number" min="0" step="0.5" inputMode="decimal" placeholder={L.totalPh}
                        value={totals[o.id] || ''} onChange={(e) => setTotals({ ...totals, [o.id]: e.target.value })} />
                    </label>
                  )}
                  <div className="so-actions">
                    <button className="btn-primary" disabled={busy === o.id} onClick={() => act(o, 'confirm')}><Check size={18} aria-hidden="true" /> {L.confirm}</button>
                    <button className="btn-reset" disabled={busy === o.id} onClick={() => act(o, 'cancel')}><X size={18} aria-hidden="true" /> {L.cancel}</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

      {done.length > 0 && (
        <>
          <h2 className="staff-sub">{L.recent}</h2>
          <ul className="staff-done">
            {done.map((o) => (
              <li key={o.id}>
                <b dir="ltr">#{o.id}</b> {o.customer_name}
                <span>{o.order_type === 'instore' ? L.inStore : o.status === 'confirmed' ? L.statusConfirmed : L.statusCancelled}{o.points ? ` · +${o.points}` : ''}</span>
                <span dir="ltr">{o.total != null ? formatPrice(Number(o.total)) : ''} {time(o.confirmed_at)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      </>)}
    </>
  )

  return (
    <div className="subpage">
      <header className="subpage-bar">
        <a href="#" className="subpage-logo" aria-label={L.back}><Logo /></a>
        <h1 className="subpage-title">{L.title}</h1>
        {rw.account?.isOwner && <a className="link-btn ed-staff-link" href="#editor">{lang === 'ar' ? 'تعديل الموقع' : 'Edit website'}</a>}
        <button className="lang-button" onClick={toggle}>{L.lang}</button>
      </header>
      <main className="subpage-main">
        {body}
        <a className="link-btn subpage-back" href="#">{L.back}</a>
      </main>
    </div>
  )
}
