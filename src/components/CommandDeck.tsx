import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { CASE_STUDY } from '../data/focusflow'
import { EASE } from './Reveal'
import type { CommandBlock } from '../data/focusflow'

const TABS: CommandBlock[] = CASE_STUDY.commands

function lineClass(kind: CommandBlock['lines'][number]['kind']) {
  if (kind === 'out') return 'text-[#8fd3bf]'
  if (kind === 'cmt') return 'text-[#8b857a]'
  return 'text-plate'
}

export default function CommandDeck() {
  const [activeId, setActiveId] = useState(TABS[0]!.id)
  const [copied, setCopied] = useState(false)
  const active = TABS.find((t) => t.id === activeId) ?? TABS[0]!

  const copy = async () => {
    const text = active.lines
      .filter((l) => l.kind === 'cmd')
      .map((l) => l.text)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div>
      {/* tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Command examples">
        {TABS.map((tab) => {
          const on = tab.id === active.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActiveId(tab.id)}
              className={`border px-3 py-1.5 font-mono text-label-sm uppercase tracking-[0.14em] transition-colors duration-200 ${
                on
                  ? 'border-ink bg-ink text-plate'
                  : 'border-hairline-2 bg-plate text-muted hover:border-ink hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <p className="mt-3 font-mono text-label-sm uppercase tracking-[0.14em] text-muted">
        {active.hint}
      </p>

      {/* terminal */}
      <div className="mt-3 border border-ink bg-ink">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-plate/70">
            <span className="h-2 w-2 bg-terracotta" />
            terminal — cloudpath-focusflow
          </span>

          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1.5 border border-white/20 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-plate/80 transition-colors hover:border-terracotta hover:text-terracotta"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" strokeWidth={2.5} /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" strokeWidth={2} /> Copy
              </>
            )}
          </button>
        </div>

        <div className="min-h-[236px] overflow-x-auto p-4 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
              }}
              className="space-y-1.5 font-mono text-[12px] leading-relaxed sm:text-[13px]"
            >
              {active.lines.map((line, i) => (
                <motion.p
                  key={`${active.id}-${i}`}
                  variants={{
                    hidden: { opacity: 0, x: -8 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
                  }}
                  className={`whitespace-pre-wrap break-words ${lineClass(line.kind)}`}
                >
                  {line.kind === 'cmd' && <span className="mr-2 text-terracotta">$</span>}
                  {line.kind === 'cmt' && <span className="mr-2 text-terracotta">#</span>}
                  {line.text}
                  {i === active.lines.length - 1 && (
                    <span className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-blink bg-terracotta align-middle" />
                  )}
                </motion.p>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
