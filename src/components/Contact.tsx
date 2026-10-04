import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, Lock, Mail, Send } from 'lucide-react'
import { GithubMark, LinkedinMark } from './BrandIcons'
import { CONTACT_TOPICS, IDENTITY } from '../data/portfolio'
import { EASE, Reveal, ScaleReveal } from './Reveal'
import { SectionHeader } from './SectionHeader'

const COORDINATES = [
  { icon: Mail, label: IDENTITY.email, href: `mailto:${IDENTITY.email}` },
  { icon: GithubMark, label: IDENTITY.github, href: IDENTITY.githubUrl },
  { icon: LinkedinMark, label: IDENTITY.linkedin, href: IDENTITY.linkedinUrl },
]

const fieldClass =
  'w-full border border-hairline bg-plate px-4 py-3 text-body-md text-ink placeholder:text-muted/70 transition-colors duration-200 focus:border-ink focus:outline-none'

export default function Contact() {
  const reduce = useReducedMotion()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [topics, setTopics] = useState<string[]>(['Project inquiry'])

  const toggleTopic = (topic: string) =>
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    )

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')

    // Web3Forms: JSON POST to the public submit endpoint, with the access key
    // injected at build time via VITE_WEB3FORMS_KEY (set in the Netlify UI).
    // 2xx marks it sent; a missing key, non-2xx reply, or network failure all
    // land in the catch below and raise the existing error banner + mailto
    // fallback. `reason` carries the topic chips; the honeypot value is passed
    // as Web3Forms' `botcheck` spam field.
    const data = new FormData(e.currentTarget)
    const field = (name: string) => String(data.get(name) ?? '')
    const name = field('name')
    const body = JSON.stringify({
      access_key: import.meta.env.VITE_WEB3FORMS_KEY,
      name,
      email: field('email'),
      reason: topics.join(', '),
      message: field('message'),
      subject: `Portfolio contact from ${name}`,
      from_name: 'Portfolio Contact Form',
      botcheck: field('bot-field'),
    })

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('sent')
      window.setTimeout(() => setStatus('idle'), 4200)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-12">
        <SectionHeader
          plate="05"
          kicker="Dispatch Intake"
          title={
            <>
              Let’s build and ship
              <br className="hidden sm:block" /> something reliable.
            </>
          }
          description="Tell me about your product, infrastructure, or delivery pipeline. Let’s eliminate deployment anxiety and streamline operations together."
        />

        <ScaleReveal className="mt-10 border border-hairline bg-plate">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* ------------ briefing column ------------ */}
            <div className="border-b border-hairline p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
              <Reveal x={-20}>
                <p className="text-body-lg leading-relaxed text-muted">
                  Currently taking on platform engineering and DevSecOps engagements for teams that
                  need their release train to be boring — in the best possible way.
                </p>
              </Reveal>

              <Reveal delay={0.08} x={-20}>
                <div className="mt-7 border border-hairline bg-ground p-5">
                  <span className="block font-mono text-label-sm font-semibold uppercase tracking-[0.18em] text-ink">
                    Direct coordinates
                  </span>

                  <div className="mt-4 space-y-1">
                    {COORDINATES.map(({ icon: Icon, label, href }) => (
                      <a
                        key={label}
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 border-b border-hairline py-2.5 last:border-b-0"
                      >
                        <span className="flex h-8 w-8 items-center justify-center border border-hairline-2 bg-plate text-ink transition-colors duration-300 group-hover:border-terracotta group-hover:bg-terracotta group-hover:text-plate">
                          <Icon className="h-4 w-4" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 break-all font-mono text-label-md text-ink transition-colors group-hover:text-terracotta">
                          {label}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.14} x={-20}>
                <p className="mt-5 flex items-start gap-2 font-mono text-label-sm uppercase leading-relaxed tracking-[0.12em] text-muted">
                  <Lock className="mt-px h-3.5 w-3.5 shrink-0 text-terracotta" strokeWidth={2} />
                  Encrypted channels available via GPG key upon inquiry
                </p>
              </Reveal>
            </div>

            {/* ------------ form column ------------ */}
            <div className="p-6 sm:p-8 lg:col-span-7">
              <AnimatePresence mode="wait">
                {status === 'sent' ? (
                  <motion.div
                    key="sent"
                    initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.96, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: -1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="flex h-full min-h-[420px] flex-col items-center justify-center border-2 border-patina bg-patina/5 p-8 text-center"
                  >
                    <span className="flex h-14 w-14 items-center justify-center border-2 border-patina text-patina">
                      <Check className="h-7 w-7" strokeWidth={2.5} />
                    </span>
                    <p className="mt-5 font-display text-2xl font-semibold text-ink">
                      Transmission received
                    </p>
                    <p className="mt-2 max-w-sm text-body-sm text-muted">
                      Your message is logged against dispatch intake and answered within one
                      business day.
                    </p>
                    <span className="mt-6 border border-patina px-3 py-1.5 font-mono text-label-sm uppercase tracking-[0.18em] text-patina">
                      SEC::SIGNED-OFF ✓
                    </span>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={onSubmit}
                    initial={false}
                    exit={{ opacity: 0 }}
                    className="space-y-5"
                  >
                    {/* Kept in sync with the hidden detection form in index.html. */}
                    <input type="hidden" name="form-name" value="contact" />
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="block font-mono text-label-md font-semibold uppercase tracking-[0.16em] text-ink"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          placeholder="e.g. Elena Rostova"
                          className={fieldClass}
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="block font-mono text-label-md font-semibold uppercase tracking-[0.16em] text-ink"
                        >
                          Email
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="elena@company.org"
                          className={fieldClass}
                        />
                      </div>
                    </div>

                    <fieldset>
                      <legend className="mb-2 font-mono text-label-md font-semibold uppercase tracking-[0.16em] text-ink">
                        Reason for dispatch
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {CONTACT_TOPICS.map((topic) => {
                          const checked = topics.includes(topic)
                          return (
                            <motion.button
                              key={topic}
                              type="button"
                              onClick={() => toggleTopic(topic)}
                              aria-pressed={checked}
                              whileTap={{ scale: 0.96 }}
                              className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-label-sm uppercase tracking-[0.12em] transition-colors duration-200 ${
                                checked
                                  ? 'border-ink bg-ink text-plate'
                                  : 'border-hairline bg-ground text-muted hover:border-ink hover:text-ink'
                              }`}
                            >
                              <span
                                className={`flex h-3.5 w-3.5 items-center justify-center border ${
                                  checked ? 'border-plate' : 'border-hairline-2'
                                }`}
                              >
                                {checked && (
                                  <span className="text-[9px] leading-none font-semibold">✕</span>
                                )}
                              </span>
                              {topic}
                            </motion.button>
                          )
                        })}
                      </div>
                    </fieldset>

                    <div className="space-y-2">
                      <label
                        htmlFor="message"
                        className="block font-mono text-label-md font-semibold uppercase tracking-[0.16em] text-ink"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        placeholder="Describe your architecture requirements, infrastructure bottlenecks, or engineering roadmap…"
                        className={`${fieldClass} resize-none`}
                      />
                    </div>

                    {/* Honeypot: invisible to people, tempting to bots.
                        Netlify drops the submission if it is filled in. */}
                    <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
                      <label htmlFor="bot-field">Do not fill this out</label>
                      <input id="bot-field" name="bot-field" type="text" tabIndex={-1} autoComplete="off" />
                    </div>

                    {status === 'error' && (
                      <p role="alert" className="border border-terracotta bg-terracotta/5 px-4 py-3 text-body-sm text-ink">
                        Dispatch failed — the intake endpoint did not accept the message. Please
                        email{' '}
                        <a className="underline underline-offset-2 hover:text-terracotta" href={`mailto:${IDENTITY.email}`}>
                          {IDENTITY.email}
                        </a>{' '}
                        directly.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="stamp stamp-accent inline-flex items-center gap-2 border border-terracotta bg-terracotta px-7 py-3.5 font-mono text-label-md font-medium uppercase tracking-[0.16em] text-plate disabled:cursor-wait disabled:opacity-70"
                      >
                        {status === 'sending' ? 'Sending…' : 'Send message'}
                        <Send className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <span className="font-mono text-label-sm uppercase tracking-[0.14em] text-muted">
                        Avg. reply · 6h 12m
                      </span>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </ScaleReveal>
      </div>
    </section>
  )
}
