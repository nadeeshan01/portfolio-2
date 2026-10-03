import { useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/* Typewriter — cycles words with a steady editorial cadence           */
/* ------------------------------------------------------------------ */
export function useTypewriter(
  words: string[],
  options: { typeSpeed?: number; deleteSpeed?: number; hold?: number; startDelay?: number } = {},
) {
  const { typeSpeed = 92, deleteSpeed = 48, hold = 1900, startDelay = 1600 } = options
  const [text, setText] = useState(words[0] ?? '')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || words.length < 2) {
      setText(words[0] ?? '')
      return
    }

    let wordIndex = 0
    let charIndex = words[0]!.length
    let deleting = false
    let timer: number | undefined

    const tick = () => {
      const word = words[wordIndex] ?? ''
      if (!deleting) {
        charIndex += 1
        setText(word.slice(0, charIndex))
        if (charIndex >= word.length) {
          deleting = true
          timer = window.setTimeout(tick, hold)
          return
        }
        timer = window.setTimeout(tick, typeSpeed)
      } else {
        charIndex -= 1
        setText(word.slice(0, charIndex))
        if (charIndex <= 0) {
          deleting = false
          wordIndex = (wordIndex + 1) % words.length
          timer = window.setTimeout(tick, 340)
          return
        }
        timer = window.setTimeout(tick, deleteSpeed)
      }
    }

    timer = window.setTimeout(tick, startDelay)
    return () => window.clearTimeout(timer)
  }, [words, typeSpeed, deleteSpeed, hold, startDelay])

  return text
}

/* ------------------------------------------------------------------ */
/* Scroll-spy — returns the section id currently under the masthead    */
/* ------------------------------------------------------------------ */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const probe = window.innerHeight * 0.34
      let current = ids[0] ?? ''

      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (rect.top <= probe && rect.bottom > probe) {
          current = id
          break
        }
        if (rect.top <= probe) current = id
      }
      setActive((prev) => (prev === current ? prev : current))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return active
}

/* ------------------------------------------------------------------ */
/* Count-up — animates a number once it enters the viewport            */
/* ------------------------------------------------------------------ */
export function useCountUp(target: number, decimals = 0, duration = 1400) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(target)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started.current) continue
          started.current = true

          const start = performance.now()
          const step = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            const next = target * eased
            setValue(Number(next.toFixed(decimals)))
            if (t < 1) window.requestAnimationFrame(step)
            else setValue(target)
          }
          window.requestAnimationFrame(step)
        }
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [target, decimals, duration])

  return { ref, display: value.toFixed(decimals) }
}

/* ------------------------------------------------------------------ */
/* Section visibility (used to start/stop looping sequences)           */
/* ------------------------------------------------------------------ */
export function useSectionInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting)
      },
      { threshold },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}
