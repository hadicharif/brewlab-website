import { useState } from 'react'
import { Plus } from 'lucide-react'
import { menu, sections } from '../../data/menu'
import { DEFAULTS, promoLink } from '../../data/content'
import { oneTap } from '../BestSellers'
import { NAMES, WORDS } from '../../i18n'
import { Field, RowTools, SaveBar, moveIn } from './shared'

const DRINK_SECTIONS = ['hot', 'cold', 'frappe', 'milkshakes', 'smoothies', 'refreshers', 'beverages']
const DESSERT_SECTIONS = ['dessert', 'crepe']
const blank = () => ({ en: '', ar: '' })

const cardsOf = (c) => (Array.isArray(c.promos) ? c.promos : DEFAULTS.promos.map((p) => ({
  id: p.id, tone: p.tone, tag: p.tag, title: p.title, body: p.body, cta: p.cta, link: promoLink(p),
})))
const startOf = (c) => ({
  announcements: Array.isArray(c.announcements) ? c.announcements : DEFAULTS.announcements,
  promos: cardsOf(c),
  bestsellers: c.bestsellers || DEFAULTS.bestsellers,
})

// Two inputs side by side: English and Arabic
function Pair({ id, label, value, onChange, L, area }) {
  const Tag = area ? 'textarea' : 'input'
  return (
    <div className="ed-pair">
      <Field label={label ? `${label} · ${L.en}` : L.en} htmlFor={`${id}-en`}>
        <Tag id={`${id}-en`} dir="ltr" rows={area ? 2 : undefined} value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
      </Field>
      <Field label={label ? `${label} · ${L.ar}` : L.ar} htmlFor={`${id}-ar`}>
        <Tag id={`${id}-ar`} dir="rtl" rows={area ? 2 : undefined} value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} />
      </Field>
    </div>
  )
}

export default function PromosTab({ content, save, saving, L, lang }) {
  const start = startOf(content)
  const [f, setF] = useState(start)
  const [err, setErr] = useState(null)
  const changed = (k) => JSON.stringify(f[k]) !== JSON.stringify(start[k])
  const dirty = ['announcements', 'promos', 'bestsellers'].some(changed)
  const nm = (it) => (lang === 'ar' ? NAMES[it.id] || it.name : it.name)
  const secName = (s) => (lang === 'ar' ? WORDS[sections[s].label] || sections[s].label : sections[s].label)
  const setList = (k, fn) => setF((p) => ({ ...p, [k]: fn(p[k]) }))
  const setCard = (i, patch) => setList('promos', (cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const pickable = (secs) => menu.filter((it) => secs.includes(it.section) && !it.hidden && oneTap(it))

  const onSave = async () => {
    if (f.promos.some((c) => !c.title.en.trim())) { setErr(L.needTitle); return }
    setErr(null)
    if (changed('announcements')) {
      const list = f.announcements.filter((a) => a.en.trim() || a.ar.trim()).map((a) => ({ en: a.en.trim() || a.ar.trim(), ar: a.ar.trim() || a.en.trim() }))
      if (!(await save('announcements', list, `Announcements: ${list.length} message${list.length === 1 ? '' : 's'}`))) return
    }
    if (changed('promos')) {
      if (!(await save('promos', f.promos, `Promo cards: ${f.promos.map((c) => c.title.en).join(' | ') || 'none'}`))) return
    }
    if (changed('bestsellers')) {
      const names = [...f.bestsellers.drinks, ...f.bestsellers.desserts].map((id) => menu.find((m) => m.id === id)?.name).filter(Boolean)
      await save('bestsellers', f.bestsellers, `Best sellers: ${names.join(', ') || 'none'}`)
    }
  }

  const toggleBest = (kind, id) => setF((p) => {
    const list = p.bestsellers[kind]
    return { ...p, bestsellers: { ...p.bestsellers, [kind]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } }
  })

  return (
    <div className="ed-panel">
      {/* announcements */}
      <h3 className="ed-h">{L.announce}</h3>
      <p className="ed-intro">{L.announceHint}</p>
      <ul className="ed-list">
        {f.announcements.map((a, i) => (
          <li key={i} className="ed-card">
            <div className="ed-card-head"><b>#{i + 1}</b>
              <RowTools i={i} n={f.announcements.length} L={L}
                onMove={(i2, d) => setList('announcements', (l) => moveIn(l, i2, d))}
                onRemove={(i2) => setList('announcements', (l) => l.filter((_, j) => j !== i2))} />
            </div>
            <Pair id={`an-${i}`} label="" value={a} L={L} area onChange={(v) => setList('announcements', (l) => l.map((x, j) => (j === i ? v : x)))} />
          </li>
        ))}
      </ul>
      <button type="button" className="ed-additem" onClick={() => setList('announcements', (l) => [...l, blank()])}><Plus size={16} /> {L.addAnnounce}</button>

      {/* promo cards */}
      <h3 className="ed-h">{L.cards}</h3>
      <p className="ed-intro">{L.cardsHint}</p>
      <ul className="ed-list">
        {f.promos.map((c, i) => (
          <li key={c.id} className={`ed-card tone-${c.tone}`}>
            <div className="ed-card-head"><b>{c.title.en || `#${i + 1}`}</b>
              <RowTools i={i} n={f.promos.length} L={L}
                onMove={(i2, d) => setList('promos', (l) => moveIn(l, i2, d))}
                onRemove={(i2) => setList('promos', (l) => l.filter((_, j) => j !== i2))} />
            </div>
            <Pair id={`pc-${i}-tag`} label={L.tag} value={c.tag} L={L} onChange={(v) => setCard(i, { tag: v })} />
            <Pair id={`pc-${i}-title`} label={L.ctitle} value={c.title} L={L} onChange={(v) => setCard(i, { title: v })} />
            <Pair id={`pc-${i}-body`} label={L.body} value={c.body} L={L} area onChange={(v) => setCard(i, { body: v })} />
            <Pair id={`pc-${i}-cta`} label={L.cta} value={c.cta} L={L} onChange={(v) => setCard(i, { cta: v })} />
            <div className="ed-grid">
              <Field label={L.opensTo} htmlFor={`pc-${i}-link`}>
                <select id={`pc-${i}-link`} value={c.link} onChange={(e) => setCard(i, { link: e.target.value })}>
                  <option value="lab">{L.builder}</option>
                  <optgroup label={L.sectionOpt}>
                    {Object.keys(sections).map((s) => <option key={s} value={`section:${s}`}>{secName(s)}</option>)}
                  </optgroup>
                  <optgroup label={L.itemOpt}>
                    {menu.filter((it) => !it.hidden).map((it) => <option key={it.id} value={`item:${it.id}`}>{nm(it)}</option>)}
                  </optgroup>
                </select>
              </Field>
              <Field label={L.colour} htmlFor={`pc-${i}-tone`}>
                <select id={`pc-${i}-tone`} value={c.tone} onChange={(e) => setCard(i, { tone: e.target.value })}>
                  {['peach', 'white', 'charcoal'].map((t) => <option key={t} value={t}>{L.tones[t]}</option>)}
                </select>
              </Field>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="ed-additem" onClick={() => setList('promos', (l) => [...l, { id: `p-${Date.now().toString(36)}`, tone: 'peach', tag: blank(), title: blank(), body: blank(), cta: { en: 'Order now', ar: 'اطلب الآن' }, link: 'lab' }])}>
        <Plus size={16} /> {L.addCard}
      </button>

      {/* best sellers */}
      <h3 className="ed-h">{L.best}</h3>
      <p className="ed-intro">{L.bestHint}</p>
      {[['drinks', DRINK_SECTIONS, L.drinks], ['desserts', DESSERT_SECTIONS, L.desserts]].map(([kind, secs, title]) => (
        <fieldset key={kind} className="ed-fieldset">
          <legend>{title}</legend>
          <div className="ed-checks">
            {pickable(secs).map((it) => {
              const on = f.bestsellers[kind].includes(it.id)
              return (
                <label key={it.id} className={`ed-check${on ? ' on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleBest(kind, it.id)} />
                  {nm(it)}
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}

      {err && <p className="ed-err" role="alert">{err}</p>}
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={() => { setF(start); setErr(null) }} L={L} />
    </div>
  )
}
