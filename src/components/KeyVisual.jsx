import { motion, useReducedMotion } from 'framer-motion'

// Shapes from the brand guide's "Key visuals" page: sage and peach arches,
// circles, half circles and fine concentric line arcs.
const SAGE = '#96b79c'
const PEACH = '#f5b4a1'
const STONE = '#d3cdbd'
const INK = '#ffffff' // fine lines in white, as in the guide's white-on-brand logo
const LIGHT = '#ffffff'

function LineArcs({ cx, cy, from = 18, to = 54, step = 6, sweep = 'top' }) {
  const arcs = []
  for (let r = from; r <= to; r += step) {
    const d =
      sweep === 'top'
        ? `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`
        : `M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx + r} ${cy}`
    arcs.push(<path key={r} d={d} fill="none" stroke={INK} strokeWidth="1.3" />)
  }
  return <g opacity="0.85">{arcs}</g>
}

function Lines({ x, y, h, n = 7, gap = 6 }) {
  return (
    <g stroke={INK} strokeWidth="1.3" opacity="0.85">
      {Array.from({ length: n }, (_, i) => (
        <line key={i} x1={x + i * gap} y1={y} x2={x + i * gap} y2={y + h} />
      ))}
    </g>
  )
}

export default function KeyVisual({ className = '' }) {
  const reduce = useReducedMotion()
  const rise = (delay) =>
    reduce
      ? {}
      : {
          initial: { scaleY: 0 },
          animate: { scaleY: 1 },
          transition: { delay, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] },
          style: { transformOrigin: 'bottom', transformBox: 'fill-box' },
        }
  const pop = (delay) =>
    reduce
      ? {}
      : {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { delay, type: 'spring', stiffness: 260, damping: 18 },
          style: { transformOrigin: 'center', transformBox: 'fill-box' },
        }

  return (
    <svg className={className} viewBox="0 0 420 380" aria-hidden="true" focusable="false">
      {/* concentric line arch, left */}
      <LineArcs cx={70} cy={250} from={12} to={48} />
      <Lines x={22} y={250} h={130} n={7} gap={6} />
      <Lines x={82} y={250} h={130} n={7} gap={6} />

      {/* big sage arch with peach arch overlapping (darker where they meet) */}
      <motion.path {...rise(0.25)} d="M236 380V160a72 72 0 0 1 144 0v220z" fill={LIGHT} />
      <motion.g {...rise(0.4)}>
        <path d="M176 380V222a56 56 0 0 1 112 0v158z" fill={PEACH} />
        {/* where the arches overlap, a deeper peach (as in the guide) */}
        <path d="M236 380V166.1A56 56 0 0 1 288 222V380z" fill="#e9a492" />
      </motion.g>

      {/* circles */}
      <motion.circle {...pop(0.6)} cx="186" cy="96" r="46" fill={PEACH} />
      <motion.circle {...pop(0.7)} cx="318" cy="46" r="22" fill={LIGHT} />
      <motion.circle {...pop(0.8)} cx="124" cy="176" r="11" fill="#545454" />

      {/* half circle on a small ball, right edge */}
      <motion.circle {...pop(0.9)} cx="404" cy="300" r="7" fill={PEACH} />

      {/* quarter line arcs, top right */}
      <LineArcs cx={360} cy={110} from={10} to={40} step={6} sweep="quarter" />
    </svg>
  )
}

// Small arch + circle mark for empty and confirmation states.
export function MiniMark({ size = 72 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true" focusable="false">
      <path d="M38 80V38a20 20 0 0 1 40 0v42z" fill={SAGE} />
      <path d="M18 80V48a16 16 0 0 1 32 0v32z" fill={PEACH} />
      <path d="M38 80V32.5A16 16 0 0 1 50 48V80z" fill="#dc9d8c" />
      <circle cx="18" cy="16" r="10" fill={PEACH} />
      <circle cx="60" cy="8" r="5" fill={SAGE} />
    </svg>
  )
}
