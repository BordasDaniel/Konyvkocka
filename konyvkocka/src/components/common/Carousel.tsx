import { useEffect, useRef, useState, useCallback } from 'react'

type Slide = {
  id: string
  img: string
  title: string
  tags?: string[]
  desc?: string
  trailer?: string
  episodes?: string[]
  reader?: string
  rating?: number
}

type Props = {
  slides?: Slide[]
  fetchUrl?: string
  interval?: number
  onSlideClick?: (slide: Slide) => void
}

const defaultSlides: Slide[] = [
  {
    id: 'titanic',
    img: 'https://m.media-amazon.com/images/I/71ZJ8am0mKL._AC_SY879_.jpg',
    title: 'Titanic',
    tags: ['Romantikus', 'Dráma', 'PG-13'],
    desc: 'A Titanic egy 1997-es amerikai romantikus filmdráma, amely egy tragikus szerelmi történetet mesél el a híres óceánjáró katasztrófájának hátterében.',
    trailer: 'https://www.youtube.com/embed/kVrqfYjkTdQ',
    episodes: ['1: Teljes film'],
    rating: 4.5
  },
  {
    id: 'godfather',
    img: 'https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_.jpg',
    title: 'A keresztapa',
    tags: ['Bűnügyi', 'Dráma', 'R'],
    desc: 'A Keresztapa egy 1972-es bűnügyi dráma, amely a Corleone maffia család történetét meséli el.',
    trailer: 'https://www.youtube.com/embed/sY1S34973zA',
    episodes: ['1: Teljes film'],
    rating: 5.0
  },
  {
    id: 'inception',
    img: 'https://m.media-amazon.com/images/I/91KkWf50SoL._AC_SY679_.jpg',
    title: 'Eredet',
    tags: ['Sci-Fi', 'Akció', 'PG-13'],
    desc: 'Egy csapat profi "álomtolvaj" megbízást kap: nem ellopni, hanem elültetni egy gondolatot – a tét pedig mindennél nagyobb.',
    trailer: 'https://www.youtube.com/embed/YoHD9XEInc0',
    episodes: ['1: Teljes film'],
    rating: 4.7
  },
  {
    id: 'interstellar',
    img: 'https://m.media-amazon.com/images/I/91kFYg4fX3L._AC_SY679_.jpg',
    title: 'Csillagok között',
    tags: ['Sci-Fi', 'Kaland', 'PG-13'],
    desc: 'Egy űrexpedíció a túlélésért indul, miközben az idő és a tér a legnagyobb ellenféllé válik.',
    trailer: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    episodes: ['1: Teljes film'],
    rating: 4.8
  },
  {
    id: 'shawshank',
    img: 'https://m.media-amazon.com/images/I/51NiGlapXlL._AC_.jpg',
    title: 'A remény rabjai',
    tags: ['Dráma', 'Börtönfilm', 'R'],
    desc: 'Barátság, kitartás és remény a falak mögött – egy történet, ami évtizedeken át velünk marad.',
    trailer: 'https://www.youtube.com/embed/6hB3S9bIaco',
    episodes: ['1: Teljes film'],
    rating: 4.9
  },
  {
    id: 'lotr-fellowship',
    img: 'https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00ZTRhLTk4ODQtMTVlOWY4NTdiYmMwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
    title: 'A Gyűrű Szövetsége',
    tags: ['Fantasy', 'Kaland', 'PG-13'],
    desc: 'Egy váratlan küldetés indul a Gyűrűvel: barátság, áldozat és epikus utazás Középföldén.',
    trailer: 'https://www.youtube.com/embed/V75dMMIW2B4',
    episodes: ['1: Teljes film'],
    rating: 4.8
  }
]

export default function Carousel({ slides: slidesProp, fetchUrl, interval = 5000, onSlideClick }: Props) {
  const [slides, setSlides] = useState<Slide[]>(slidesProp ?? [])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<number | null>(null)
  const animTimeoutRef = useRef<number | null>(null)
  const activeIndexRef = useRef(0)

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  useEffect(() => {
    if (slidesProp && slidesProp.length) setSlides(slidesProp)
  }, [slidesProp])

  useEffect(() => {
    let mounted = true
    if (!slidesProp) {
      if (fetchUrl) {
        fetch(fetchUrl)
          .then(res => res.json())
          .then((data) => {
            if (!mounted) return
            if (Array.isArray(data)) setSlides(data as Slide[])
          })
          .catch(() => {
            if (mounted && (!slides || slides.length === 0)) setSlides(defaultSlides)
          })
      } else if (!slides || slides.length === 0) {
        setSlides(defaultSlides)
      }
    }
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUrl])

  const goTo = useCallback((i: number) => {
    if (isAnimating || slides.length === 0) return
    setIsAnimating(true)
    setActiveIndex(i)
    if (animTimeoutRef.current) {
      window.clearTimeout(animTimeoutRef.current)
    }
    animTimeoutRef.current = window.setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating, slides.length])

  const goNext = useCallback(() => {
    if (slides.length === 0) return
    goTo((activeIndex + 1) % slides.length)
  }, [activeIndex, slides.length, goTo])

  const goPrev = useCallback(() => {
    if (slides.length === 0) return
    goTo((activeIndex - 1 + slides.length) % slides.length)
  }, [activeIndex, slides.length, goTo])

  // Auto-play timer
  useEffect(() => {
    if (slides.length <= 1) return
    
    timerRef.current = window.setInterval(() => {
      setActiveIndex(prev => (prev + 1) % slides.length)
    }, interval)

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
      if (animTimeoutRef.current) {
        window.clearTimeout(animTimeoutRef.current)
      }
    }
  }, [slides.length, interval])

  // Reset timer when manually navigating
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = window.setInterval(() => {
        setActiveIndex(prev => (prev + 1) % slides.length)
      }, interval)
    }
  }, [slides.length, interval])

  const handlePrev = () => {
    goTo((activeIndexRef.current - 1 + slides.length) % slides.length)
    resetTimer()
  }

  const handleNext = () => {
    goTo((activeIndexRef.current + 1) % slides.length)
    resetTimer()
  }

  const handleDotClick = (i: number) => {
    goTo(i)
    resetTimer()
  }

  return (
    <section className="hero-carousel">
      <div
        id="contentCarousel"
        className="carousel slide carousel-fade w-100"
        style={{ position: 'relative' }}
      >
        <div className="carousel-inner">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className={`carousel-item ${idx === activeIndex ? 'active' : ''}`}
              style={{
                opacity: idx === activeIndex ? 1 : 0,
                transition: 'opacity 0.6s ease-in-out',
                position: idx === activeIndex ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: idx === activeIndex ? 1 : 0
              }}
              data-bg={s.img}
            >
              <div className="carousel-content" style={{ transform: idx === activeIndex ? 'translateY(0)' : 'translateY(20px)', transition: 'transform 0.6s ease' }}>
                <div className="carousel-text">
                  <div className="tags">{(s.tags || []).map(t => <span key={t}>{t}</span>)}</div>
                  <h2 className="mt-3">{s.title}</h2>
                  {s.desc && <p>{s.desc}</p>}
                  <button
                    className="btn mt-3 view-btn text-dark"
                    onClick={() => onSlideClick?.(s)}
                  >
                    Megtekintés
                  </button>
                </div>
                <div className="carousel-image">
                  <img
                    src={s.img}
                    alt={`${s.title} borító`}
                    loading={idx === activeIndex ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={idx === activeIndex ? 'high' : 'auto'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div 
          className="carousel-control-prev" 
          role="button"
          onClick={handlePrev}
          aria-label="Előző"
        >
          <span className="carousel-control-prev-icon"></span>
        </div>
        <div 
          className="carousel-control-next" 
          role="button"
          onClick={handleNext}
          aria-label="Következő"
        >
          <span className="carousel-control-next-icon"></span>
        </div>

        <div id="carouselDots" className="carousel-dots" role="tablist" aria-label="Carousel pagination">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1} of ${slides.length || 1}`}
              className={i === activeIndex ? 'active' : ''}
              onClick={() => handleDotClick(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}