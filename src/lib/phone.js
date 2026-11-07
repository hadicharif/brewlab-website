// Phone numbers are saved as digits with the country code, e.g. 96170552950.
// Lebanese numbers can be typed any common way: 70 552 950, 03 123 456, +961 70 552 950, 0096170552950.
export function normalizePhone(input) {
  let s = String(input || '').trim()
  if (!s) return ''
  const plus = s.startsWith('+')
  s = s.replace(/\D/g, '')
  if (!plus && s.startsWith('00')) s = s.slice(2)
  else if (!plus && !s.startsWith('961')) {
    if (s.startsWith('0')) s = s.slice(1)
    if (s.length >= 7 && s.length <= 8) s = '961' + s     // local Lebanese number
  }
  return /^\d{10,15}$/.test(s) ? s : null                 // null = not a valid number
}

// 96170552950 → +961 70 552 950
export function prettyPhone(n) {
  const d = String(n || '').replace(/\D/g, '')
  const m = /^961(\d{1,2})(\d{3})(\d{3})$/.exec(d)
  return m ? `+961 ${m[1]} ${m[2]} ${m[3]}` : d ? `+${d}` : ''
}
