import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, Mail, ChevronDown } from 'lucide-react'
import { GithubMark, LinkedinMark } from './BrandIcons'
import {
  HERO_SUMMARY,
  HERO_TAGS,
  IDENTITY,
  TYPEWRITER_WORDS,
} from '../data/portfolio'
import { useTypewriter } from '../lib/hooks'
import IdPass from './IdPass'
import { EASE, Parallax } from './Reveal'

const WORDS = TYPEWRITER_WORDS

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

const parent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

export default function Hero() {
  const reduce = useReducedMotion()
  const typed = useTypewriter(WORDS)
  const heroRef = useRef<HTMLElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Advanced scroll transformations: parallax opacity & scale shift on background blueprint
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [0.6, 0])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.05])
  const scrollPromptOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  return (
    <section ref={heroRef} id="home" className="relative w-full overflow-hidden">
      {/* Parallax Blueprint grid, feathered at the edges */}
      <motion.div
        className="blueprint pointer-events-none absolute inset-0"
        style={{
          opacity: reduce ? 0.6 : bgOpacity,
          scale: reduce ? 1 : bgScale,
          maskImage: 'radial-gradient(ellipse 70% 62% at 50% 42%, #000 25%, transparent 76%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 62% at 50% 42%, #000 25%, transparent 76%)',
        }}
      />

      <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-10 px-5 pt-6 pb-12 lg:grid-cols-12 lg:gap-10 lg:px-12 lg:pt-8 lg:pb-16">
        {/* ---------------- Left plate ---------------- */}
        <motion.div
          className="lg:col-span-7"
          variants={reduce ? undefined : parent}
          initial={reduce ? undefined : 'hidden'}
          animate={reduce ? undefined : 'show'}
        >
          <motion.div variants={rise}>
            <span className="inline-flex items-center gap-2 border border-hairline-2 bg-plate px-3 py-1">
              <span className="h-2 w-2 animate-pip rounded-full bg-patina" />
              <span className="font-mono text-label-sm font-semibold uppercase tracking-[0.18em] text-ink">
                + {IDENTITY.availability}
              </span>
            </span>
          </motion.div>

          <motion.div variants={rise} className="mt-6">
            <h1 className="flex min-h-[132px] flex-wrap items-center font-display text-display-m font-semibold leading-[1.08] tracking-tight text-ink lg:min-h-[168px] lg:text-display">
              <span>{typed}</span>
              <span
                aria-hidden
                className="ml-1.5 inline-block h-[0.82em] w-[4px] translate-y-[0.06em] bg-terracotta animate-blink"
              />
            </h1>

            <p className="pt-1 font-mono text-label-md font-semibold uppercase tracking-[0.26em] text-terracotta">
              {IDENTITY.role}
            </p>
          </motion.div>

          <motion.p
            variants={rise}
            className="mt-5 max-w-xl border-l border-hairline-2 pl-4 text-body-md leading-relaxed text-muted"
          >
            {HERO_SUMMARY}
          </motion.p>

          <motion.ul variants={rise} className="mt-6 flex flex-wrap gap-2">
            {HERO_TAGS.map((tag) => (
              <li
                key={tag}
                className="border border-hairline-2 bg-plate px-2.5 py-1 font-mono text-label-sm uppercase tracking-[0.12em] text-muted transition-colors duration-300 hover:border-ink hover:text-ink"
              >
                {tag}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#projects"
              className="stamp stamp-accent inline-flex items-center gap-2 border border-terracotta bg-terracotta px-6 py-3.5 font-mono text-label-md font-medium uppercase tracking-[0.16em] text-plate"
            >
              View projects
              <ArrowDown className="h-4 w-4" strokeWidth={2} />
            </a>
            <a
              href="#contact"
              className="stamp inline-flex items-center gap-2 border border-ink bg-ink px-6 py-3.5 font-mono text-label-md font-medium uppercase tracking-[0.16em] text-plate"
            >
              Contact me
              <Mail className="h-4 w-4" strokeWidth={2} />
            </a>
          </motion.div>

          <motion.div
            variants={rise}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-label-md text-muted"
          >
            <a
              href={`mailto:${IDENTITY.email}`}
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-terracotta"
            >
              <Mail className="h-3.5 w-3.5 text-terracotta transition-transform duration-300 group-hover:-translate-y-0.5" />
              {IDENTITY.email}
            </a>
            <span className="text-hairline-2">·</span>
            <a
              href={IDENTITY.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-terracotta"
            >
              <GithubMark className="h-3.5 w-3.5 text-terracotta transition-transform duration-300 group-hover:-translate-y-0.5" />
              {IDENTITY.github}
            </a>
            <span className="text-hairline-2">·</span>
            <a
              href={IDENTITY.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 transition-colors hover:text-terracotta"
            >
              <LinkedinMark className="h-3.5 w-3.5 shrink-0 text-terracotta transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="break-all">{IDENTITY.linkedin}</span>
            </a>
          </motion.div>
        </motion.div>

        {/* ---------------- Right plate with Parallax ---------------- */}
        <div className="flex justify-center lg:col-span-5 lg:justify-end">
          <Parallax speed={0.12} className="w-full flex justify-center lg:justify-end">
            <IdPass />
          </Parallax>
        </div>
      </div>

      {/* Scroll indicator prompt */}
      <motion.div
        style={{ opacity: reduce ? 1 : scrollPromptOpacity }}
        className="hidden lg:flex justify-center pb-4"
      >
        <a
          href="#skills"
          className="group flex items-center gap-2 border border-hairline-2 bg-plate px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:border-ink hover:text-ink"
        >
          <span>Scroll // Discover</span>
          <ChevronDown className="h-3.5 w-3.5 text-terracotta transition-transform duration-300 group-hover:translate-y-0.5" />
        </a>
      </motion.div>
    </section>
  )
}
