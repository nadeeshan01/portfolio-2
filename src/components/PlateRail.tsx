import { motion, useMotionValueEvent } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { useState } from 'react'
import { NAV_ITEMS } from '../data/portfolio'
import { useActiveSection } from '../lib/hooks'

const SECTION_IDS = NAV_ITEMS.map((item) => item.id)

/** Fixed left margin ledger — running plate indicator for large screens. */
export default function PlateRail({ progress }: { progress: MotionValue<number> }) {
  const active = useActiveSection(SECTION_IDS)
  const [pct, setPct] = useState(0)
  const current = NAV_ITEMS.find((item) => item.id === active) ?? NAV_ITEMS[0]!

  useMotionValueEvent(progress, 'change', (v) => {
    const next = Math.round(Math.min(1, Math.max(0, v)) * 100)
    setPct((prev) => (prev === next ? prev : next))
  })

  return (
    <div className="pointer-events-none fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <div className="flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active
            return (
              <motion.span
                key={item.id}
                animate={{
                  scale: isActive ? 1.4 : 1,
                  backgroundColor: isActive ? 'var(--color-terracotta)' : 'transparent',
                  borderColor: isActive ? 'var(--color-terracotta)' : 'var(--color-hairline-2)',
                }}
                transition={{ duration: 0.35 }}
                className="h-2 w-2 border"
              />
            )
          })}
        </div>

        <div className="relative h-28 w-px bg-hairline-2 overflow-hidden">
          <motion.div
            className="w-full bg-terracotta"
            style={{ height: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 140, damping: 25 }}
          />
        </div>

        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="vertical-rl font-mono text-label-sm uppercase tracking-[0.28em] text-muted"
        >
          Plate {current.plate} — {current.label}
        </motion.div>

        <span className="font-mono text-[10px] font-semibold tnum text-terracotta">
          {String(pct).padStart(3, '0')}%
        </span>
      </div>
    </div>
  )
}
