import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { applyContent, readCache, writeCache } from './data/content'

// Loads the owners' website changes (site_content) and keeps the site in step
const ContentContext = createContext(null)
export const useContent = () => useContext(ContentContext)

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => readCache() || {})
  const [version, setVersion] = useState(0)

  // put new content live: apply it, remember it, and redraw the site
  const setLive = useCallback((next) => {
    applyContent(next)
    writeCache(next)
    setContent(next)
    setVersion((v) => v + 1)
  }, [])

  const reload = useCallback(async () => {
    if (!supabase) return null
    const { data, error } = await supabase.from('site_content').select('key, value')
    if (error || !data) return null
    const next = Object.fromEntries(data.map((r) => [r.key, r.value]))
    return next
  }, [])

  useEffect(() => {
    let alive = true
    reload().then((next) => {
      if (alive && next && !same(next, readCache() || {})) setLive(next)
    })
    // check again when the customer comes back to the tab
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      reload().then((next) => { if (next && !same(next, readCache() || {})) setLive(next) })
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => { alive = false; document.removeEventListener('visibilitychange', onVisible) }
  }, [reload, setLive])

  return (
    <ContentContext.Provider value={{ content, version, setLive, reload }}>
      {children}
    </ContentContext.Provider>
  )
}
