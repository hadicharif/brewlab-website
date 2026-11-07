import { useState } from 'react'
import { Star } from 'lucide-react'
import { useLang } from '../i18n'

const T = {
  en: { title: 'How was your visit?', ratings: ['Not good', 'Could be better', 'Okay', 'Good', 'Loved it'] },
  ar: { title: 'كيف كانت زيارتك؟', ratings: ['سيئ', 'يمكن أن يكون أفضل', 'مقبول', 'جيد', 'رائع'] },
}

// Slim main-page line: each star opens the feedback page with that rating chosen
export default function FeedbackStrip() {
  const { lang } = useLang()
  const L = T[lang]
  const [hover, setHover] = useState(0)
  return (
    <section className="fb-strip" aria-labelledby="fb-strip-title">
      <div className="container fb-strip-inner">
        <h2 id="fb-strip-title">{L.title}</h2>
        <div className="fb-strip-stars" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <a key={i} href={`#feedback?rating=${i}`} className={i <= hover ? 'on' : ''}
              aria-label={`${i} – ${L.ratings[i - 1]}`}
              onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(0)}>
              <Star size={24} strokeWidth={1.8} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
