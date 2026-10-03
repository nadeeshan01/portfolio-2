import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CASE_STUDY } from '../data/focusflow'
import { useSectionInView } from '../lib/hooks'

const ROWS = CASE_STUDY.flow
const STEP_MS = 950

/** Node card tone for the current playhead position. */
function tone(done: boolean, active: boolean) {
  if (done) return 'border-patina bg-patina/[0.05]'
  if (active) return 'border-terracotta bg-terracotta/[0.07]'
  return 'border-hairline bg-plate'
}

function chipTone(done: boolean, active: boolean) {
  if (done) return 'border-patina/50 text-patina'
  if (active) return 'border-terracotta/60 text-terracotta'
  return 'border-hairline-2 text-muted'
}

/** Dashed connector with a travelling registration mark. */
function Connector({ lit, delay, reduce }: { lit: boolean; delay: number; reduce: boolean | null }) {
  return (
    <div
      className="relative mx-auto h-9 w-px"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, var(--color-hairline-2) 0 4px, transparent 4px 9px)',
      }}
      aria-hidden
    >
      {lit && !reduce && (
        <span
          className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 animate-flow bg-terracotta"
          style={{ animationDelay: `${delay}s` }}
        />
      )}
    </div>
  )
}

export default function ArchitectureFlow() {
  const reduce = useReducedMotion()
  const { ref, inView } = useSectionInView<HTMLDivElement>(0.15)
  const [step, setStep] = useState(0)
  const total = ROWS.length

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setStep(total)
      return
    }
    const id = window.setInterval(
      () => setStep((s) => (s >= total + 1 ? 0 : s + 1)),
      STEP_MS,
    )
    return () => window.clearInterval(id)
  }, [inView, reduce, total])

  return (
    <div ref={ref} className="blueprint relative border border-hairline-2 bg-ground p-4 sm:p-7">
      {/* registration crosshairs */}
      <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-ink/35" />
      <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-ink/35" />
      <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-ink/35" />
      <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-ink/35" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4 font-mono text-label-sm uppercase tracking-[0.16em]">
        <span className="font-semibold text-ink">Fig. CS-1 — End-to-end delivery architecture</span>
        <span className="flex items-center gap-2 text-muted">
          <span
            className={`h-2 w-2 rounded-full ${
              inView && !reduce ? 'animate-pip bg-terracotta' : 'bg-hairline-2'
            }`}
          />
          {reduce ? 'Static view' : inView ? 'Flow running' : 'Flow paused'}
        </span>
      </div>

      <div className="flex flex-col items-stretch">
        {ROWS.map((row, i) => {
          const done = step > i
          const active = step === i || step === total
          const lit = step > i

          return (
            <div key={`${row.stage}-${i}`}>
              <div className="relative flex flex-wrap items-center justify-center gap-3 lg:pl-24">
                <span className="absolute left-0 top-1/2 hidden max-w-[86px] -translate-y-1/2 font-mono text-[10px] uppercase leading-tight tracking-[0.18em] text-muted lg:block">
                  {row.stage}
                </span>

                {row.nodes.map((node) => (
                  <motion.div
                    key={node.code}
                    animate={{
                      borderColor: done
                        ? 'var(--color-patina)'
                        : active
                          ? 'var(--color-terracotta)'
                          : 'var(--color-hairline)',
                    }}
                    transition={{ duration: 0.4 }}
                    className={`relative min-w-[210px] flex-1 border px-4 py-3 transition-colors duration-500 ${tone(
                      done,
                      active,
                    )} ${row.nodes.length === 1 ? 'max-w-md' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[10px] font-semibold transition-colors duration-300 ${
                          done
                            ? 'border-patina text-patina'
                            : active
                              ? 'border-terracotta text-terracotta'
                              : 'border-hairline-2 text-muted'
                        }`}
                      >
                        {node.code}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate font-mono text-label-md font-semibold uppercase tracking-[0.1em] text-ink">
                          {node.label}
                        </p>
                        {node.sub && (
                          <p className="mt-0.5 break-words font-mono text-[10px] leading-relaxed text-muted">
                            {node.sub}
                          </p>
                        )}
                      </div>

                      {active && (
                        <span className="absolute -right-1 -top-1 h-2 w-2 animate-pip bg-terracotta" />
                      )}
                    </div>

                    {node.chips && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-hairline pt-2.5">
                        {node.chips.map((c) => (
                          <span
                            key={c}
                            className={`border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors duration-500 ${chipTone(
                              done,
                              active,
                            )}`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* gaps in multi-node rows get their own connector */}
                {row.nodes.length > 1 && (
                  <span className="absolute left-1/2 top-1/2 hidden h-px w-8 -translate-x-1/2 -translate-y-1/2 bg-hairline-2 sm:block" />
                )}
              </div>

              {i < ROWS.length - 1 && <Connector lit={lit} delay={(i % 4) * 0.35} reduce={reduce} />}
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4 font-mono text-label-sm uppercase tracking-[0.16em] text-muted">
        <span>Blueprint // FocusFlow release train</span>
        <span className="text-terracotta">Git SHA → image digest → rollout history</span>
      </div>

      {/* key */}
      <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 border border-hairline-2" /> queued
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-terracotta" /> in flight
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-patina" /> verified
        </span>
      </div>
    </div>
  )
}
