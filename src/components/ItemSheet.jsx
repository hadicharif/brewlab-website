import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { COLD_SIZES, sections, priceFor, formatPrice } from '../data/menu'
import { useCart } from '../CartContext'
import { useLang, NAMES } from '../i18n'

// Options for a menu item before adding it: size, sauce, flavour, extras.
export default function ItemSheet({ item, onClose }) {
  const { addCustom } = useCart()
  const { t, w, n } = useLang()
  const [picks, setPicks] = useState({})
  const [extras, setExtras] = useState([])
  const [size, setSize] = useState(COLD_SIZES[0])
  const closeRef = useRef(null)

  useEffect(() => {
    if (!item) return
    setPicks(Object.fromEntries((item.choices || []).map((c) => [c.id, c.options[0]])))
    setExtras([])
    setSize(COLD_SIZES[0])
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    setTimeout(() => closeRef.current?.focus(), 50)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [item, onClose])

  const sized = item && sections[item.section].sized

  const add = () => {
    const parts = []
    if (sized) parts.push(sections[item.section].label, size)
    ;(item.choices || []).forEach((c) => parts.push(picks[c.id]))
    extras.forEach((e) => parts.push(e))
    const id = `${item.id}|${parts.join('|')}`
    const price = priceFor(item, size, extras)
    addCustom({ id, baseId: item.id, name: item.name, nameAr: NAMES[item.id] || item.name, parts, price })
    onClose()
  }

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div className="drawer-backdrop" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"
            initial={{ y: '100%', opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="sheet-head">
              <h2 id="sheet-title">{n(item)}</h2>
              <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label={t('close')}>
                <X size={22} />
              </button>
            </div>

            <div className="sheet-body">
              {sized && (
                <fieldset className="lab-group">
                  <legend>{t('size')}</legend>
                  <div className="chips">
                    {COLD_SIZES.map((s) => (
                      <label key={s} className={`chip chip-plain${size === s ? ' is-on' : ''}`}>
                        <input type="radio" name="size" checked={size === s} onChange={() => setSize(s)} />
                        <span>{w(s)}</span>
                        {priceFor(item, s) != null && <span className="chip-price">{formatPrice(priceFor(item, s))}</span>}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              {(item.choices || []).map((c) => (
                <fieldset className="lab-group" key={c.id}>
                  <legend>{w(c.label)}</legend>
                  <div className="chips">
                    {c.options.map((o) => (
                      <label key={o} className={`chip chip-plain${picks[c.id] === o ? ' is-on' : ''}`}>
                        <input type="radio" name={c.id} checked={picks[c.id] === o}
                          onChange={() => setPicks((p) => ({ ...p, [c.id]: o }))} />
                        <span>{w(o)}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              {item.extras?.length > 0 && (
                <fieldset className="lab-group">
                  <legend>{t('extras')}</legend>
                  <div className="chips">
                    {item.extras.map((e) => {
                      const on = extras.includes(e)
                      return (
                        <label key={e} className={`chip${on ? ' is-on' : ''}`}>
                          <input type="checkbox" checked={on}
                            onChange={() => setExtras((x) => (on ? x.filter((y) => y !== e) : [...x, e]))} />
                          <span className={`tick${on ? ' on' : ''}`} aria-hidden="true">
                            {on && <Check size={13} strokeWidth={3} />}
                          </span>
                          <span>{w(e)}</span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              )}
            </div>

            <div className="sheet-foot">
              <button className={`btn-add${item && priceFor(item, size, extras) != null ? '' : ' btn-add-center'}`} onClick={add}>
                <span>{t('addToCart')}</span>
                {priceFor(item, size, extras) != null && (
                  <span className="btn-add-price">{formatPrice(priceFor(item, size, extras))}</span>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
