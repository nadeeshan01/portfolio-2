import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion'
import type { ReactNode } from 'react'

export const EASE = [0.16, 1, 0.3, 1] as const
export const SPRING_EASE = { type: 'spring', stiffness: 120, damping: 20 } as const

type RevealProps = {
  children: ReactNode
  delay?: number
  y?: number
  x?: number
  scale?: number
  duration?: number
  className?: string
  once?: boolean
}

/** Standard editorial scroll reveal (y-shift + fade) with customizable directions. */
export function Reveal({
  children,
  delay = 0,
  y = 30,
  x = 0,
  scale = 1,
  duration = 0.8,
  className,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 1 } : { opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Advanced Scale + Fade-in scroll reveal for featured cards and hero blocks. */
export function ScaleReveal({
  children,
  delay = 0,
  className,
  scaleFrom = 0.94,
}: {
  children: ReactNode
  delay?: number
  className?: string
  scaleFrom?: number
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: scaleFrom, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Container that staggers its direct children on scroll entry. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  y = 28,
  scale = 0.97,
}: {
  children: ReactNode
  className?: string
  y?: number
  scale?: number
}) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y, scale },
        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.75, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}

/** ADVANCED: Parallax wrapper component that shifts speed relative to scroll position. */
export function Parallax({
  children,
  speed = 0.2, // speed multiplier (-0.5 to 0.5 works best)
  className = '',
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Map scroll progress (0 -> 1) to vertical translate px (-50px -> +50px depending on speed)
  const yRange = speed * 150
  const rawY = useTransform(scrollYProgress, [0, 1], [-yRange, yRange])
  const smoothY = useSpring(rawY, { stiffness: 100, damping: 25, mass: 0.2 })

  if (reduce) return <div className={className}>{children}</div>

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div style={{ y: smoothY }}>
        {children}
      </motion.div>
    </div>
  )
}

/** ADVANCED: Scroll-driven mask reveal for headline text lines. */
export function TextLineReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={reduce ? { y: 0 } : { y: '100%', opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/** Hairline rule that draws itself in from left to right when scrolled into view. */
export function DrawRule({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={`h-px w-full origin-left bg-hairline ${className}`}
      initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    />
  )
}
