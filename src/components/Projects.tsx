import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BookOpen, ExternalLink } from 'lucide-react'
import { GithubMark } from './BrandIcons'
import { PROJECTS, IDENTITY } from '../data/portfolio'
import { useCountUp } from '../lib/hooks'
import { Parallax, Stagger, StaggerItem } from './Reveal'
import { SectionHeader } from './SectionHeader'
import CaseStudyModal from './CaseStudyModal'
import type { Project, ProjectMetric } from '../data/portfolio'

function Metric({ metric }: { metric: ProjectMetric }) {
  const { ref, display } = useCountUp(metric.value, metric.decimals ?? 0)

  return (
    <div className="flex items-baseline justify-between border-b border-hairline py-1.5 last:border-b-0">
      <span className="font-mono text-label-sm uppercase tracking-[0.14em] text-muted">
        {metric.label}
      </span>
      <span ref={ref} className="font-mono text-label-md font-semibold tnum text-ink">
        {display}
        {metric.suffix ?? ''}
      </span>
    </div>
  )
}

function Actions({
  project,
  onOpenCase,
}: {
  project: Project
  onOpenCase: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {project.caseStudy && (
        <button
          type="button"
          onClick={onOpenCase}
          className="stamp stamp-accent inline-flex items-center gap-1.5 border border-terracotta bg-terracotta px-4 py-2 font-mono text-label-md uppercase tracking-[0.14em] text-plate"
        >
          Open case study
          <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}

      {!project.caseStudy && (
        <a
          href="#contact"
          className="stamp stamp-accent inline-flex items-center gap-1.5 border border-terracotta bg-terracotta px-4 py-2 font-mono text-label-md uppercase tracking-[0.14em] text-plate"
        >
          Live demo
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
        </a>
      )}

      <a
        href={project.repoUrl ?? IDENTITY.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="stamp inline-flex items-center gap-1.5 border border-hairline-2 bg-ground px-4 py-2 font-mono text-label-md uppercase tracking-[0.14em] text-ink hover:border-ink"
      >
        Repository
        <GithubMark className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}

export default function Projects() {
  const reduce = useReducedMotion()
  const [caseOpen, setCaseOpen] = useState(false)
  const closeCase = () => setCaseOpen(false)

  return (
    <section id="projects" className="w-full border-y border-hairline bg-ground-deep py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-12">
        <SectionHeader
          plate="04"
          kicker="Dispatched Work"
          title="Featured projects"
          description="Selected applications, infrastructure code, and automated security pipelines deployed to production."
          meta={
            <span className="inline-block border border-hairline-2 bg-plate px-3 py-1.5 font-mono text-label-sm uppercase tracking-[0.16em] text-muted">
              {PROJECTS.length} prod artifacts
            </span>
          }
        />

        <Stagger className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {PROJECTS.map((project, idx) => {
            const speed = idx % 2 === 0 ? 0.05 : -0.05

            return (
              <StaggerItem key={project.index} className={project.span ? 'md:col-span-2' : undefined}>
                <Parallax speed={speed} className="h-full">
                  <motion.article
                    whileHover={reduce ? undefined : { y: -4 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className={`group flex h-full flex-col border bg-plate p-6 transition-all duration-300 hover:border-ink hover:shadow-[5px_5px_0_0_var(--color-ink)] lg:p-7 ${
                      project.isNew ? 'border-terracotta/50' : 'border-hairline'
                    }`}
                  >
                    {/* plate header */}
                    <div className="flex items-center justify-between gap-3 border-b border-hairline pb-3 font-mono text-label-sm uppercase tracking-[0.16em]">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-terracotta">
                          Plate {project.plate} // {project.category}
                        </span>
                        {project.isNew && (
                          <span className="border border-terracotta bg-terracotta px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.14em] text-plate">
                            NEW
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 text-muted">
                        <span className="h-1.5 w-1.5 rounded-full bg-patina animate-pip" />
                        {project.status}
                      </span>
                    </div>

                    {/* featured cards split into two columns */}
                    <div
                      className={`pt-5 ${project.span ? 'grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-12' : ''}`}
                    >
                      <div className="flex flex-col">
                        <h3 className="font-display text-headline-sm font-medium tracking-tight text-ink transition-colors duration-300 group-hover:text-terracotta">
                          {project.title}
                        </h3>
                        <p className="mt-2 text-body-md leading-relaxed text-muted">{project.body}</p>

                        <ul className="mt-5 flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <li
                              key={tag}
                              className="border border-hairline-2 bg-ground px-2 py-0.5 font-mono text-label-sm uppercase tracking-[0.1em] text-ink"
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div
                        className={`flex flex-col ${project.span ? 'justify-between gap-6' : 'gap-0'}`}
                      >
                        {/* ledger metrics */}
                        <div className="mt-5 border border-hairline bg-ground px-3 py-2 lg:mt-0">
                          {project.metrics.map((metric) => (
                            <Metric key={metric.label} metric={metric} />
                          ))}
                        </div>

                        <div className="mt-auto pt-7">
                          <Actions project={project} onOpenCase={() => setCaseOpen(true)} />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Parallax>
              </StaggerItem>
            )
          })}
        </Stagger>
      </div>

      <CaseStudyModal open={caseOpen} onClose={closeCase} />
    </section>
  )
}
