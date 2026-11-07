// Small building blocks shared by the editor tabs
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'

export const money = (n) => (n == null || n === '' ? '—' : `$${Number(n) % 1 ? Number(n).toFixed(2) : Number(n)}`)

// "5.5" → 5.5, "" → null, "abc" → NaN
export const parseMoney = (s) => {
  const t = String(s ?? '').trim().replace(',', '.').replace(/^\$/, '')
  if (t === '') return null
  const n = Number(t)
  return isFinite(n) && n >= 0 && n <= 1000 ? Math.round(n * 100) / 100 : NaN
}

export function MoneyInput({ id, value, onChange, placeholder, invalid }) {
  return (
    <span className={`ed-money${invalid ? ' is-bad' : ''}`} dir="ltr">
      <span aria-hidden="true">$</span>
      <input id={id} inputMode="decimal" autoComplete="off" value={value} placeholder={placeholder}
        aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)} />
    </span>
  )
}

export function Field({ label, hint, children, htmlFor, wide }) {
  return (
    <div className={`ed-field${wide ? ' wide' : ''}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <small className="ed-hint">{hint}</small>}
    </div>
  )
}

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className={`ed-switch${checked ? ' on' : ''}${disabled ? ' off' : ''}`}>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="ed-switch-track" aria-hidden="true"><span /></span>
      <span>{label}</span>
    </label>
  )
}

// Move up / move down / remove, for rows in a list
export function RowTools({ i, n, onMove, onRemove, L }) {
  return (
    <span className="ed-rowtools">
      <button type="button" className="ed-icon" onClick={() => onMove(i, -1)} disabled={i === 0} aria-label={L.up}><ArrowUp size={16} /></button>
      <button type="button" className="ed-icon" onClick={() => onMove(i, 1)} disabled={i === n - 1} aria-label={L.down}><ArrowDown size={16} /></button>
      <button type="button" className="ed-icon danger" onClick={() => onRemove(i)} aria-label={L.remove}><Trash2 size={16} /></button>
    </span>
  )
}

export const moveIn = (arr, i, d) => {
  const j = i + d
  if (j < 0 || j >= arr.length) return arr
  const next = [...arr]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export function SaveBar({ dirty, saving, onSave, onReset, L }) {
  return (
    <div className={`ed-savebar${dirty ? ' show' : ''}`}>
      <span>{dirty ? L.unsaved : L.allSaved}</span>
      {dirty && <button type="button" className="btn-ghost" onClick={onReset} disabled={saving}>{L.undo}</button>}
      <button type="button" className="btn-primary" onClick={onSave} disabled={!dirty || saving}>{saving ? L.saving : L.save}</button>
    </div>
  )
}

// Square .webp, max 600px, from a photo picked on the phone/computer
export async function squareWebp(file, size = 600) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url })
    const s = Math.min(img.naturalWidth, img.naturalHeight)
    const out = Math.min(size, s)
    const c = document.createElement('canvas')
    c.width = out; c.height = out
    c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, out, out)
    const blob = await new Promise((res) => c.toBlob(res, 'image/webp', 0.82))
    return blob || await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.85))
  } finally { URL.revokeObjectURL(url) }
}
