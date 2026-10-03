import { FOOTER, IDENTITY } from '../data/portfolio'

export default function Footer() {
  return (
    <footer className="w-full border-t border-hairline bg-ground-deep">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row lg:px-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-label-sm uppercase tracking-[0.18em] text-muted">
            {FOOTER.index}
          </span>
          <span className="text-hairline-2">·</span>
          <p className="text-body-sm text-muted">{FOOTER.note}</p>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`mailto:${IDENTITY.email}`}
            className="font-mono text-label-sm uppercase tracking-[0.16em] text-muted transition-colors hover:text-terracotta"
          >
            {IDENTITY.email}
          </a>
          <span className="flex items-center gap-2 font-mono text-label-sm uppercase tracking-[0.16em] text-terracotta">
            <span className="h-1.5 w-1.5 animate-pip rounded-full bg-terracotta" />
            {FOOTER.mark}
          </span>
        </div>
      </div>
    </footer>
  )
}
