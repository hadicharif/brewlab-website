import { useEffect, useState } from 'react'

// Brew Lab is open every day from 8 am to midnight (Lebanon time).
// Owners can change the hours, and close for the day, in the editor.
export let OPEN_HOUR = 8
export let CLOSE_HOUR = 24
export let CLOSED_ON = null   // 'YYYY-MM-DD' = closed that whole day
export const setHours = (open, close, closedOn) => { OPEN_HOUR = open; CLOSE_HOUR = close; CLOSED_ON = closedOn || null }

export const todayBeirut = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Beirut', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
export const isClosedToday = () => CLOSED_ON === todayBeirut()

// "8 am", "midnight", "٨ صباحاً"…
export function fmtHour(h, lang = 'en') {
  const ar = lang === 'ar'
  if (h === 24 || h === 0) return ar ? 'منتصف الليل' : 'midnight'
  if (h === 12) return ar ? 'الظهر' : 'noon'
  const n = h % 12
  if (ar) return `${new Intl.NumberFormat('ar-EG').format(n)} ${h < 12 ? 'صباحاً' : 'مساءً'}`
  return `${n} ${h < 12 ? 'am' : 'pm'}`
}

export function beirutNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Beirut', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (type) => Number(parts.find((p) => p.type === type)?.value || 0)
  return { hour: get('hour'), minute: get('minute') }
}

export const isOpenNow = () => {
  if (isClosedToday()) return false
  const { hour } = beirutNow()
  return CLOSE_HOUR > OPEN_HOUR
    ? hour >= OPEN_HOUR && hour < CLOSE_HOUR
    : hour >= OPEN_HOUR || hour < CLOSE_HOUR   // open past midnight, e.g. 8 am to 2 am
}

// re-checks every minute
export function useOpenNow() {
  const [open, setOpen] = useState(isOpenNow)
  useEffect(() => {
    const id = setInterval(() => setOpen(isOpenNow()), 60000)
    return () => clearInterval(id)
  }, [])
  return open
}
