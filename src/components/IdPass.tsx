import { useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { IDENTITY } from '../data/portfolio'
import { EASE } from './Reveal'

const PORTRAIT_SRC =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBgVHS6KUAWJUYNJkN00-Sq6TBAl7Nr-dhlUko1hvDZ6vO1yWYSrJsjgIrcet2HCjMpaH4i3NzKfLITmMosBXn8ASlqkv3LnEZFvA38w_SKSroLW9lRaXfVG9n9nG_lO-8nUFYK5GVKYuM3YY6wHEoHyb6xqEAJhEagQPSrrdC8xgO_TXPkB9TF7IfXxDkkoxC-uBnJAYB5-TAe-Tnsk36YGn64qsHXg_CP8FD_n5_E6qOpVKfK9pPIaqdY15jzL_6LI6M'

/** Engraved stand-in plate used if the portrait fails to load. */
function PortraitFallback() {
  return (
    <svg viewBox="0 0 200 210" className="h-full w-full" role="img" aria-label="Portrait on file">
      <rect width="200" height="210" fill="#f4ebdd" />
      <g stroke="#141414" strokeOpacity="0.12" strokeWidth="1">
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={i} x1="0" y1={i * 15} x2="200" y2={i * 15 - 40} />
        ))}
      </g>
      <g fill="#141414">
        <circle cx="100" cy="86" r="38" fillOpacity="0.82" />
        <path d="M28 210c0-42 32-70 72-70s72 28 72 70z" fillOpacity="0.82" />
      </g>
      <text
        x="100"
        y="196"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="9"
        letterSpacing="2.4"
        fill="#fff7ea"
      >
        PORTRAIT // ON FILE
      </text>
    </svg>
  )
}

export default function IdPass() {
  const reduce = useReducedMotion()
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [failed, setFailed] = useState(false)

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-12, 12]), {
    stiffness: 160,
    damping: 18,
  })
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [9, -9]), {
    stiffness: 160,
    damping: 18,
  })

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    px.set((e.clientX - rect.left) / rect.width - 0.5)
    py.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const onPointerLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 44 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.45, ease: EASE }}
      className="flex w-full flex-col items-center"
    >
      <div className={`${reduce ? '' : 'animate-sway'} -mt-6 lg:-mt-8`} style={{ transformOrigin: '50% 0%' }}>
        {/* Lanyard strap */}
        <div className="relative mx-auto flex h-24 w-7 flex-col items-center justify-center overflow-hidden border-x border-black/50 bg-[#181818]">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg,#262626,#262626 2px,#151515 2px,#151515 6px)',
            }}
          />
          <span className="relative rotate-90 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.28em] text-[#7c7c7c]">
            Staff Pass // ID Card
          </span>
        </div>

        {/* Metal clip */}
        <div className="relative z-10 -mt-1 flex flex-col items-center">
          <div className="flex h-5 w-6 items-center justify-center border border-black/50 bg-gradient-to-b from-[#9aa0a5] via-[#5c6166] to-[#34383c]">
            <span className="h-1.5 w-3 bg-[#1b1c1e]" />
          </div>
          <div className="h-6 w-3 border-x border-black/50 bg-gradient-to-r from-[#595e63] via-[#b8bcc1] to-[#4c5054]" />
          <div className="h-3 w-9 border border-black/60 bg-gradient-to-b from-[#404347] to-[#1f2123]" />
        </div>

        {/* The pass itself */}
        <motion.div
          ref={cardRef}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          style={{ rotateX, rotateY, transformPerspective: 1100 }}
          className="relative z-20 -mt-1 w-[300px] max-w-full border border-ink/20 bg-plate p-4 shadow-[0_22px_44px_-18px_rgba(20,20,20,0.55)] sm:w-[320px]"
        >
          {/* die-cut slot */}
          <div className="mx-auto mb-3 h-2.5 w-12 border border-ink/20 bg-ground" />

          <div className="flex items-center justify-between border-b border-hairline pb-2 font-mono text-label-sm uppercase">
            <span className="font-semibold tracking-[0.18em] text-terracotta">Staff // Pass</span>
            <span className="border border-hairline-2 px-1.5 py-0.5 text-[9px] tracking-[0.1em] text-ink">
              NO. 2026-DEV
            </span>
          </div>

          {/* Portrait */}
          <div className="relative mt-3 aspect-[1/1.02] overflow-hidden border border-hairline-2 bg-ground">
            {failed ? (
              <PortraitFallback />
            ) : (
              <img
                src={PORTRAIT_SRC}
                alt={`${IDENTITY.name} — staff pass portrait`}
                loading="lazy"
                onError={() => setFailed(true)}
                className="h-full w-full object-cover grayscale contrast-[1.08] brightness-[0.97]"
                style={{ objectPosition: '50% 14%' }}
              />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-white">
              <span className="font-medium">ID: KN-2026</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pip rounded-full bg-[#4ade80]" />
                Verified
              </span>
            </div>
          </div>

          {/* Identity block */}
          <div className="pt-3 text-center">
            <h4 className="font-display text-lg font-semibold tracking-tight text-ink">
              {IDENTITY.name}
            </h4>
            <p className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
              {IDENTITY.role}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-hairline pt-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-terracotta" />
              <span className="font-semibold text-ink">Active pass</span>
            </span>
            <span>Zero-trust secure</span>
          </div>
        </motion.div>
      </div>

      <div className="mt-3 flex w-full max-w-[320px] items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        <span>Specimen // Lanyard Pass</span>
        <span>SEC::CLEAR-01</span>
      </div>
    </motion.div>
  )
}
