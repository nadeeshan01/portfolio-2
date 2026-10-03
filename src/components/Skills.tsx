import { motion, useReducedMotion } from 'framer-motion'
import { SKILL_CARDS } from '../data/portfolio'
import { Parallax, Reveal, Stagger, StaggerItem } from './Reveal'
import { SectionHeader } from './SectionHeader'

/** Delivery cadence sparkline that draws itself in on scroll view. */
function Sparkline() {
  const reduce = useReducedMotion()

  return (
    <div className="hidden items-center gap-4 border border-hairline bg-plate px-4 py-2.5 sm:flex">
      <div className="space-y-0.5">
        <span className="block font-mono text-label-sm uppercase tracking-[0.16em] text-muted">
          Delivery cadence
        </span>
        <span className="block font-mono text-label-md font-semibold text-ink">Continuous CD</span>
      </div>
      <svg viewBox="0 0 84 26" className="h-7 w-[84px] overflow-visible" aria-hidden>
        <motion.path
          d="M2 20 L18 15 L34 21 L48 9 L64 13 L82 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          className="text-terracotta"
          initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
        <rect x="79" y="0" width="6" height="6" className="fill-terracotta" />
      </svg>
    </div>
  )
}

export default function Skills() {
  const reduce = useReducedMotion()

  return (
    <section id="skills" className="w-full border-y border-hairline bg-ground-deep py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-12">
        <SectionHeader
          plate="02"
          kicker="Capabilities"
          title="Skills & technical stack"
          description="Technologies and disciplines I work with across the delivery pipeline — engineered for durability, zero downtime, and provable safety."
          meta={<Sparkline />}
        />

        <Stagger className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SKILL_CARDS.map((card, i) => {
            const Icon = card.icon
            // Subtle alternating parallax speed for dynamic editorial depth on scroll
            const speed = i % 2 === 0 ? 0.06 : -0.04

            return (
              <StaggerItem
                key={card.index}
                className={card.span ? 'lg:col-span-2' : undefined}
              >
                <Parallax speed={speed} className="h-full">
                  <article
                    className={`group flex h-full flex-col justify-between border bg-plate p-6 transition-all duration-300 hover:border-ink hover:shadow-[4px_4px_0_0_var(--color-ink)] ${
                      card.accent ? 'border-terracotta/45' : 'border-hairline'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <motion.div
                          whileHover={{ scale: 1.06, rotate: 2 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className={`flex h-11 w-11 items-center justify-center border transition-colors duration-300 ${
                            card.accent
                              ? 'border-terracotta/50 text-terracotta group-hover:bg-terracotta group-hover:text-plate'
                              : 'border-hairline-2 text-ink group-hover:bg-ink group-hover:text-plate'
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.6} />
                        </motion.div>
                        <span
                          className={`font-mono text-label-sm uppercase tracking-[0.16em] ${
                            card.accent ? 'text-terracotta' : 'text-muted'
                          }`}
                        >
                          {card.index} // {card.stamp}
                        </span>
                      </div>

                      <h3 className="mt-5 font-display text-headline-sm font-medium tracking-tight text-ink">
                        {card.title}
                      </h3>
                      <p className="mt-1.5 text-body-sm leading-relaxed text-muted">{card.body}</p>
                    </div>

                    <ul className="mt-6 flex flex-wrap gap-2">
                      {card.tags.map((tag, tagIndex) => (
                        <motion.li
                          key={tag}
                          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + tagIndex * 0.04, duration: 0.4 }}
                          className="border border-hairline bg-ground px-2.5 py-1 font-mono text-label-md text-ink transition-colors duration-300 group-hover:border-hairline-2"
                        >
                          {tag}
                        </motion.li>
                      ))}
                    </ul>
                  </article>
                </Parallax>
              </StaggerItem>
            )
          })}
        </Stagger>

        <Reveal className="mt-8">
          <div className="dash-rule" />
        </Reveal>
      </div>
    </section>
  )
}
