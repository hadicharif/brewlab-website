import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRewards } from '../RewardsContext'
import { useContent } from '../ContentContext'
import { useLang } from '../i18n'
import Logo from './Logo'
import { T } from './editor/strings'
import MenuTab from './editor/MenuTab'
import AddonsTab from './editor/AddonsTab'
import ShopTab from './editor/ShopTab'
import PromosTab from './editor/PromosTab'
import RewardsTab from './editor/RewardsTab'
import StaffTab from './editor/StaffTab'
import HistoryTab from './editor/HistoryTab'
import CustomersTab from './editor/CustomersTab'

const TABS = ['menu', 'addons', 'shop', 'promos', 'rewards', 'customers', 'staff', 'history']
const SOCIAL_TABS = ['promos']   // social media: promos only

// Owners' editor: change the website without touching code (#editor)
export default function EditorPage() {
  const { lang, toggle } = useLang()
  const L = T[lang]
  const rw = useRewards()
  const { content, setLive, reload } = useContent()
  const [wantTab, setTab] = useState(() => new URLSearchParams(window.location.hash.split('?')[1]).get('tab'))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [stamp, setStamp] = useState(0)   // bumps after each save (fresh forms, fresh history)
  const timer = useRef(null)
  const latest = useRef(content)        // newest content, even between quick saves
  latest.current = content

  const isOwner = rw.account?.isOwner
  const canEdit = isOwner || rw.account?.isSocial
  const tabs = isOwner ? TABS : SOCIAL_TABS
  const tab = tabs.includes(wantTab) ? wantTab : tabs[0]

  // start from what's really in the database
  useEffect(() => {
    if (!canEdit) return
    reload().then((fresh) => { if (fresh && JSON.stringify(fresh) !== JSON.stringify(content)) setLive(fresh) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit])

  const notify = (m) => {
    setMsg(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), m.ok ? 3500 : 9000)
  }
  useEffect(() => () => clearTimeout(timer.current), [])

  // save one part of the website; returns true when it worked
  const save = async (key, value, summary) => {
    setSaving(true)
    const { error } = await supabase.rpc('owner_save', { p_key: key, p_value: value, p_summary: summary })
    setSaving(false)
    if (error) { notify({ ok: false, text: L.failed + error.message }); return false }
    const next = { ...latest.current, [key]: value }
    latest.current = next
    setLive(next)
    setStamp((s) => s + 1)
    notify({ ok: true, text: L.saved })
    return true
  }

  // keep the chosen tab visible in the scrolling tab row
  useEffect(() => {
    document.querySelector('.ed-tabs button.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [tab, canEdit, lang])

  const pickTab = (t) => {
    setTab(t)
    history.replaceState(null, '', `#editor?tab=${t}`)
  }

  let body
  if (rw.status === 'offline') body = <p className="staff-note">{L.offline}</p>
  else if (rw.status === 'loading') body = <p className="staff-note">{L.loading}</p>
  else if (!rw.account) body = (
    <div className="staff-note">
      <p>{L.signIn}</p>
      <button className="btn-primary" onClick={rw.openRewards}>{L.signInBtn}</button>
    </div>
  )
  else if (!canEdit) body = <p className="staff-note">{L.notOwner}</p>
  else {
    const props = { content, save, saving, setSaving, notify, L, lang }
    body = (
      <>
        {!isOwner && <p className="ed-intro ed-role-note">{L.socialNote}</p>}
        <nav className="ed-tabs" aria-label={L.title}>
          {tabs.map((t) => (
            <button key={t} type="button" className={tab === t ? 'on' : ''} aria-current={tab === t ? 'page' : undefined} onClick={() => pickTab(t)}>
              {L.tabs[t]}
            </button>
          ))}
        </nav>
        {tab === 'menu' && <MenuTab {...props} />}
        {tab === 'addons' && <AddonsTab key={stamp} {...props} />}
        {tab === 'shop' && <ShopTab key={stamp} {...props} />}
        {tab === 'promos' && <PromosTab key={stamp} {...props} />}
        {tab === 'rewards' && <RewardsTab {...props} />}
        {tab === 'customers' && <CustomersTab {...props} />}
        {tab === 'staff' && <StaffTab {...props} me={rw.account.email} />}
        {tab === 'history' && <HistoryTab {...props} stamp={stamp} />}
      </>
    )
  }

  return (
    <div className="subpage editor">
      <header className="subpage-bar">
        <a href="#" className="subpage-logo" aria-label={L.back}><Logo /></a>
        <h1 className="subpage-title">{L.title}</h1>
        {rw.account?.isStaff && <a className="link-btn ed-staff-link" href="#staff">{L.staffPage}</a>}
        <button className="lang-button" onClick={toggle}>{L.lang}</button>
      </header>
      <main className="subpage-main ed-main">
        {body}
        <a className="link-btn subpage-back" href="#">{L.back}</a>
      </main>
      {msg && <p className={`ed-toast ${msg.ok ? 'ok' : 'bad'}`} role="status">{msg.text}</p>}
    </div>
  )
}
