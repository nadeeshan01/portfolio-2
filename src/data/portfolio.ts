import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Box,
  CloudCog,
  Database,
  GitBranch,
  LayoutTemplate,
  Rocket,
  Server,
  ShieldCheck,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */
export type NavItem = {
  id: string
  label: string
  plate: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', plate: '01' },
  { id: 'skills', label: 'Stack', plate: '02' },
  { id: 'pipeline', label: 'Pipeline', plate: '03' },
  { id: 'projects', label: 'Work', plate: '04' },
  { id: 'contact', label: 'Contact', plate: '05' },
]

export const IDENTITY = {
  handle: 'Nadeeshan.dev',
  name: 'Kavindu Nadeeshan',
  role: 'Software & DevOps Engineer',
  email: 'kavindunadeeshan2002@gmail.com',
  github: 'github.com/nadeeshan01',
  linkedin: 'linkedin.com/in/kavindu-nadeeshan-97552b334',
  githubUrl: 'https://github.com/nadeeshan01',
  linkedinUrl: 'https://www.linkedin.com/in/kavindu-nadeeshan-97552b334',
  availability: 'Available for work',
  year: '2026',
}

export const TYPEWRITER_WORDS = ['DevOps Engineer', 'Platform Engineer', 'DevSecOps Engineer']

export const HERO_TAGS = [
  'TypeScript',
  'React',
  'Kubernetes',
  'Terraform',
  'Docker',
  'AWS',
]

export const HERO_SUMMARY =
  'Building modern web platforms with clean, responsive, and elegant interfaces — then making them ship safely. I turn designs and architecture diagrams into reliable digital products with zero-drama deployments.'

/* ------------------------------------------------------------------ */
/* Specimen metric strip                                               */
/* ------------------------------------------------------------------ */
export type MetricTick = { label: string; value: string; tone?: 'ink' | 'terracotta' | 'patina' }

export const METRIC_TICKS: MetricTick[] = [
  { label: 'Uptime', value: '99.98%', tone: 'patina' },
  { label: 'Deploys / wk', value: '42' },
  { label: 'P95 latency', value: '118ms' },
  { label: 'MTTR', value: '4.2 min', tone: 'terracotta' },
  { label: 'CVE mitigated', value: '47', tone: 'terracotta' },
  { label: 'Clusters', value: '06' },
  { label: 'Regions', value: 'US-EAST-01 · EU-WEST-02' },
  { label: 'SAST gate', value: 'PASSING', tone: 'patina' },
  { label: 'Change fail rate', value: '1.4%' },
  { label: 'Pipelines', value: '1,284 runs' },
]

/* ------------------------------------------------------------------ */
/* Skills ledger                                                       */
/* ------------------------------------------------------------------ */
export type SkillCard = {
  index: string
  stamp: string
  icon: LucideIcon
  title: string
  body: string
  tags: string[]
  accent?: boolean
  span?: boolean
}

export const SKILL_CARDS: SkillCard[] = [
  {
    index: '01',
    stamp: 'SRV',
    icon: Server,
    title: 'Backend',
    body: 'High-throughput microservices, robust REST and async APIs, and transactional integrity under load.',
    tags: ['Node.js', 'Express.js', 'Python', 'FastAPI'],
  },
  {
    index: '02',
    stamp: 'CLIENT',
    icon: LayoutTemplate,
    title: 'Frontend',
    body: 'Modern, type-safe reactive interfaces focused on accessibility, motion craft, and latency budgets.',
    tags: ['React', 'TypeScript', 'Vite', 'Tailwind'],
  },
  {
    index: '03',
    stamp: 'PERSIST',
    icon: Database,
    title: 'Databases',
    body: 'Relational models, document stores, indexing strategy, and zero-loss schema migrations.',
    tags: ['PostgreSQL', 'MongoDB', 'Redis'],
  },
  {
    index: '04',
    stamp: 'ORCH',
    icon: CloudCog,
    title: 'DevOps & Cloud',
    body: 'Container virtualization, automated build pipelines, and declarative multi-region orchestration.',
    tags: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS'],
  },
  {
    index: '05',
    stamp: 'SEC-OPS CLEARANCE',
    icon: ShieldCheck,
    title: 'DevSecOps & Hardening',
    body: 'Shift-left gatekeeping, runtime container enforcement, deterministic secret rotation, and least-privilege infrastructure policy.',
    tags: ['Security scanning', 'Secrets management', 'Least-privilege IAM', 'Hardening'],
    accent: true,
    span: true,
  },
]

/* ------------------------------------------------------------------ */
/* CI/CD topology panel                                                */
/* ------------------------------------------------------------------ */
export type Stage = {
  code: string
  label: string
  icon: LucideIcon
  detail: string
}

export const PIPELINE_STAGES: Stage[] = [
  { code: 'S1', label: 'Commit', icon: GitBranch, detail: 'signed · main' },
  { code: 'S2', label: 'Build', icon: Box, detail: 'oci image' },
  { code: 'S3', label: 'Test', icon: Activity, detail: '214 specs' },
  { code: 'S4', label: 'Scan', icon: ShieldCheck, detail: 'sast · cve' },
  { code: 'S5', label: 'Deploy', icon: Rocket, detail: 'canary 10%' },
  { code: 'S6', label: 'Observe', icon: Server, detail: 'slo watch' },
]

export const PIPELINE_LOG: string[] = [
  '$ git push origin main — a91f4c2',
  '› pipeline #4821 queued on runner eu-west-02',
  '✓ lint + typecheck passed in 6.4s',
  '✓ unit suite 214/214 green — 12.8s',
  '✓ sast scan: 0 critical · 0 high · signed cosign',
  '✓ canary promoted — 0 downtime · p95 118ms',
]

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */
export type ProjectMetric = { label: string; value: number; suffix?: string; decimals?: number }

export type Project = {
  index: string
  plate: string
  category: string
  status: string
  title: string
  body: string
  tags: string[]
  metrics: ProjectMetric[]
  /** opens the animated case-study dossier */
  caseStudy?: boolean
  /** card spans the full grid row */
  span?: boolean
  isNew?: boolean
  repoUrl?: string
}

export const PROJECTS: Project[] = [
  {
    index: '01',
    plate: '04-A',
    category: 'DevSecOps Delivery',
    status: 'Evidence · Collected',
    title: 'CloudPath FocusFlow',
    body: 'Evidence-driven DevSecOps platform: GitHub → Actions quality and security gates → Trivy-scanned images → private Amazon ECR → Kind/EKS deployment with health, rollout and rollback proof.',
    tags: [
      'GitHub Actions',
      'Docker',
      'Kubernetes',
      'Amazon ECR',
      'EKS',
      'Terraform',
      'Trivy',
      'OIDC',
    ],
    metrics: [
      { label: 'CI workflows', value: 4 },
      { label: 'K8s resources', value: 9 },
      { label: 'Scan gate', value: 100, suffix: '%' },
    ],
    caseStudy: true,
    span: true,
    isNew: true,
    repoUrl: 'https://github.com/nadeeshan01',
  },
  {
    index: '02',
    plate: '04-B',
    category: 'Web + Pipeline',
    status: 'Prod · Live',
    title: 'Full-Stack App + CI/CD',
    body: 'React + Node/FastAPI application delivered through a trunk-based pipeline with Docker images and reversible database migrations.',
    tags: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'CI/CD'],
    metrics: [
      { label: 'Uptime', value: 99.98, suffix: '%', decimals: 2 },
      { label: 'Deploys / wk', value: 42 },
      { label: 'Build time', value: 3.4, suffix: 'm', decimals: 1 },
    ],
  },
  {
    index: '03',
    plate: '04-C',
    category: 'Orchestration',
    status: 'Prod · Live',
    title: 'Kubernetes Deployment Project',
    body: 'Containerized services scheduled across a six-node cluster with ingress, horizontal autoscaling, and full observability.',
    tags: ['Kubernetes', 'Docker', 'Helm', 'Prometheus'],
    metrics: [
      { label: 'Nodes', value: 6 },
      { label: 'Services', value: 14 },
      { label: 'P95 latency', value: 118, suffix: 'ms' },
    ],
  },
  {
    index: '04',
    plate: '04-D',
    category: 'Security Gateway',
    status: 'Gated · Passing',
    title: 'DevSecOps Pipeline',
    body: 'CI pipeline with SAST, dependency and container scanning plus policy gates that block any artifact failing the threshold.',
    tags: ['DevSecOps', 'SAST', 'Scanning', 'Policy as Code'],
    metrics: [
      { label: 'CVE mitigated', value: 47 },
      { label: 'Gate pass', value: 100, suffix: '%' },
      { label: 'MTTR', value: 4.2, suffix: 'm', decimals: 1 },
    ],
  },
  {
    index: '05',
    plate: '04-E',
    category: 'Infra-As-Code',
    status: 'Terraform · Applied',
    title: 'Cloud Infrastructure as Code',
    body: 'Terraform modules covering networking, compute, database, IAM boundaries, and encrypted backups with drift detection.',
    tags: ['Terraform', 'Cloud', 'IAM', 'PostgreSQL'],
    metrics: [
      { label: 'Resources', value: 128 },
      { label: 'Drift', value: 0 },
      { label: 'Apply time', value: 92, suffix: 's' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */
export const CONTACT_TOPICS = ['Project inquiry', 'DevSecOps audit', 'Contract role', 'Speaking']

export const FOOTER = {
  index: 'INDEX // SPEC-2026',
  note: '© 2026 Kavindu Nadeeshan · Set in Playfair Display, Inter & JetBrains Mono',
  mark: 'Archival Metrology',
}
