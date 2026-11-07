import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { flavourColors } from '../data/drinkLab'

// ─── colour helpers ──────────────────────────────────────────
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const toHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t))

const PEACH = '#f5b4a1'
const INK = '#2e2e2e'
const ESPRESSO = '#3a2216'
const CREMA = '#b47440'
const ease = { duration: 0.55, ease: [0.22, 0.9, 0.3, 1] }

// colours derived from the drink and its add-ons
function palette(r) {
  const has = (id) => r.extras.some((e) => e.id === id)
  const darken = (c) => (has('shot') ? mix(c, '#000000', 0.2) : c)
  let top = r.variant?.color || r.drink.color || r.drink.blended || ESPRESSO
  if (r.milk && r.milk.id !== 'regular') top = mix(top, r.milk.color, 0.15)
  if (r.flavour && flavourColors[r.flavour] && !r.drink.flavourRequired) top = mix(top, flavourColors[r.flavour], 0.15)
  return { top: darken(top), darken, has }
}

// ─── shared pieces ───────────────────────────────────────────
function Steam({ xs, y, reduce }) {
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none">
      {xs.map((x, i) => (
        <motion.path key={x} d={`M${x} ${y} q-10 -14 0 -28 q10 -14 0 -28`}
          animate={reduce ? {} : { y: [6, -6, 6], opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }} />
      ))}
    </motion.g>
  )
}

function Cream({ cx, cy, k = 1, reduce }) {
  const puffs = [[-52, 12, 18], [-28, 4, 22], [0, 0, 24], [28, 4, 22], [52, 12, 18], [0, -22, 20], [-18, -14, 14], [20, -14, 14]]
  return (
    <motion.g
      initial={reduce ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      style={{ transformOrigin: `${cx}px ${cy + 10}px` }}
    >
      {puffs.map(([dx, dy, rr], i) => <circle key={i} cx={cx + dx * k} cy={cy + dy * k} r={rr * k} fill="#fffdf8" />)}
    </motion.g>
  )
}

const Shadow = ({ cx = 130, cy = 334, rx = 80 }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry="7" fill="#000000" opacity="0.12" />
)

// What you see looking into a hot cup: colour, foam, latte art, tea bag
function TopView({ cx, cy, rx, ry, r, p }) {
  const milkFoam = r.milk ? mix(r.milk.color, '#ffffff', 0.4) : '#f6efe4'
  return (
    <g>
      <motion.ellipse cx={cx} cy={cy} rx={rx} ry={ry} initial={false} animate={{ fill: p.top }} transition={ease} />
      {r.drink.foamy && <ellipse cx={cx} cy={cy + 0.5} rx={rx * 0.82} ry={ry * 0.78} fill={milkFoam} />}
      {r.drink.art && (
        <g>
          <ellipse cx={cx} cy={cy + 0.5} rx={rx * 0.78} ry={ry * 0.72} fill={milkFoam} />
          <motion.path
            initial={false} animate={{ fill: p.top }} transition={ease}
            d={`M${cx} ${cy + ry * 0.6} C ${cx - rx * 0.32} ${cy} ${cx - rx * 0.24} ${cy - ry * 0.75} ${cx - rx * 0.1} ${cy - ry * 0.55} C ${cx - rx * 0.05} ${cy - ry * 0.48} ${cx - rx * 0.01} ${cy - ry * 0.35} ${cx} ${cy - ry * 0.2} C ${cx + rx * 0.01} ${cy - ry * 0.35} ${cx + rx * 0.05} ${cy - ry * 0.48} ${cx + rx * 0.1} ${cy - ry * 0.55} C ${cx + rx * 0.24} ${cy - ry * 0.75} ${cx + rx * 0.32} ${cy} ${cx} ${cy + ry * 0.6} Z`}
          />
        </g>
      )}
      {r.drink.look === 'espresso' && <ellipse cx={cx} cy={cy} rx={rx * 0.9} ry={ry * 0.85} fill={CREMA} />}
      {r.drink.look === 'macchiato' && (
        <g><ellipse cx={cx} cy={cy} rx={rx * 0.9} ry={ry * 0.85} fill={CREMA} /><ellipse cx={cx} cy={cy} rx={rx * 0.42} ry={ry * 0.45} fill="#f8f2e8" /></g>
      )}
      {r.drink.look === 'cortado' && <ellipse cx={cx} cy={cy} rx={rx * 0.9} ry={ry * 0.85} fill="#c9a27a" />}
      {r.drink.look === 'turkish' && <ellipse cx={cx} cy={cy} rx={rx * 0.9} ry={ry * 0.85} fill="#7a5236" />}
    </g>
  )
}

function TeaTag({ x1, y1, x2, y2 }) {
  return (
    <g>
      <path d={`M${x1} ${y1} Q ${(x1 + x2) / 2 + 6} ${y1 - 8} ${x2} ${y2}`} fill="none" stroke="#f6f1e6" strokeWidth="1.6" />
      <rect x={x2 - 10} y={y2} width="20" height="24" rx="3" fill={PEACH} />
      <text x={x2} y={y2 + 16} textAnchor="middle" className="cup-tag">BL</text>
    </g>
  )
}

// Logo as printed on the paper cups (white type, coloured circles)
function PaperPrint({ x, y, k, dot }) {
  return (
    <g>
      {[0, 1, 2].map((i) => <circle key={i} cx={x} cy={y + i * 30 * k} r={17 * k} fill={dot} />)}
      <text x={x + 10 * k} y={y + 16 * k} className="cup-paper" style={{ fontSize: 30 * k }}>BREW</text>
      <text x={x + 10 * k} y={y + 48 * k} className="cup-paper" style={{ fontSize: 30 * k }}>LAB</text>
      <text x={x + 10 * k} y={y + 66 * k} className="cup-paper-tag" style={{ fontSize: 8.5 * k, letterSpacing: 1.1 * k }}>THE COFFEE BEACON</text>
      <g stroke="#ffffff" strokeWidth={1.1 * k} opacity="0.85">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={x + 88 * k} x2={x + 118 * k} y1={y + (24 + i * 5) * k} y2={y + (24 + i * 5) * k} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={`b${i}`} x1={x - 6 * k} x2={x + 110 * k} y1={y + (78 + i * 5) * k} y2={y + (78 + i * 5) * k} />
        ))}
      </g>
    </g>
  )
}

// ─── 1. Dine-in mug: speckled stoneware, amber rim ──────────
const SPECKS = [
  [80, 180], [96, 210], [118, 172], [142, 196], [168, 182], [182, 226], [104, 250], [130, 240], [156, 262],
  [88, 282], [120, 296], [146, 300], [176, 284], [92, 230], [160, 220], [136, 270], [110, 200], [184, 256],
  [76, 260], [126, 312], [150, 168], [172, 300],
]
function Mug({ r, p, reduce }) {
  const body = 'M62 150 C 60 270 64 300 74 314 C 86 330 106 332 130 332 C 154 332 174 330 186 314 C 196 300 200 270 198 150 Z'
  return (
    <g>
      <Shadow cy={336} rx={74} />
      <path d="M68 188 C 18 184 16 266 70 268" fill="none" stroke="#dde0db" strokeWidth="18" strokeLinecap="round" />
      <path d="M66 200 C 34 200 32 254 68 256" fill="none" stroke="#b9bdb6" strokeWidth="3" opacity="0.55" />
      <path d={body} fill="#e2e5e0" />
      <path d="M160 150 L198 150 C 200 270 196 300 186 314 C 174 330 154 332 140 332 C 166 324 178 300 180 260 Z" fill="#cdd1cb" opacity="0.6" />
      {SPECKS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 1.1 : 1.6} fill="#a9ada6" opacity="0.55" />)}
      <ellipse cx="130" cy="150" rx="68" ry="15" fill="#e9ece8" />
      <TopView cx={130} cy={151} rx={61} ry={11.5} r={r} p={p} />
      <ellipse cx="130" cy="150" rx="68" ry="15" fill="none" stroke="#8b5427" strokeWidth="3" />
      {r.drink.teaBag && <TeaTag x1={150} y1={150} x2={204} y2={186} />}
      <Toppings r={r} p={p} reduce={reduce} cx={130} topY={150} k={0.95} steamXs={[104, 130, 156]} />
    </g>
  )
}

// ─── 2. Takeaway: pink double-wall paper cup ────────────────
function PinkCup({ r, p, reduce }) {
  return (
    <g>
      <Shadow cy={334} rx={66} />
      <path d="M58 124 L202 124 L186 330 L74 330 Z" fill="#f2aaa6" />
      <path d="M72.6 312 L187.4 312 L186 330 L74 330 Z" fill="#f6f3ee" />
      <path d="M160 124 L202 124 L186 330 L160 330 Z" fill="#000000" opacity="0.05" />
      <PaperPrint x={84} y={190} k={0.82} dot="#8ed3bd" />
      <rect x="54" y="116" width="152" height="12" rx="6" fill="#ffffff" />
      <ellipse cx="130" cy="120" rx="74" ry="11" fill="#fbf8f4" />
      <TopView cx={130} cy={121} rx={67} ry={9} r={r} p={p} />
      {r.drink.teaBag && <TeaTag x1={150} y1={120} x2={210} y2={150} />}
      <Toppings r={r} p={p} reduce={reduce} cx={130} topY={120} k={0.95} steamXs={[104, 130, 156]} />
    </g>
  )
}

// ─── 3. Cold: clear printed cup with flat or sip lid ────────
const C_TOP = 138
const C_BOTTOM = 325
const C_H = C_BOTTOM - C_TOP
const C_OUTER = 'M56 118 L204 118 L188 330 L72 330 Z'
const C_INNER = 'M62 122 L198 122 L183 325 L77 325 Z'

function ColdCup({ r, p, reduce }) {
  const tr = reduce ? { duration: 0 } : ease
  const iced = r.drink.cat === 'cold'
  const milkColor = r.milk?.color || '#f4ede0'

  // layers bottom → top
  let layers
  if (r.drink.blended) {
    const c = p.top
    layers = [
      { key: 'a', h: C_H * 0.5, c },
      { key: 'b', h: C_H * 0.35, c },
      { key: 'c', h: C_H * 0.15, c: mix(c, '#ffffff', 0.25) },
    ]
  } else {
    const parts = r.drink.layers.map((l) => (l === 'milk' ? milkColor : p.darken(l)))
    const fl = r.flavour && flavourColors[r.flavour]
    const stack = []
    if (fl) stack.push({ c: fl, w: 0.14 })
    if (parts.length === 1) stack.push({ c: parts[0], w: 1 - (fl ? 0.14 : 0) })
    else {
      const rest = 1 - (fl ? 0.14 : 0)
      parts.forEach((c, i) => stack.push({ c, w: (i === parts.length - 1 ? 0.45 : 0.55 / (parts.length - 1)) * rest }))
    }
    while (stack.length < 3) stack.unshift({ c: stack[0].c, w: 0 })
    layers = stack.slice(-3).map((s, i) => ({ key: 'abc'[i], h: C_H * s.w, c: s.c }))
  }
  let y = C_BOTTOM
  const placed = layers.map((l) => { y -= l.h; return { ...l, y } })
  const cream = p.has('cream')

  return (
    <g>
      <Shadow cy={334} rx={64} />
      <defs><clipPath id="lab-cold-inner"><path d={C_INNER} /></clipPath></defs>
      {r.lid === 'straw' && <line x1="148" y1="318" x2="178" y2="22" stroke={PEACH} strokeWidth="11" strokeLinecap="round" />}
      <path d={C_OUTER} fill="#ffffff" fillOpacity="0.2" />
      <g clipPath="url(#lab-cold-inner)">
        {placed.map((l) => (
          <motion.rect key={l.key} x="0" width="260" initial={false}
            animate={{ y: l.y, height: Math.max(l.h, 0), fill: l.c }} transition={tr} />
        ))}
        {r.drink.speckled && [[96, 200], [120, 240], [150, 210], [110, 280], [160, 270], [136, 300], [90, 250], [170, 230], [128, 180], [104, 160], [150, 160]].map(([cx, cy], i) => (
          <rect key={i} x={cx} y={cy} width="7" height="5" rx="1.5" fill="#2b2522" transform={`rotate(${i * 37} ${cx} ${cy})`} />
        ))}
        {iced && [[86, 148, -12], [128, 142, 8], [104, 190, 18], [148, 182, -6]].map(([x, yy, rot], i) => (
          <motion.rect key={i} x={x} y={yy} width="34" height="34" rx="7"
            fill="#ffffff" fillOpacity="0.4" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="2"
            transform={`rotate(${rot} ${x + 17} ${yy + 17})`}
            initial={reduce ? false : { opacity: 0, y: -80 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.06, type: 'spring', stiffness: 220, damping: 16 }} />
        ))}
        <AnimatePresence>
          {cream && (
            <motion.g key="cream" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <rect x="0" y={C_TOP - 16} width="260" height="30" fill="#fffdf8" />
              {[70, 96, 122, 148, 174, 196].map((cx) => <circle key={cx} cx={cx} cy={C_TOP + 14} r="13" fill="#fffdf8" />)}
            </motion.g>
          )}
        </AnimatePresence>
      </g>

      {/* black print, as on the real cup */}
      <g>
        {[0, 1, 2].map((i) => <circle key={i} cx="90" cy={202 + i * 26} r="14" fill={INK} />)}
        <text x="98" y="217" className="cup-cold">BREW</text>
        <text x="98" y="244" className="cup-cold">LAB</text>
        <text x="98" y="259" className="cup-cold-tag">THE COFFEE BEACON</text>
        <g fill="none" stroke={INK} strokeWidth="1.2">
          {[0, 1, 2, 3, 4].map((i) => {
            const yy = 222 + i * 4
            const rr = 16 - i * 2.5
            return <path key={i} d={`M156 ${yy} H170 A${rr} ${rr} 0 0 1 170 ${yy + 2 * rr} H160`} />
          })}
        </g>
      </g>

      <path d={C_OUTER} fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M68 136 L82 304" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" />

      {/* lid */}
      {r.lid === 'sip' ? (
        <g>
          <path d="M56 118 C 64 92 196 92 204 118 Z" fill="#ffffff" fillOpacity="0.28" stroke="#ffffff" strokeWidth="2.5" />
          <rect x="146" y="86" width="22" height="12" rx="4" fill="#ffffff" fillOpacity="0.35" stroke="#ffffff" strokeWidth="2" />
        </g>
      ) : (
        <rect x="50" y="108" width="160" height="13" rx="6.5" fill="#ffffff" fillOpacity="0.3" stroke="#ffffff" strokeWidth="2.5" />
      )}
      <rect x="50" y="114" width="160" height="8" rx="4" fill="#ffffff" fillOpacity="0.45" />
    </g>
  )
}

// ─── 4. Dine-in small: clear double-wall glass ──────────────
function ShotGlass({ r, p, reduce }) {
  const look = r.drink.look
  const outer = 'M74 186 C 70 292 92 332 130 332 C 168 332 190 292 186 186 Z'
  const inner = 'M88 192 L94 284 Q97 302 114 302 L146 302 Q163 302 166 284 L172 192 Z'
  const espresso = p.darken(ESPRESSO)
  let bands // [top, color] from bottom up
  if (look === 'macchiato') bands = [[238, espresso], [222, CREMA], [206, '#f8f2e8']]
  else if (look === 'cortado') bands = [[262, espresso], [214, '#c9a27a'], [206, '#efe4d2']]
  else if (look === 'turkish') bands = [[218, '#2b1a12'], [208, '#7a5236']]
  else bands = [[r.drink.id === 'double' ? 214 : 232, espresso], [r.drink.id === 'double' ? 204 : 222, CREMA]]

  return (
    <g>
      <Shadow cy={336} rx={56} />
      <defs><clipPath id="lab-shot-inner"><path d={inner} /></clipPath></defs>
      <path d={outer} fill="#ffffff" fillOpacity="0.18" />
      <g clipPath="url(#lab-shot-inner)">
        {[...bands].sort((a, b) => a[0] - b[0]).map(([top, c], i) => (
          <motion.rect key={i} x="0" width="260" initial={false}
            animate={{ y: top, height: 302 - top, fill: c }} transition={reduce ? { duration: 0 } : ease} />
        ))}
      </g>
      <path d={inner} fill="none" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2" />
      <path d={outer} fill="none" stroke="#ffffff" strokeWidth="3.5" />
      <ellipse cx="130" cy="186" rx="56" ry="9" fill="none" stroke="#ffffff" strokeWidth="5" />
      <path d="M84 206 C 82 270 92 304 110 318" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
      <Toppings r={r} p={p} reduce={reduce} cx={130} topY={186} k={0.62} steamXs={[112, 148]} />
    </g>
  )
}

// ─── 5. Takeaway small: mint paper cup ──────────────────────
function MintCup({ r, p, reduce }) {
  return (
    <g>
      <Shadow cy={334} rx={50} />
      <path d="M78 206 L182 206 L171 330 L89 330 Z" fill="#92d6c3" />
      <path d="M87.8 316 L172.2 316 L171 330 L89 330 Z" fill="#f6f3ee" />
      <path d="M156 206 L182 206 L171 330 L156 330 Z" fill="#000000" opacity="0.05" />
      <PaperPrint x={98} y={248} k={0.58} dot="#f4a493" />
      <rect x="74" y="199" width="112" height="10" rx="5" fill="#ffffff" />
      <ellipse cx="130" cy="203" rx="54" ry="8.5" fill="#fbf8f4" />
      <TopView cx={130} cy={204} rx={48} ry={6.5} r={r} p={p} />
      <Toppings r={r} p={p} reduce={reduce} cx={130} topY={203} k={0.62} steamXs={[112, 148]} />
    </g>
  )
}

// steam and cream for hot cups
function Toppings({ r, p, reduce, cx, topY, k, steamXs }) {
  const cream = p.has('cream')
  return (
    <>
      <AnimatePresence>{cream && <Cream key="c" cx={cx} cy={topY - 10 * k} k={k} reduce={reduce} />}</AnimatePresence>
      <Steam xs={steamXs} y={cream ? topY - 46 * k : topY - 22} reduce={reduce} />
    </>
  )
}

const CUPS = { mug: Mug, pinkcup: PinkCup, cold: ColdCup, shotglass: ShotGlass, mintcup: MintCup }

export default function LabCup({ drink: r, bump = 0, className = '' }) {
  const reduce = useReducedMotion()
  const p = palette(r)
  const Cup = CUPS[r.cupKind]
  const scale = r.cupKind === 'cold' && r.size === 'Medium' ? 0.9 : 1

  return (
    <svg className={className} viewBox="0 0 260 360" role="img" aria-label="Preview of your drink">
      <motion.g
        animate={{ scale, y: reduce ? 0 : [0, bump ? -10 : 0, 0] }}
        transition={{ scale: reduce ? { duration: 0 } : ease, y: { duration: 0.4 } }}
        key={`bump-${bump}`}
        style={{ transformOrigin: '130px 334px' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.g
            key={r.cupKind}
            initial={reduce ? false : { opacity: 0, scale: 0.85, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 14 }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: '130px 330px' }}
          >
            <Cup r={r} p={p} reduce={reduce} />
          </motion.g>
        </AnimatePresence>
      </motion.g>
    </svg>
  )
}
