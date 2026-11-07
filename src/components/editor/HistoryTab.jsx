import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const when = (ts, lang) => new Date(ts).toLocaleString(lang === 'ar' ? 'ar-LB' : 'en-GB', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Beirut',
})

export default function HistoryTab({ L, lang, stamp }) {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    supabase.from('change_log').select('*').order('at', { ascending: false }).limit(100)
      .then(({ data }) => setRows(data || []))
  }, [stamp])

  if (!rows) return <p className="ed-intro">{L.loading}</p>
  return (
    <div className="ed-panel">
      <p className="ed-intro">{L.historyHint}</p>
      {!rows.length ? <p className="ed-intro">{L.nothing}</p> : (
        <ul className="ed-history">
          {rows.map((r) => (
            <li key={r.id}>
              <span className="ed-hist-meta">
                <span>{when(r.at, lang)}</span>
                <b>{r.who || '—'}</b>
                <span className="ed-badge">{L.areas[r.area] || r.area}</span>
              </span>
              <span className="ed-hist-what" dir="auto">{r.summary}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
