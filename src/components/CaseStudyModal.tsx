import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { GithubMark } from './BrandIcons'
import { X } from 'lucide-react'
import ArchitectureFlow from './ArchitectureFlow'
import CommandDeck from './CommandDeck'
import { Reveal } from './Reveal'
import { CASE_STUDY } from '../data/focusflow'
import { EASE } from './Reveal'

/** Ledger block used for each chapter of the dossier. */
function Block({
  plate,
  title,
  children,
  delay = 0,
}: {
  plate: string
  title: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <Reveal delay={delay} className="border-t border-hairline px-5 py-8 sm:px-8">
      <div className="flex items-center gap-2 font-mono text-label-sm uppercase tracking-[0.16em]">
        <span className="font-semibold text-terracotta">{plate}</span>
        <span className="text-hairline-2">/</span>
        <span className="text-muted">{title}</span>
      </div>
      <div className="mt-5">{children}</div>
    </Reveal>
  )
}

export default function CaseStudyModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${CASE_STUDY.title} case study`}
        >
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-ink/70 backdrop-blur-[3px]"
            onClick={onClose}
            aria-hidden
          />

          {/* panel */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.99 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative mx-auto w-full max-w-5xl border-ink bg-plate shadow-[0_40px_80px_-30px_rgba(20,20,20,0.7)] sm:my-6 sm:border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ------------ sticky masthead ------------ */}
            <div className="sticky top-0 z-20 border-b border-ink bg-plate/95 backdrop-blur-md">
              <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-8">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-label-sm uppercase tracking-[0.16em]">
                    <span className="font-semibold text-terracotta">
                      Plate {CASE_STUDY.plate} // {CASE_STUDY.kicker}
                    </span>
                    <span className="hidden text-hairline-2 sm:inline">·</span>
                    <span className="hidden text-muted sm:inline">{CASE_STUDY.status}</span>
                  </div>
                  <h2 className="mt-1.5 truncate font-display text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">
                    {CASE_STUDY.title}
                  </h2>
                  <p className="mt-0.5 text-body-sm text-muted">{CASE_STUDY.subtitle}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted md:inline">
                    ESC
                  </span>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close case study"
                    className="flex h-9 w-9 items-center justify-center border border-hairline-2 bg-plate text-ink transition-colors hover:border-ink hover:bg-ink hover:text-plate"
                  >
                    <X className="h-4.5 w-4.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div className="h-0.5 w-full bg-linear-to-r from-terracotta via-terracotta/40 to-transparent" />
            </div>

            {/* ------------ overview ------------ */}
            <div className="px-5 pt-8 sm:px-8">
              <Reveal>
                <p className="border-l-2 border-terracotta pl-4 font-display text-xl italic leading-relaxed text-ink sm:text-[22px]">
                  {CASE_STUDY.lede}
                </p>
              </Reveal>

              <Reveal delay={0.06}>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {CASE_STUDY.summary.map((p) => (
                    <p key={p.slice(0, 24)} className="text-body-md leading-relaxed text-muted">
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* ------------ what it proves ------------ */}
            <Block plate="A" title="What the project does" delay={0.05}>
              <ul className="grid gap-2.5 md:grid-cols-2">
                {CASE_STUDY.objectives.map((o) => (
                  <li key={o} className="flex gap-2.5 text-body-sm leading-relaxed text-muted">
                    <span className="mt-2 h-px w-4 shrink-0 bg-terracotta" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border border-hairline bg-ground px-4 py-3">
                {CASE_STUDY.facts.map((f) => (
                  <div
                    key={f.k}
                    className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-hairline py-2 last:border-b-0"
                  >
                    <span className="font-mono text-label-sm uppercase tracking-[0.14em] text-muted">
                      {f.k}
                    </span>
                    <span className="font-mono text-label-md text-ink">{f.v}</span>
                  </div>
                ))}
              </div>
            </Block>

            {/* ------------ stack ------------ */}
            <Block plate="B" title="Technology stack">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {CASE_STUDY.stack.map((group) => (
                  <div key={group.area} className="border border-hairline bg-ground p-4">
                    <p className="font-mono text-label-sm font-semibold uppercase tracking-[0.16em] text-terracotta">
                      {group.area}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="border border-hairline-2 bg-plate px-2 py-1 font-mono text-label-sm text-ink"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Block>

            {/* ------------ animated architecture ------------ */}
            <Block plate="C" title="Delivery architecture — animated">
              <ArchitectureFlow />
            </Block>

            {/* ------------ folder structure ------------ */}
            <Block plate="D" title="Repository structure, briefly">
              <div className="border border-hairline bg-ground p-4 sm:p-5">
                {CASE_STUDY.tree.map((node, i) => {
                  const glyph = i === 0 ? '' : i === CASE_STUDY.tree.length - 1 ? '└─' : '├─'
                  return (
                    <div
                      key={node.path}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-hairline py-1.5 last:border-b-0"
                    >
                      <span className="whitespace-pre font-mono text-[12px] text-ink">
                        {glyph && <span className="mr-1.5 text-hairline-2">{glyph}</span>}
                        {node.path}
                      </span>
                      <span className="w-full font-mono text-[11px] leading-relaxed text-muted sm:ml-auto sm:w-auto sm:max-w-[54%] sm:text-right">
                        {node.note}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 font-mono text-label-sm uppercase tracking-[0.14em] text-muted">
                Exact inventory: <span className="text-ink">find . -maxdepth 3 -type f</span>
              </p>
            </Block>

            {/* ------------ commands ------------ */}
            <Block plate="E" title="Command prompt — examples">
              <CommandDeck />
            </Block>

            {/* ------------ notes + links ------------ */}
            <Block plate="F" title="Security & cost notes">
              <div className="grid gap-3 md:grid-cols-2">
                {CASE_STUDY.notes.map((n) => (
                  <div
                    key={n.slice(0, 20)}
                    className="border border-terracotta/45 bg-terracotta/[0.05] p-4 text-body-sm leading-relaxed text-muted"
                  >
                    {n}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-hairline pt-5">
                <a
                  href={CASE_STUDY.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stamp stamp-accent inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 font-mono text-label-md uppercase tracking-[0.14em] text-plate"
                >
                  <GithubMark className="h-3.5 w-3.5" />
                  View repository
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="stamp inline-flex items-center gap-2 border border-hairline-2 bg-ground px-5 py-3 font-mono text-label-md uppercase tracking-[0.14em] text-ink hover:border-ink"
                >
                  Close dossier
                </button>
                <span className="font-mono text-label-sm uppercase tracking-[0.14em] text-muted">
                  Evidence: evidence/week-* · final-release · aws-final
                </span>
              </div>
            </Block>

            <div className="border-t border-hairline bg-ground px-5 py-4 text-center font-mono text-label-sm uppercase tracking-[0.18em] text-muted sm:px-8">
              End of plate {CASE_STUDY.plate} — {CASE_STUDY.title}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
