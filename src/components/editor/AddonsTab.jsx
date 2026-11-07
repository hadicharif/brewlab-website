import { useState } from 'react'
import { FLAVOURS } from '../../data/menu'
import { milks } from '../../data/drinkLab'
import { DEFAULTS } from '../../data/content'
import { WORDS } from '../../i18n'
import { Field, MoneyInput, SaveBar, money, parseMoney } from './shared'

const KEYS = ['flavour', 'shot', 'cream', 'decaf', 'large']
const MILKS = milks.filter((m) => m.id !== 'regular')

const toForm = (a) => ({
  ...Object.fromEntries(KEYS.map((k) => [k, String(a?.[k] ?? DEFAULTS.addons[k])])),
  milk: Object.fromEntries(MILKS.map((m) => [m.id, String(a?.milk?.[m.id] ?? DEFAULTS.addons.milk[m.id])])),
  free: [...(a?.free ?? DEFAULTS.addons.free)],
})

export default function AddonsTab({ content, save, saving, L, lang }) {
  const start = toForm(content.addons)
  const [f, setF] = useState(start)
  const dirty = JSON.stringify(f) !== JSON.stringify(start)
  const label = (s) => (lang === 'ar' ? WORDS[s] || s : s)
  const bad = (v) => { const n = parseMoney(v); return n === null || Number.isNaN(n) }

  const onSave = async () => {
    const all = [...KEYS.map((k) => f[k]), ...MILKS.map((m) => f.milk[m.id])]
    if (all.some(bad)) return
    const value = {
      ...Object.fromEntries(KEYS.map((k) => [k, parseMoney(f[k])])),
      milk: Object.fromEntries(MILKS.map((m) => [m.id, parseMoney(f.milk[m.id])])),
      free: f.free,
    }
    const names = { flavour: 'Flavour', shot: 'Extra shot', cream: 'Cream', decaf: 'Decaf', large: 'Large size' }
    const ch = []
    KEYS.forEach((k) => { if (parseMoney(start[k]) !== value[k]) ch.push(`${names[k]} ${money(parseMoney(start[k]))} → ${money(value[k])}`) })
    MILKS.forEach((m) => { if (parseMoney(start.milk[m.id]) !== value.milk[m.id]) ch.push(`${m.name} ${money(parseMoney(start.milk[m.id]))} → ${money(value.milk[m.id])}`) })
    if (start.free.join() !== f.free.join()) ch.push(`free flavours: ${f.free.join(', ') || 'none'}`)
    await save('addons', value, `Add-ons: ${ch.join(', ')}`)
  }

  return (
    <div className="ed-panel">
      <p className="ed-intro">{L.addonsIntro}</p>
      <div className="ed-grid">
        {KEYS.map((k) => (
          <Field key={k} label={L[k]} htmlFor={`ad-${k}`}>
            <MoneyInput id={`ad-${k}`} value={f[k]} invalid={bad(f[k])} onChange={(v) => setF((p) => ({ ...p, [k]: v }))} />
          </Field>
        ))}
      </div>

      <h3 className="ed-h">{L.milks}</h3>
      <div className="ed-grid">
        {MILKS.map((m) => (
          <Field key={m.id} label={label(m.name)} htmlFor={`ad-m-${m.id}`}>
            <MoneyInput id={`ad-m-${m.id}`} value={f.milk[m.id]} invalid={bad(f.milk[m.id])}
              onChange={(v) => setF((p) => ({ ...p, milk: { ...p.milk, [m.id]: v } }))} />
          </Field>
        ))}
      </div>

      <h3 className="ed-h">{L.freeFlavours}</h3>
      <div className="ed-checks">
        {FLAVOURS.map((fl) => (
          <label key={fl} className={`ed-check${f.free.includes(fl) ? ' on' : ''}`}>
            <input type="checkbox" checked={f.free.includes(fl)}
              onChange={(e) => setF((p) => ({ ...p, free: e.target.checked ? [...p.free, fl] : p.free.filter((x) => x !== fl) }))} />
            {label(fl)}
          </label>
        ))}
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={() => setF(start)} L={L} />
    </div>
  )
}
