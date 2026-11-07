import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Field } from './shared'

export default function StaffTab({ me, saving, setSaving, notify, L }) {
  const [team, setTeam] = useState(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('staff')

  const load = async () => {
    const { data, error } = await supabase.rpc('owner_list_team')
    if (error) notify({ ok: false, text: L.failed + error.message })
    setTeam(data || [])
  }
  useEffect(() => { load() }, [])

  const setRoleFor = async (who, r, name) => {
    if (r === 'none' && !window.confirm(L.confirmRemove(name || who))) return false
    setSaving(true)
    const { error } = await supabase.rpc('owner_set_role', { p_email: who, p_role: r })
    setSaving(false)
    notify(error ? { ok: false, text: L.failed + error.message } : { ok: true, text: L.saved })
    if (!error) await load()
    return !error
  }

  const add = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    if (await setRoleFor(email.trim(), role, email.trim())) setEmail('')
  }

  return (
    <div className="ed-panel">
      <h3 className="ed-h">{L.team}</h3>
      <p className="ed-intro">{L.roleHint}</p>
      {!team ? <p className="ed-intro">{L.loading}</p> : (
        <ul className="ed-team">
          {team.map((p) => {
            const self = p.email?.toLowerCase() === me?.toLowerCase()
            const cur = p.is_owner ? 'owner' : p.is_social ? 'social' : 'staff'
            return (
              <li key={p.email}>
                <span className="ed-team-who">
                  <b>{p.name || '—'}{self && <small> ({L.you})</small>}</b>
                  <small dir="ltr">{p.email}</small>
                </span>
                <select aria-label={`${p.name || p.email}`} value={cur} disabled={saving || self}
                  onChange={(e) => setRoleFor(p.email, e.target.value, p.name)}>
                  {['owner', 'staff', 'social', 'none'].map((r) => <option key={r} value={r}>{L.roles[r]}</option>)}
                </select>
              </li>
            )
          })}
        </ul>
      )}

      <h3 className="ed-h">{L.addPerson}</h3>
      <form className="ed-addperson" onSubmit={add}>
        <Field label={L.email} htmlFor="st-email" hint={L.signupFirst}>
          <input id="st-email" type="email" dir="ltr" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={L.role} htmlFor="st-role">
          <select id="st-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="staff">{L.roles.staff}</option>
            <option value="social">{L.roles.social}</option>
            <option value="owner">{L.roles.owner}</option>
          </select>
        </Field>
        <button className="btn-primary" disabled={saving || !email.trim()}>{L.addBtn}</button>
      </form>
    </div>
  )
}
