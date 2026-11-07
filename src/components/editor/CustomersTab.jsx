import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, MessageCircle, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { prettyPhone } from '../../lib/phone'

const day = (ts, lang) => (ts ? new Date(ts).toLocaleDateString(lang === 'ar' ? 'ar-LB' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Beirut' }) : '—')

export default function CustomersTab({ L, lang, notify }) {
  const [rows, setRows] = useState(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')   // all | phone | offers

  useEffect(() => {
    supabase.rpc('owner_list_customers').then(({ data, error }) => {
      if (error) notify({ ok: false, text: L.failed + error.message })
      setRows(data || [])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const shown = useMemo(() => {
    if (!rows) return []
    const term = q.trim().toLowerCase().replace(/\s/g, '')
    return rows.filter((r) =>
      (filter === 'all' || (filter === 'phone' ? !!r.phone : r.whatsapp_offers && !!r.phone)) &&
      (!term || `${r.name || ''}${r.email || ''}${r.phone || ''}`.toLowerCase().replace(/\s/g, '').includes(term)))
  }, [rows, q, filter])

  if (!rows) return <p className="ed-intro">{L.loading}</p>

  const withPhone = rows.filter((r) => r.phone).length
  const offers = rows.filter((r) => r.phone && r.whatsapp_offers).length

  const copyNumbers = async () => {
    const list = shown.filter((r) => r.phone).map((r) => prettyPhone(r.phone)).join('\n')
    try { await navigator.clipboard.writeText(list); notify({ ok: true, text: L.copied(shown.filter((r) => r.phone).length) }) }
    catch { notify({ ok: false, text: L.copyFailed }) }
  }

  const download = () => {
    // Excel would read text starting with = + - @ as a formula, so those get a leading '
    const esc = (v) => { const t = String(v ?? ''); return `"${(/^[=+\-@]/.test(t) ? `'${t}` : t).replace(/"/g, '""')}"` }
    const head = ['Name', 'Phone', 'Email', 'Points', 'Orders', 'WhatsApp offers', 'Joined', 'Last visit', 'Signed in with']
    const lines = shown.map((r) => [
      r.name, r.phone ? prettyPhone(r.phone).slice(1) : '', r.email, r.points, r.orders, r.whatsapp_offers ? 'Yes' : 'No',
      r.joined?.slice(0, 10), r.last_sign_in?.slice(0, 10), r.signed_in_with,
    ].map(esc).join(','))
    const blob = new Blob(['﻿' + [head.map(esc).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `brewlab-customers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }

  return (
    <div className="ed-panel">
      <p className="ed-cust-stats">
        <span><b>{rows.length}</b> {L.members}</span>
        <span><b>{withPhone}</b> {L.withPhone}</span>
        <span><b>{offers}</b> {L.agreedOffers}</span>
      </p>
      <p className="ed-intro">{L.customersHint}</p>

      <div className="ed-toolbar">
        <div className="ed-chips" role="group" aria-label={L.show}>
          {[['all', L.all], ['phone', L.withPhoneShort], ['offers', L.offersShort]].map(([id, label]) => (
            <button key={id} type="button" className={filter === id ? 'on' : ''} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>
        <label className="ed-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">{L.searchPeople}</span>
          <input type="search" value={q} placeholder={L.searchPeople} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      <div className="ed-btnrow">
        <button type="button" className="btn-ghost" onClick={copyNumbers} disabled={!shown.some((r) => r.phone)}><Copy size={16} aria-hidden="true" /> {L.copyNumbers}</button>
        <button type="button" className="btn-ghost" onClick={download} disabled={!shown.length}><Download size={16} aria-hidden="true" /> {L.downloadCsv}</button>
      </div>

      {!shown.length ? <p className="ed-intro">{L.nobody}</p> : (
        <ul className="ed-cust">
          {shown.map((r) => (
            <li key={r.id}>
              <div className="ed-cust-main">
                <b>{r.name || '—'}</b>
                {r.whatsapp_offers && r.phone && <small className="ed-badge new">{L.offersShort}</small>}
                <small className="ed-cust-email" dir="ltr">{r.email}</small>
              </div>
              <div className="ed-cust-phone">
                {r.phone ? (
                  <a href={`https://wa.me/${r.phone}`} target="_blank" rel="noreferrer" dir="ltr">
                    <MessageCircle size={15} aria-hidden="true" /> {prettyPhone(r.phone)}
                  </a>
                ) : <span className="ed-muted">{L.noPhone}</span>}
              </div>
              <div className="ed-cust-meta">
                <span><b dir="ltr">{r.points}</b> {L.pts}</span>
                <span><b dir="ltr">{r.orders}</b> {L.ordersWord}</span>
                <span>{L.joined} {day(r.joined, lang)}</span>
                <span>{L.lastVisit} {day(r.last_sign_in, lang)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
