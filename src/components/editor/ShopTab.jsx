import { useState } from 'react'
import { DEFAULTS } from '../../data/content'
import { fmtHour, todayBeirut } from '../../hours'
import { Field, SaveBar } from './shared'

export default function ShopTab({ content, save, saving, L, lang }) {
  const cur = { ...DEFAULTS.shop, ...(content.shop || {}) }
  const start = { open: cur.open, close: cur.close, whatsapp: cur.whatsapp, instagram: cur.instagram }
  const [f, setF] = useState(start)
  const dirty = JSON.stringify(f) !== JSON.stringify(start)
  const closed = cur.closedOn === todayBeirut()
  const waOk = /^\d{8,15}$/.test(f.whatsapp)
  const igOk = /^https:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/.test(f.instagram)
  const hoursOk = f.open !== f.close % 24

  const toggleClosed = () =>
    save('shop', { ...cur, closedOn: closed ? null : todayBeirut() }, closed ? 'Open again today' : `Closed today (${todayBeirut()})`)

  const onSave = async () => {
    if (!waOk || !igOk || !hoursOk) return
    const ch = []
    if (f.open !== start.open || f.close !== start.close) ch.push(`hours ${fmtHour(f.open)} to ${fmtHour(f.close)}`)
    if (f.whatsapp !== start.whatsapp) ch.push(`WhatsApp +${f.whatsapp}`)
    if (f.instagram !== start.instagram) ch.push(`Instagram ${f.instagram}`)
    await save('shop', { ...cur, ...f }, `Shop: ${ch.join(', ')}`)
  }

  return (
    <div className="ed-panel">
      <section className={`ed-today${closed ? ' closed' : ''}`}>
        <div>
          <h3 className="ed-h">{L.closedTitle}: {closed ? L.closedToday : L.openToday}</h3>
          <p>{closed ? L.closedOnHint : L.openHint}</p>
        </div>
        <button type="button" className={closed ? 'btn-primary' : 'btn-ghost ed-danger-btn'} onClick={toggleClosed} disabled={saving}>
          {closed ? L.openToday : L.closedToday}
        </button>
      </section>

      <h3 className="ed-h">{L.hours}</h3>
      <div className="ed-grid">
        <Field label={L.opens} htmlFor="sh-open">
          <select id="sh-open" value={f.open} onChange={(e) => setF((p) => ({ ...p, open: Number(e.target.value) }))}>
            {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{fmtHour(h, lang)}</option>)}
          </select>
        </Field>
        <Field label={L.closes} htmlFor="sh-close">
          <select id="sh-close" value={f.close} onChange={(e) => setF((p) => ({ ...p, close: Number(e.target.value) }))}>
            {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>{fmtHour(h, lang)}{h !== 24 && h <= f.open ? ` ${L.nextDay}` : ''}</option>
            ))}
          </select>
        </Field>
      </div>
      {!hoursOk && <p className="ed-err">{L.sameHours}</p>}

      <h3 className="ed-h">{L.contact}</h3>
      <div className="ed-grid">
        <Field label={L.whatsapp} htmlFor="sh-wa" hint={L.waHint}>
          <span className="ed-money" dir="ltr">
            <span aria-hidden="true">+</span>
            <input id="sh-wa" inputMode="numeric" value={f.whatsapp} aria-invalid={!waOk || undefined}
              onChange={(e) => setF((p) => ({ ...p, whatsapp: e.target.value.replace(/\D/g, '') }))} />
          </span>
          {!waOk && <small className="ed-err">{L.badWa}</small>}
        </Field>
        <Field label={L.instagram} htmlFor="sh-ig" hint={L.igHint}>
          <input id="sh-ig" type="url" dir="ltr" value={f.instagram} aria-invalid={!igOk || undefined}
            onChange={(e) => setF((p) => ({ ...p, instagram: e.target.value.trim().split('?')[0] }))} />
          {!igOk && <small className="ed-err">{L.badIg}</small>}
        </Field>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={() => setF(start)} L={L} />
    </div>
  )
}
