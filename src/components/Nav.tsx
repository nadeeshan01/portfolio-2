import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { Download, Menu, X } from 'lucide-react'
import { IDENTITY, NAV_ITEMS } from '../data/portfolio'
import { useActiveSection } from '../lib/hooks'
import { EASE } from './Reveal'

const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

export default function Nav() {
  const active = useActiveSection(SECTION_IDS)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const goTo = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
          scrolled ? 'border-hairline bg-ground/92 backdrop-blur-md' : 'border-transparent bg-ground/70 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 lg:px-12">
          {/* Handle / brand plate */}
          <button
            type="button"
            onClick={() => goTo('home')}
            className="group inline-flex items-center gap-2 border border-hairline-2 bg-plate px-3 py-1.5 transition-colors hover:border-ink"
          >
            <span className="h-1.5 w-1.5 bg-terracotta transition-transform duration-300 group-hover:scale-150" />
            <span className="font-mono text-[12px] font-semibold tracking-[0.14em] text-ink">
              {IDENTITY.handle}
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(item.id)}
                  className={`relative py-1 font-mono text-label-md uppercase tracking-[0.14em] transition-colors ${
                    isActive ? 'font-semibold text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 h-0.5 w-full bg-terracotta"
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href="#contact"
              className="hidden items-center gap-2 border border-ink bg-ink px-4 py-2 font-mono text-label-md uppercase tracking-[0.14em] text-plate transition-colors hover:bg-plate hover:text-ink md:inline-flex"
            >
              Download CV
              <Download className="h-3.5 w-3.5" strokeWidth={2} />
            </a>

            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center border border-hairline-2 bg-plate text-ink transition-colors hover:border-ink md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Scroll progress hairline */}
        <motion.div
          style={{ scaleX: progress, transformOrigin: '0% 50%' }}
          className="h-0.5 w-full bg-terracotta"
        />
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.45, ease: EASE }}
              className="absolute right-0 top-0 flex h-full w-[84vw] max-w-sm flex-col justify-between border-l border-hairline-2 bg-plate p-6"
            >
              <div>
                <div className="flex items-center justify-between border-b border-hairline pb-4">
                  <span className="font-mono text-[12px] font-semibold tracking-[0.14em] text-ink">
                    {IDENTITY.handle}
                  </span>
                  <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setOpen(false)}
                    className="text-muted transition-colors hover:text-ink"
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                </div>

                <nav className="mt-6 flex flex-col">
                  {NAV_ITEMS.map((item, i) => (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => goTo(item.id)}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: EASE }}
                      className="flex items-baseline justify-between border-b border-hairline py-4 text-left transition-colors hover:text-terracotta"
                    >
                      <span className="font-display text-2xl font-semibold text-ink">
                        {item.label}
                      </span>
                      <span className="font-mono text-label-sm uppercase text-muted">
                        Plate {item.plate}
                      </span>
                    </motion.button>
                  ))}
                </nav>
              </div>

              <div className="space-y-3">
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 border border-ink bg-ink px-4 py-3 font-mono text-label-md uppercase tracking-[0.14em] text-plate"
                >
                  Download CV
                  <Download className="h-4 w-4" strokeWidth={2} />
                </a>
                <p className="text-center font-mono text-label-sm uppercase text-muted">
                  {IDENTITY.handle} · {IDENTITY.year} archive
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
