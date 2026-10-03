import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Check } from 'lucide-react'
import { PIPELINE_LOG, PIPELINE_STAGES } from '../data/portfolio'
import { useSectionInView } from '../lib/hooks'
import { EASE, ScaleReveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

const STEP_MS = 780

/** DevSecOps topology: a CI/CD pipeline that runs dynamically and reacts to scroll. */
export default function Pipeline() {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const { ref, inView } = useSectionInView<HTMLDivElement>(0.3)
  const [step, setStep] = useState(0)
  const total = PIPELINE_STAGES.length

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Advanced scroll metric: progress bar scale matching section scroll position
  const scrollRailWidth = useTransform(scrollYProgress, [0.2, 0.8], ['0%', '100%'])

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setStep(total)
      return
    }
    const id = window.setInterval(() => setStep((s) => (s >= total + 1 ? 0 : s + 1)), STEP_MS)
    return () => window.clearInterval(id)
  }, [inView, reduce, total])

  const visibleLogs = Math.max(0, Math.min(PIPELINE_LOG.length, step))

  return (
    <section ref={sectionRef} id="pipeline" className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-12">
        <SectionHeader
          plate="03"
          kicker="Delivery Topology"
          title="The pipeline, drawn to scale"
          description="Every artifact travels the same gated route: commit, build, test, scan, canary, observe. Nothing reaches production without a signature."
          meta={
            <div className="flex items-center gap-2 border border-hairline-2 bg-plate px-3 py-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  inView ? 'animate-pip bg-terracotta' : 'bg-hairline-2'
                }`}
              />
              <span className="font-mono text-label-sm uppercase tracking-[0.16em] text-muted">
                {inView ? 'Runner active · eu-west-02' : 'Runner idle'}
              </span>
            </div>
          }
        />

        <ScaleReveal>
          <div
            ref={ref}
            className="blueprint relative mt-10 border border-hairline-2 bg-plate p-5 sm:p-8"
          >
            {/* registration crosshairs */}
            <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-ink/35" />
            <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-ink/35" />
            <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-ink/35" />
            <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-ink/35" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4 font-mono text-label-sm uppercase tracking-[0.16em] text-muted">
              <span className="text-ink">Fig. 4A — Release train</span>
              <span>REF: {`REL-2026.04.12`} · SIGNED COSIGN</span>
            </div>

            {/* Scroll Progress hairline along top of pipeline */}
            <div className="relative mb-6 h-0.5 w-full bg-hairline-2">
              <motion.div
                className="h-full bg-terracotta"
                style={{ width: reduce ? '100%' : scrollRailWidth }}
              />
            </div>

            {/* stage rail */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6 lg:gap-y-0">
              {PIPELINE_STAGES.map((stage, i) => {
                const Icon = stage.icon
                const done = step > i
                const active = step === i || step === total

                return (
                  <motion.div
                    key={stage.code}
                    initial={reduce ? false : { opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="relative flex items-center"
                  >
                    <motion.div
                      animate={{
                        borderColor: done ? 'var(--color-patina)' : active ? 'var(--color-terracotta)' : 'var(--color-hairline)',
                        backgroundColor: done ? 'rgba(46,111,94,0.07)' : active ? 'rgba(225,90,59,0.08)' : 'transparent',
                        scale: active ? 1.02 : 1,
                      }}
                      transition={{ duration: 0.4 }}
                      className="relative z-10 flex w-full flex-col gap-2 border bg-plate p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-7 w-7 items-center justify-center border transition-colors duration-300 ${
                            done
                              ? 'border-patina text-patina'
                              : active
                                ? 'border-terracotta text-terracotta'
                                : 'border-hairline-2 text-muted'
                          }`}
                        >
                          {done ? (
                            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                          ) : (
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                          )}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.14em] text-muted">
                          {stage.code}
                        </span>
                      </div>

                      <div>
                        <p className="font-mono text-label-md font-semibold uppercase tracking-[0.1em] text-ink">
                          {stage.label}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] lowercase tracking-[0.08em] text-muted">
                          {stage.detail}
                        </p>
                      </div>

                      {active && (
                        <span className="absolute -right-1 -top-1 h-2 w-2 animate-pip bg-terracotta" />
                      )}
                    </motion.div>

                    {/* connector across the gutter */}
                    {i < PIPELINE_STAGES.length - 1 && (
                      <div className="absolute left-full top-1/2 z-0 hidden h-px w-[calc(100%+1rem)] -translate-y-1/2 bg-hairline-2 lg:block">
                        <motion.span
                          className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-terracotta"
                          initial={false}
                          animate={
                            step > i
                              ? { left: ['0%', '100%'], opacity: 1 }
                              : { left: '0%', opacity: 0 }
                          }
                          transition={{ duration: 0.7, ease: 'easeInOut' }}
                        />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* terminal inset */}
            <div className="mt-8 border border-hairline bg-ground p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between font-mono text-label-sm uppercase tracking-[0.16em] text-muted">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-terracotta" />
                  pipeline.log
                </span>
                <span className="tnum">{String(visibleLogs).padStart(2, '0')} / {PIPELINE_LOG.length}</span>
              </div>

              <div className="min-h-[150px] space-y-1.5 font-mono text-[12px] leading-relaxed sm:text-[13px]">
                <AnimatePresence initial={false}>
                  {PIPELINE_LOG.slice(0, visibleLogs).map((line, i) => (
                    <motion.p
                      key={line}
                      initial={reduce ? false : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className={
                        line.startsWith('✓')
                          ? 'text-patina'
                          : line.startsWith('$')
                            ? 'text-ink'
                            : 'text-muted'
                      }
                    >
                      {line}
                      {i === visibleLogs - 1 && (
                        <span className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-blink bg-terracotta" />
                      )}
                    </motion.p>
                  ))}
                </AnimatePresence>

                {visibleLogs === 0 && (
                  <p className="text-muted">
                    awaiting signed commit
                    <span className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-blink bg-terracotta" />
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-mono text-label-sm uppercase tracking-[0.16em] text-muted">
              <span>Blueprint // DevSecOps topology</span>
              <span className="text-patina">ENV::US-EAST-01 · AIRGAPPED</span>
            </div>
          </div>
        </ScaleReveal>
      </div>
    </section>
  )
}
