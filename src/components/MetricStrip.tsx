import { METRIC_TICKS } from '../data/portfolio'

const toneClass = {
  ink: 'text-ink',
  terracotta: 'text-terracotta',
  patina: 'text-patina',
} as const

function Row({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden || undefined}>
      {METRIC_TICKS.map((tick) => (
        <span key={tick.label} className="flex items-center gap-2 whitespace-nowrap px-5">
          <span className="font-mono text-label-sm uppercase tracking-[0.14em] text-muted">
            {tick.label}
          </span>
          <span className={`font-mono text-label-md font-semibold tnum ${toneClass[tick.tone ?? 'ink']}`}>
            {tick.value}
          </span>
          <span className="text-hairline-2">|</span>
        </span>
      ))}
    </div>
  )
}

/** Top specimen strip — an infinite ledger ticker of live delivery metrics. */
export default function MetricStrip() {
  return (
    <div className="relative overflow-hidden border-b border-hairline bg-ground-deep">
      <div className="flex w-max animate-marquee">
        <Row />
        <Row ariaHidden />
      </div>

      {/* paper fade at both ends */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ground-deep to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ground-deep to-transparent" />
    </div>
  )
}
