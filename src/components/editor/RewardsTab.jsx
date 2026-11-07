import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Field, RowTools, SaveBar, moveIn } from './shared'

const intOk = (v, min, max) => /^\d+$/.test(String(v).trim()) && +v >= min && +v <= max

export default function RewardsTab({ saving, setSaving, notify, L }) {
  const [start, setStart] = useState(null)
  const [f, setF] = useState(null)

  const load = async () => {
    const [{ data: s }, { data: t }] = await Promise.all([
      supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('reward_tiers').select('*').eq('active', true).order('sort'),
    ])
    const v = {
      ppd: String(s?.points_per_dollar ?? 10), welcome: String(s?.welcome_points ?? 50), window: String(s?.birthday_window_days ?? 3),
      tiers: (t || []).map((x) => ({ id: x.id, points: String(x.points), name_en: x.name_en, name_ar: x.name_ar })),
    }
    setStart(v); setF(v)
  }
  useEffect(() => { load() }, [])

  if (!f) return <p className="ed-intro">{L.loading}</p>
  const dirty = JSON.stringify(f) !== JSON.stringify(start)
  const valid = intOk(f.ppd, 1, 1000) && intOk(f.welcome, 0, 100000) && intOk(f.window, 0, 31) &&
    f.tiers.every((t) => t.name_en.trim() && intOk(t.points, 1, 1000000))
  const setTier = (i, patch) => setF((p) => ({ ...p, tiers: p.tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)) }))

  const onSave = async () => {
    if (!valid) return
    const ch = []
    if (f.ppd !== start.ppd) ch.push(`points per $1 ${start.ppd} → ${f.ppd}`)
    if (f.welcome !== start.welcome) ch.push(`welcome ${start.welcome} → ${f.welcome}`)
    if (f.window !== start.window) ch.push(`birthday days ${start.window} → ${f.window}`)
    if (JSON.stringify(f.tiers) !== JSON.stringify(start.tiers)) ch.push(`rewards: ${f.tiers.map((t) => `${t.name_en} ${t.points}`).join(', ') || 'none'}`)
    setSaving(true)
    const { error } = await supabase.rpc('owner_save_rewards', {
      p_ppd: +f.ppd, p_welcome: +f.welcome, p_window: +f.window,
      p_tiers: f.tiers.map((t) => ({ ...t, points: +t.points })),
      p_summary: `Rewards: ${ch.join(', ')}`,
    })
    setSaving(false)
    notify(error ? { ok: false, text: L.failed + error.message } : { ok: true, text: L.saved })
    if (!error) setStart(f)
  }

  return (
    <div className="ed-panel">
      <h3 className="ed-h">{L.rules}</h3>
      <div className="ed-grid">
        {[['ppd', L.ppd, 1, 1000], ['welcome', L.welcome, 0, 100000], ['window', L.window, 0, 31]].map(([k, label, min, max]) => (
          <Field key={k} label={label} htmlFor={`rw-${k}`}>
            <input id={`rw-${k}`} inputMode="numeric" dir="ltr" value={f[k]} aria-invalid={!intOk(f[k], min, max) || undefined}
              onChange={(e) => setF((p) => ({ ...p, [k]: e.target.value.replace(/\D/g, '') }))} />
          </Field>
        ))}
      </div>

      <h3 className="ed-h">{L.tiers}</h3>
      <p className="ed-intro">{L.tiersHint}</p>
      <ul className="ed-list">
        {f.tiers.map((t, i) => (
          <li key={t.id} className="ed-card ed-tier">
            <Field label={L.points} htmlFor={`tier-${i}-p`}>
              <input id={`tier-${i}-p`} inputMode="numeric" dir="ltr" value={t.points} aria-invalid={!intOk(t.points, 1, 1000000) || undefined}
                onChange={(e) => setTier(i, { points: e.target.value.replace(/\D/g, '') })} />
            </Field>
            <Field label={`${L.name} · ${L.en}`} htmlFor={`tier-${i}-en`}>
              <input id={`tier-${i}-en`} dir="ltr" value={t.name_en} aria-invalid={!t.name_en.trim() || undefined} onChange={(e) => setTier(i, { name_en: e.target.value })} />
            </Field>
            <Field label={`${L.name} · ${L.ar}`} htmlFor={`tier-${i}-ar`}>
              <input id={`tier-${i}-ar`} dir="rtl" value={t.name_ar} onChange={(e) => setTier(i, { name_ar: e.target.value })} />
            </Field>
            <RowTools i={i} n={f.tiers.length} L={L}
              onMove={(i2, d) => setF((p) => ({ ...p, tiers: moveIn(p.tiers, i2, d) }))}
              onRemove={(i2) => setF((p) => ({ ...p, tiers: p.tiers.filter((_, j) => j !== i2) }))} />
          </li>
        ))}
      </ul>
      <button type="button" className="ed-additem" onClick={() => setF((p) => ({ ...p, tiers: [...p.tiers, { id: `t-${Date.now().toString(36)}`, points: '', name_en: '', name_ar: '' }] }))}>
        <Plus size={16} /> {L.addTier}
      </button>

      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={() => setF(start)} L={L} />
    </div>
  )
}
