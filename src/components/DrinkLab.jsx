import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Minus, Plus, RotateCcw } from 'lucide-react'
import {
  categories, drinks, milks, services, extras, defaultDrink, FLAVOURS, flavourColors,
  resolveDrink, drinkNames, drinkParts, drinkId, drinkPrice, ADDON_PRICES, flavourPrice, drinkUnavailable,
} from '../data/drinkLab'
import { COLD_SIZES, formatPrice } from '../data/menu'
import { useCart } from '../CartContext'
import { useLang, NAMES, WORDS } from '../i18n'
import LabCup from './LabCup'

function Chips({ title, name, options, value, onChange, note }) {
  return (
    <fieldset className="lab-group">
      <legend>{title}</legend>
      <div className="chips">
        {options.map((o) => {
          const checked = value === o.id
          return (
            <label key={o.id} className={`chip${o.color === undefined ? ' chip-plain' : ''}${checked ? ' is-on' : ''}`}>
              <input type="radio" name={name} checked={checked} onChange={() => onChange(o.id)} />
              {o.color !== undefined && (
                <span className={`swatch${o.color ? '' : ' swatch-none'}`}
                  style={o.color ? { background: o.color } : undefined} aria-hidden="true" />
              )}
              <span>{o.name}</span>
              {o.hint && <small className="chip-price" dir="ltr">{o.hint}</small>}
            </label>
          )
        })}
      </div>
      {note && <p className="lab-note">{note}</p>}
    </fieldset>
  )
}

// An add-on the customer can add more than once: tap to add, then − / + to change how many
function CountChip({ name, color, hint, n, onSet, disabled, lessLabel, moreLabel }) {
  const swatch = color !== undefined && (
    <span className={`swatch${color ? '' : ' swatch-none'}`} style={color ? { background: color } : undefined} aria-hidden="true" />
  )
  if (!n) {
    return (
      <button type="button" className={`chip chip-btn${disabled ? ' is-off' : ''}`} disabled={disabled} onClick={() => onSet(1)}>
        {swatch ? swatch : <span className="tick tick-plus" aria-hidden="true"><Plus size={14} strokeWidth={2.6} /></span>}<span>{name}</span>
        {hint && <small className="chip-price" dir="ltr">{hint}</small>}
      </button>
    )
  }
  return (
    <span className="chip is-on chip-count" role="group" aria-label={`${name}: ${n}`}>
      <button type="button" className="chip-step" onClick={() => onSet(n - 1)} aria-label={`${lessLabel} ${name}`}><Minus size={15} strokeWidth={2.6} /></button>
      {swatch}<span>{name}</span>
      <b className="chip-n" dir="ltr">×{n}</b>
      <button type="button" className="chip-step" onClick={() => onSet(n + 1)} aria-label={`${moreLabel} ${name}`}><Plus size={15} strokeWidth={2.6} /></button>
    </span>
  )
}

export default function DrinkLab() {
  const { addCustom } = useCart()
  const { t, w, n, lang } = useLang()
  const [d, setD] = useState(defaultDrink)
  const [bump, setBump] = useState(0)
  const [added, setAdded] = useState(false)

  // "Customize" on a menu item opens the builder with that drink picked
  useEffect(() => {
    const onCustomize = (e) => {
      const drink = drinks.find((x) => x.id === e.detail)
      if (!drink) return
      setD((p) => ({ ...p, cat: drink.cat, drink: drink.id, variant: e.variant || null }))
      setAdded(false)
      document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' })
    }
    window.addEventListener('brewlab:customize', onCustomize)
    return () => window.removeEventListener('brewlab:customize', onCustomize)
  }, [])

  const r = useMemo(() => resolveDrink(d), [d])
  const names = drinkNames(r, NAMES, WORDS)
  const name = lang === 'ar' ? names.ar : names.en
  const parts = drinkParts(r)
  const { base, price } = drinkPrice(r)
  const priceLabel = price != null ? formatPrice(price) : base != null ? `${formatPrice(base)} ${t('plusAddons')}` : null
  const details = parts.map(w).join(lang === 'ar' ? '، ' : ', ')
  const update = (patch) => { setD((p) => ({ ...p, ...patch })); setAdded(false) }

  const catDrinks = drinks.filter((x) => x.cat === d.cat)
  const pickCat = (cat) => {
    const list = drinks.filter((x) => x.cat === cat)
    update({ cat, drink: (list.find((x) => !drinkUnavailable(x.id)) || list[0]).id, variant: null })
  }
  const soldOut = drinkUnavailable(r.drink.id)
  const setExtra = (id, n) => update({ extras: { ...d.extras, [id]: Math.max(0, n) } })
  const setFlavour = (f, n) => update({ flavours: { ...d.flavours, [f]: Math.max(0, n) } })
  const anyFlavour = FLAVOURS.some((f) => d.flavours[f] > 0)

  const add = () => {
    if (soldOut) return
    addCustom({ id: drinkId(r), baseId: `lab-${r.drink.id}`, name: names.en, nameAr: names.ar, parts, price })
    setBump((b) => b + 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const flavourOptions = FLAVOURS.map((f) => ({ id: f, name: w(f), color: flavourColors[f] }))
  const less = lang === 'ar' ? 'إنقاص' : 'Less'
  const more = lang === 'ar' ? 'زيادة' : 'More'
  const shortName = (x) =>
    lang === 'ar' ? NAMES[x.id] || x.name : x.name.replace(/ (frappé|milkshake)$/, '')

  return (
    <section className="lab" id="lab" aria-labelledby="lab-title">
      <div className="container">
        <div className="lab-head">
          <h2 id="lab-title" className="menu-title">{t('labTitle')}</h2>
          <p className="menu-blurb">{t('labBlurb')}</p>
        </div>

        <div className="lab-grid">
          <div className="lab-stage">
            <div className="lab-stage-inner">
              <svg className="lab-arch" viewBox="0 0 200 260" aria-hidden="true">
                <motion.path d="M0 260V100a100 100 0 0 1 200 0v160z" initial={false}
                  animate={{ fill: r.cupKind === 'pinkcup' ? '#ffffff' : '#f5b4a1' }} transition={{ duration: 0.4 }} />
              </svg>
              <LabCup drink={r} bump={bump} className="lab-cup" />
            </div>
            <div className="lab-readout" aria-live="polite">
              <p className="lab-name">{name}</p>
              <p className="lab-details">{details}</p>
              {base != null && (
                <p className="lab-price">
                  {formatPrice(price ?? base)}
                  {price == null && <span className="lab-price-note"> {t('plusAddons')}</span>}
                </p>
              )}
              <button className="btn-add-mini" onClick={add} disabled={soldOut}>
                {added ? <><Check size={16} strokeWidth={3} /> {t('added')}</> : t('addToCart')}
              </button>
            </div>
          </div>

          <div className="lab-controls">
            <fieldset className="lab-group">
              <legend>{t('drink')}</legend>
              <div className="seg">
                {categories.map((c) => (
                  <label key={c.id} className={d.cat === c.id ? 'is-active' : ''}>
                    <input type="radio" name="cat" checked={d.cat === c.id} onChange={() => pickCat(c.id)} />
                    {w(c.label)}
                  </label>
                ))}
              </div>
              <div className="chips" style={{ marginTop: '.75rem' }}>
                {catDrinks.map((x) => {
                  const off = drinkUnavailable(x.id)
                  return (
                    <label key={x.id} className={`chip chip-plain${d.drink === x.id ? ' is-on' : ''}${off ? ' is-off' : ''}`}>
                      <input type="radio" name="drink" checked={d.drink === x.id} disabled={off}
                        onChange={() => update({ drink: x.id, variant: null })} />
                      <span>{shortName(x)}</span>
                      {off && <small className="chip-price">{t('soldOut')}</small>}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {r.drink.variants && (
              <Chips title={t('type')} name="variant" value={r.variant.id} onChange={(v) => update({ variant: v })}
                options={r.drink.variants.map((v) => ({ id: v.id, name: w(v.name), color: v.color }))} />
            )}

            <div className="lab-row">
              <Chips
                title={t('size')} name="size" value={r.size || 'one'}
                options={r.size ? COLD_SIZES.map((s) => ({ id: s, name: w(s) })) : [{ id: 'one', name: t('oneSize') }]}
                onChange={(s) => r.size && update({ size: s })}
              />
              <Chips
                title={t('service')} name="service" value={d.service}
                options={services.map((s) => ({ id: s.id, name: w(s.name) }))} onChange={(s) => update({ service: s })}
                note={r.cupKind === 'cold' ? t('coldSameCup') : null}
              />
            </div>

            {r.milk && (
              <Chips title={t('milk')} name="milk" value={d.milk} onChange={(m) => update({ milk: m })}
                options={milks.map((m) => ({ id: m.id, name: w(m.name), color: m.color, hint: m.price ? `+${formatPrice(m.price)}` : null }))} />
            )}

            {r.drink.flavourRequired && (
              <Chips title={t('flavour')} name="flavour" value={r.flavour}
                onChange={(f) => update({ flavour: f })} options={flavourOptions} />
            )}
            {!r.drink.noFlavour && !r.drink.flavourRequired && (
              <fieldset className="lab-group">
                <legend>{t('flavour')}</legend>
                <div className="chips">
                  <button type="button" className={`chip chip-btn${anyFlavour ? '' : ' is-on'}`} aria-pressed={!anyFlavour}
                    onClick={() => update({ flavours: {} })}>
                    <span className="swatch swatch-none" aria-hidden="true" /><span>{t('noFlavour')}</span>
                  </button>
                  {FLAVOURS.map((f) => (
                    <CountChip key={f} name={w(f)} color={flavourColors[f]} n={d.flavours[f] || 0}
                      hint={flavourPrice(f) ? `+${formatPrice(flavourPrice(f))}` : null}
                      onSet={(n) => setFlavour(f, n)} lessLabel={less} moreLabel={more} />
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className="lab-group">
              <legend>{t('extras')}</legend>
              <div className="chips">
                {extras.map((e) => {
                  const disabled = e.coffeeOnly && !r.drink.coffee
                  const n = disabled ? 0 : d.extras[e.id] || 0
                  if (e.multi) {
                    return (
                      <CountChip key={e.id} name={w(e.name)} n={n} disabled={disabled}
                        hint={ADDON_PRICES[e.id] > 0 ? `+${formatPrice(ADDON_PRICES[e.id])}` : null}
                        onSet={(v) => setExtra(e.id, v)} lessLabel={less} moreLabel={more} />
                    )
                  }
                  const on = n > 0
                  return (
                    <label key={e.id} className={`chip${on ? ' is-on' : ''}${disabled ? ' is-off' : ''}`}>
                      <input type="checkbox" checked={on} disabled={disabled} onChange={() => setExtra(e.id, on ? 0 : 1)} />
                      <span className={`tick${on ? ' on' : ''}`} aria-hidden="true">{on && <Check size={13} strokeWidth={3} />}</span>
                      <span>{w(e.name)}</span>
                      {ADDON_PRICES[e.id] > 0 && <small className="chip-price" dir="ltr">+{formatPrice(ADDON_PRICES[e.id])}</small>}
                    </label>
                  )
                })}
              </div>
            </fieldset>

            <div className="lab-actions">
              <button className={`btn-add${priceLabel ? '' : ' btn-add-center'}`} onClick={add} disabled={soldOut}>
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span key="a" className="btn-add-label" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                      <Check size={20} strokeWidth={3} /> {t('addedToCart')}
                    </motion.span>
                  ) : (
                    <motion.span key="b" className="btn-add-label" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                      {t('addToCart')}
                    </motion.span>
                  )}
                </AnimatePresence>
                {priceLabel && <span className="btn-add-price">{priceLabel}</span>}
              </button>
              <button className="btn-reset" onClick={() => { setD(defaultDrink); setAdded(false) }}>
                <RotateCcw size={16} /> {t('startOver')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
