import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { groups, menu, sections } from '../data/menu'
import { useLang, NAMES, WORDS, fold } from '../i18n'
import MenuItem from './MenuItem'
import ItemSheet from './ItemSheet'

// Everything a customer might type to find an item, in both languages
const searchText = (it) => {
  const words = [it.name, NAMES[it.id], it.desc, it.descAr, WORDS[it.desc], sections[it.section].label, WORDS[sections[it.section].label]]
  ;(it.choices || []).forEach((c) => c.options.forEach((o) => words.push(o, WORDS[o])))
  ;(it.extras || []).forEach((e) => words.push(e, WORDS[e]))
  return fold(words.filter(Boolean).join(' '))
}

export default function Menu({ group, onGroupChange }) {
  const reduce = useReducedMotion()
  const { t, w } = useLang()
  const [sheetItem, setSheetItem] = useState(null)
  const [query, setQuery] = useState('')
  const [sec, setSec] = useState('all')
  const current = groups.find((g) => g.id === group)
  useEffect(() => { setSec('all') }, [group])
  const shown = sec === 'all' ? current.sections : current.sections.filter((s) => s === sec)

  // built when the menu loads (the menu can change from the editor)
  const INDEX = useMemo(() => menu.filter((it) => !it.hidden).map((it) => ({ it, text: searchText(it) })), [])
  const q = query.trim()
  const results = useMemo(() => {
    if (!q) return []
    const terms = fold(q).split(/\s+/)
    return INDEX.filter(({ text }) => terms.every((term) => text.includes(term))).map(({ it }) => it)
  }, [q, INDEX])

  const onKey = (e, idx) => {
    const fwd = document.documentElement.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const back = fwd === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft'
    if (e.key !== fwd && e.key !== back) return
    const next = (idx + (e.key === fwd ? 1 : -1) + groups.length) % groups.length
    onGroupChange(groups[next].id)
    document.getElementById(`tab-${groups[next].id}`)?.focus()
  }

  // Show one category (or all); if the customer had scrolled down, bring the list back to its top
  const pickSec = (id) => {
    setSec(id)
    const menuEl = document.getElementById('menu')
    if (!menuEl) return
    const headerH = document.querySelector('.site-header')?.offsetHeight || 0
    const target = menuEl.getBoundingClientRect().top + window.scrollY - headerH
    if (window.scrollY > target + 2) window.scrollTo({ top: target, behavior: 'smooth' })
  }
  const pickTab = (id) => { setQuery(''); onGroupChange(id) }

  return (
    <section className="menu" id="menu" aria-labelledby="menu-title">
      <div className="tabs-bar">
        <div className="container tabs-row">
          <h2 id="menu-title" className="sr-only">{t('navMenu')}</h2>
          <div className="tabs" role="tablist" aria-label={t('navMenu')}>
            {groups.map((g, idx) => {
              const active = !q && g.id === group
              return (
                <button
                  key={g.id} id={`tab-${g.id}`} role="tab" aria-selected={active} aria-controls="menu-panel"
                  tabIndex={g.id === group ? 0 : -1}
                  className={`tab${active ? ' is-active' : ''}`}
                  onClick={() => pickTab(g.id)} onKeyDown={(e) => onKey(e, idx)}
                >
                  {active && (
                    <motion.span layoutId="tab-pill" className="tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                  )}
                  <span className="tab-text">{w(g.label)}</span>
                </button>
              )
            })}
          </div>
          <label className="search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">{t('search')}</span>
            <input
              type="search" value={query} placeholder={t('search')}
              onChange={(e) => setQuery(e.target.value)} enterKeyHint="search"
            />
            {query && (
              <button type="button" className="search-clear" onClick={() => setQuery('')} aria-label={t('clearSearch')}>
                <X size={16} />
              </button>
            )}
          </label>
        </div>
        {!q && current.sections.length > 1 && (
          <div className="container">
            <nav className="sec-links" aria-label={w(current.label)}>
              {['all', ...current.sections].map((s) => (
                <button key={s} type="button" aria-pressed={sec === s}
                  className={`sec-link${sec === s ? ' is-on' : ''}`} onClick={() => pickSec(s)}>
                  {s === 'all' ? w('All') : w(sections[s].label)}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      <div className="container">
        <AnimatePresence mode="wait">
          {q ? (
            <motion.div key="search" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}>
              <p className="search-count" aria-live="polite">
                {results.length ? t('results', results.length, q) : t('noResults', q)}
              </p>
              {results.length > 0 && (
                <ul className="menu-list">
                  {results.map((it) => (
                    <MenuItem key={it.id} item={it} onChoose={setSheetItem} showSection />
                  ))}
                </ul>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={group} id="menu-panel" role="tabpanel" aria-labelledby={`tab-${group}`}
              initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
            >
              <div className="menu-head">
                <h3 className="menu-title">{w(current.label)}</h3>
                <p className="menu-blurb">{w(current.blurb)}</p>
              </div>


              {shown.map((s) => {
                const sec = sections[s]
                return (
                  <div className="menu-section" id={`sec-${s}`} key={s}>
                    <div className="sec-head">
                      <h4 className="sec-title">{w(sec.label)}</h4>
                      {sec.note && <span className="sec-note">{w(sec.note)}</span>}
                    </div>
                    <ul className="menu-list">
                      {menu.filter((m) => m.section === s && !m.hidden).map((it) => (
                        <MenuItem key={it.id} item={it} onChoose={setSheetItem} />
                      ))}
                    </ul>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ItemSheet item={sheetItem} onClose={() => setSheetItem(null)} />
    </section>
  )
}
