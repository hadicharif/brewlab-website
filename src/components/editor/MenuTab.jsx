import { useMemo, useRef, useState } from 'react'
import { ImagePlus, Pencil, Plus, Search, Trash2, Undo2 } from 'lucide-react'
import { groups, menu, sections } from '../../data/menu'
import { ITEM_PHOTOS } from '../../data/photos'
import { baseItem, basePhoto, isBaseItem } from '../../data/content'
import { NAMES, WORDS } from '../../i18n'
import { supabase } from '../../lib/supabase'
import { Field, MoneyInput, Switch, money, parseMoney, squareWebp } from './shared'

const sectionGroup = (s) => groups.find((g) => g.sections.includes(s))

// what the form starts with, for an existing item
const formOf = (it) => ({
  name: it.name,
  nameAr: NAMES[it.id] || '',
  price: it.price == null ? '' : String(it.price),
  desc: it.desc || '',
  descAr: it.descAr || (it.desc ? WORDS[it.desc] || '' : ''),
  photo: ITEM_PHOTOS[it.id] || '',
  soldOut: !!it.soldOut,
  hidden: !!it.hidden,
})

// the change to store for a built-in item (only what differs from the original)
function overrideFor(id, f, price) {
  const b = baseItem(id)
  const o = {}
  if (price !== b.price) o.price = price
  if (f.name.trim() && f.name.trim() !== b.name) o.name = f.name.trim()
  const bDesc = b.desc || '', bDescAr = b.desc ? WORDS[b.desc] || '' : ''
  if (f.desc.trim() !== bDesc || f.descAr.trim() !== bDescAr) { o.desc = f.desc.trim(); o.descAr = f.descAr.trim() }
  if (f.soldOut) o.soldOut = true
  if (f.hidden) o.hidden = true
  if (f.photo !== (basePhoto(id) || '')) o.photo = f.photo
  return o
}

// "Latte: price $5.10 → $5.50, sold out"
function describe(name, before, after, L) {
  const ch = []
  const pb = parseMoney(before.price), pa = parseMoney(after.price)
  if (pb !== pa) ch.push(`price ${money(pb)} → ${money(pa)}`)
  if (before.name !== after.name) ch.push(`name → ${after.name}`)
  if (before.nameAr !== after.nameAr) ch.push('Arabic name')
  if (before.desc !== after.desc || before.descAr !== after.descAr) ch.push('description')
  if (before.photo !== after.photo) ch.push(after.photo ? 'photo' : 'photo removed')
  if (before.soldOut !== after.soldOut) ch.push(after.soldOut ? 'sold out' : 'available again')
  if (before.hidden !== after.hidden) ch.push(after.hidden ? 'hidden' : 'shown again')
  return `${name}: ${ch.join(', ') || L.save.toLowerCase()}`
}

export default function MenuTab({ content, save, saving, L, lang }) {
  const saved = content.menu || {}
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)          // item id being edited, or 'new:<section>'
  const nameOf = (it) => (lang === 'ar' ? NAMES[it.id] || it.name : it.name)

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase()
    return menu.filter((it) =>
      (filter === 'all' || sectionGroup(it.section)?.id === filter) &&
      (!term || `${it.name} ${NAMES[it.id] || ''}`.toLowerCase().includes(term)))
    // content in the deps: the menu array is updated in place after each save
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, q, content])
  const bySection = Object.keys(sections)
    .map((s) => ({ s, items: shown.filter((it) => it.section === s) }))
    .filter(({ s, items }) => items.length || (!q && (filter === 'all' || sectionGroup(s)?.id === filter)))

  // store the whole menu part with one item changed
  const commit = async (id, entry, summary) => {
    const next = { items: { ...(saved.items || {}) }, added: [...(saved.added || [])] }
    if (isBaseItem(id)) {
      if (entry && Object.keys(entry).length) next.items[id] = entry
      else delete next.items[id]
    } else {
      const i = next.added.findIndex((a) => a.id === id)
      if (entry === null) { if (i >= 0) next.added.splice(i, 1) }
      else if (i >= 0) next.added[i] = entry
      else next.added.push(entry)
    }
    return save('menu', next, summary)
  }

  const quickSoldOut = (it) => {
    const f = formOf(it)
    const after = { ...f, soldOut: !f.soldOut }
    const entry = isBaseItem(it.id)
      ? overrideFor(it.id, after, it.price)
      : { ...(saved.added || []).find((a) => a.id === it.id), soldOut: after.soldOut }
    commit(it.id, entry, `${it.name}: ${after.soldOut ? 'sold out' : 'available again'}`)
  }

  return (
    <div className="ed-menu">
      <div className="ed-toolbar">
        <div className="ed-chips" role="group" aria-label={L.section}>
          {[{ id: 'all', label: L.all }, ...groups.map((g) => ({ id: g.id, label: lang === 'ar' ? WORDS[g.label] || g.label : g.label }))].map((g) => (
            <button key={g.id} type="button" className={filter === g.id ? 'on' : ''} aria-pressed={filter === g.id} onClick={() => setFilter(g.id)}>{g.label}</button>
          ))}
        </div>
        <label className="ed-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">{L.search}</span>
          <input type="search" value={q} placeholder={L.search} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      {bySection.map(({ s, items }) => (
        <section key={s} className="ed-sec">
          <h3 className="ed-sec-title">{lang === 'ar' ? WORDS[sections[s].label] || sections[s].label : sections[s].label}</h3>
          <ul className="ed-items">
            {items.map((it) => (
              <li key={it.id} className={`ed-item${it.hidden ? ' is-hidden' : ''}`}>
                {open === it.id ? (
                  <ItemForm it={it} saved={saved} L={L} lang={lang} saving={saving}
                    onCancel={() => setOpen(null)}
                    onSave={async (f, price) => {
                      const before = formOf(it)
                      const entry = isBaseItem(it.id)
                        ? overrideFor(it.id, f, price)
                        : { id: it.id, section: it.section, name: f.name.trim(), nameAr: f.nameAr.trim(), price, desc: f.desc.trim(), descAr: f.descAr.trim(), photo: f.photo, soldOut: f.soldOut, hidden: f.hidden }
                      if (await commit(it.id, entry, describe(it.name, before, { ...f, price: price == null ? '' : String(price) }, L))) setOpen(null)
                    }}
                    onOriginal={isBaseItem(it.id) && saved.items?.[it.id] ? async () => {
                      if (await commit(it.id, null, `${it.name}: back to the original`)) setOpen(null)
                    } : null}
                    onDelete={!isBaseItem(it.id) ? async () => {
                      if (!window.confirm(L.confirmDelete(it.name))) return
                      if (await commit(it.id, null, `${it.name}: deleted`)) setOpen(null)
                    } : null}
                  />
                ) : (
                  <div className="ed-row">
                    {ITEM_PHOTOS[it.id] ? <img src={ITEM_PHOTOS[it.id]} alt="" className="ed-thumb" /> : <span className="ed-thumb empty" aria-hidden="true" />}
                    <span className="ed-row-name">
                      {nameOf(it)}
                      {it.added && <small className="ed-badge new">{L.newItem}</small>}
                      {it.hidden && <small className="ed-badge">{L.hidden}</small>}
                    </span>
                    <span className="ed-row-price" dir="ltr">{money(it.price)}</span>
                    <button type="button" className={`ed-sold${it.soldOut ? ' on' : ''}`} aria-pressed={!!it.soldOut}
                      onClick={() => quickSoldOut(it)} disabled={saving}>{L.soldOut}</button>
                    <button type="button" className="ed-icon" onClick={() => setOpen(it.id)} aria-label={`${L.edit} ${nameOf(it)}`}><Pencil size={16} /></button>
                  </div>
                )}
              </li>
            ))}
            {open === `new:${s}` ? (
              <li className="ed-item">
                <ItemForm it={{ id: '', section: s, name: '', price: null }} isNew saved={saved} L={L} lang={lang} saving={saving}
                  onCancel={() => setOpen(null)}
                  onSave={async (f, price) => {
                    const id = `n-${Date.now().toString(36)}`
                    const entry = { id, section: s, name: f.name.trim(), nameAr: f.nameAr.trim(), price, desc: f.desc.trim(), descAr: f.descAr.trim(), photo: f.photo, soldOut: f.soldOut, hidden: f.hidden }
                    if (await commit(id, entry, `New item: ${entry.name} (${money(price)})`)) setOpen(null)
                  }} />
              </li>
            ) : !q && (
              <li><button type="button" className="ed-additem" onClick={() => setOpen(`new:${s}`)}><Plus size={16} /> {L.addItem}</button></li>
            )}
          </ul>
        </section>
      ))}
    </div>
  )
}

function ItemForm({ it, isNew, L, saving, onSave, onCancel, onOriginal, onDelete }) {
  const [f, setF] = useState(() => (isNew
    ? { name: '', nameAr: '', price: '', desc: '', descAr: '', photo: '', soldOut: false, hidden: false }
    : formOf(it)))
  const [err, setErr] = useState({})
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }))
  const showAr = isNew || !isBaseItem(it.id)
  const sized = sections[it.section]?.sized
  const fid = (k) => `ed-${it.id || 'new'}-${k}`

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !supabase) return
    setUploading(true); setErr((x) => ({ ...x, photo: null }))
    try {
      const blob = await squareWebp(file)
      const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${it.id || 'new'}-${Date.now().toString(36)}.${ext}`
      const { error } = await supabase.storage.from('menu-photos').upload(path, blob, { contentType: blob.type, upsert: false })
      if (error) throw error
      set('photo')(supabase.storage.from('menu-photos').getPublicUrl(path).data.publicUrl)
    } catch (ex) {
      setErr((x) => ({ ...x, photo: ex.message || 'Upload failed' }))
    } finally { setUploading(false) }
  }

  const submit = (e) => {
    e.preventDefault()
    const price = parseMoney(f.price)
    const er = {}
    if (!f.name.trim()) er.name = L.needName
    if (Number.isNaN(price)) er.price = L.badPrice
    setErr(er)
    if (Object.keys(er).length) return
    onSave(f, price)
  }

  return (
    <form className="ed-form" onSubmit={submit}>
      <div className="ed-grid">
        <Field label={L.name} htmlFor={fid('name')}>
          <input id={fid('name')} dir="auto" value={f.name} onChange={(e) => set('name')(e.target.value)} aria-invalid={!!err.name || undefined} />
          {err.name && <small className="ed-err">{err.name}</small>}
        </Field>
        {showAr && (
          <Field label={L.nameAr} htmlFor={fid('nameAr')}>
            <input id={fid('nameAr')} dir="rtl" value={f.nameAr} onChange={(e) => set('nameAr')(e.target.value)} />
          </Field>
        )}
        <Field label={L.price} htmlFor={fid('price')} hint={L.priceHint(sized)}>
          <MoneyInput id={fid('price')} value={f.price} onChange={set('price')} invalid={!!err.price} />
          {err.price && <small className="ed-err">{err.price}</small>}
        </Field>
        <Field label={L.desc} htmlFor={fid('desc')} wide>
          <input id={fid('desc')} dir="ltr" value={f.desc} onChange={(e) => set('desc')(e.target.value)} />
        </Field>
        <Field label={L.descAr} htmlFor={fid('descAr')} wide>
          <input id={fid('descAr')} dir="rtl" value={f.descAr} onChange={(e) => set('descAr')(e.target.value)} />
        </Field>
      </div>

      <div className="ed-photo">
        {f.photo ? <img src={f.photo} alt="" className="ed-photo-img" /> : <span className="ed-photo-img empty" aria-hidden="true"><ImagePlus size={22} /></span>}
        <div>
          <p className="ed-photo-label">{L.photo}</p>
          <div className="ed-btnrow">
            <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? L.uploading : f.photo ? L.changePhoto : L.addPhoto}
            </button>
            {f.photo && <button type="button" className="link-btn" onClick={() => set('photo')('')}>{L.removePhoto}</button>}
          </div>
          <small className="ed-hint">{L.photoHint}</small>
          {err.photo && <small className="ed-err">{err.photo}</small>}
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
        </div>
      </div>

      <div className="ed-switches">
        <Switch checked={f.soldOut} onChange={set('soldOut')} label={L.soldOutLabel} />
        <Switch checked={f.hidden} onChange={set('hidden')} label={L.hideLabel} />
      </div>

      <div className="ed-btnrow ed-form-actions">
        <button type="submit" className="btn-primary" disabled={saving || uploading}>{saving ? L.saving : L.save}</button>
        <button type="button" className="btn-ghost" onClick={onCancel}>{L.cancel}</button>
        {onOriginal && <button type="button" className="link-btn ed-push" onClick={onOriginal} disabled={saving}><Undo2 size={15} /> {L.original}</button>}
        {onDelete && <button type="button" className="link-btn ed-push danger" onClick={onDelete} disabled={saving}><Trash2 size={15} /> {L.deleteItem}</button>}
      </div>
    </form>
  )
}
