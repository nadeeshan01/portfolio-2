import type { ReactNode } from 'react'
import { DrawRule, Reveal } from './Reveal'

type SectionHeaderProps = {
  plate: string
  kicker: string
  title: ReactNode
  description: string
  meta?: ReactNode
}

/** Ledger section header: plate index, kicker, display title, rule. */
export function SectionHeader({ plate, kicker, title, description, meta }: SectionHeaderProps) {
  return (
    <div className="w-full">
      <Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 font-mono text-label-sm uppercase">
              <span className="font-semibold text-terracotta">Ledger Section {plate}</span>
              <span className="text-hairline-2">/</span>
              <span className="text-muted">{kicker}</span>
            </div>

            <h2 className="mt-3 font-display text-headline-lg-m font-semibold tracking-tight text-ink lg:text-headline-lg">
              {title}
            </h2>

            <p className="mt-3 max-w-xl text-body-md text-muted">{description}</p>
          </div>

          {meta ? <div className="shrink-0">{meta}</div> : null}
        </div>
      </Reveal>

      <DrawRule className="mt-7" />
    </div>
  )
}

/** Small monospaced stamped chip used for metadata. */
export function Chip({
  children,
  tone = 'ink',
  className = '',
}: {
  children: ReactNode
  tone?: 'ink' | 'terracotta' | 'patina' | 'muted'
  className?: string
}) {
  const tones = {
    ink: 'border-hairline-2 text-ink',
    muted: 'border-hairline text-muted',
    terracotta: 'border-terracotta/60 text-terracotta',
    patina: 'border-patina/55 text-patina',
  } as const

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-label-sm uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
