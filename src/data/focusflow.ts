/* ------------------------------------------------------------------ */
/* Case study — CloudPath FocusFlow                                     */
/* Distilled from the project README for the popup dossier.             */
/* ------------------------------------------------------------------ */

export type FlowNode = {
  code: string
  label: string
  sub?: string
  chips?: string[]
}

export type FlowRow = {
  stage: string
  nodes: FlowNode[]
}

export type TreeNode = { path: string; note: string; last?: boolean; branch?: string }

export type CommandBlock = {
  id: string
  label: string
  hint: string
  lines: { text: string; kind: 'cmd' | 'cmt' | 'out' }[]
}

export const CASE_STUDY = {
  id: 'focusflow',
  plate: '04-A',
  kicker: 'Case Study · DevSecOps Delivery',
  title: 'CloudPath FocusFlow',
  subtitle: 'A DevSecOps delivery platform for a containerised FocusFlow application',
  status: 'Evidence collected',

  lede:
    'FocusFlow is a containerised web application — a Node.js API plus an Nginx-served frontend on MongoDB Atlas — taken from raw GitHub commits all the way to a running Kubernetes workload. Every step in between is automated, gated, and recorded as evidence.',

  summary: [
    'The point was never just to deploy an application. It was to prove that the deployment is repeatable, observable, secure by default, and recoverable when a release fails — with the logs, health checks, and rollback proof to back that claim up.',
    'Built as an individual CloudPath DevOps Engineer internship project: Git is the source of truth, and code quality, image security, registry publication, cluster deployment, monitoring and rollback evidence are wired into a single workflow.',
  ],

  objectives: [
    'Immutable image tags traced from Git commit SHA through ECR digest to the running Pod.',
    'Quality and security gates before anything ships: ESLint, tests, npm audit, CodeQL, Trivy.',
    'Short-lived GitHub OIDC credentials instead of long-lived AWS access keys in repository secrets.',
    'Kustomize base + overlay with namespace, probes, ConfigMap, Secret, NetworkPolicy and PodDisruptionBudget.',
    'Terraform-managed ECR, OIDC provider, CloudWatch log group and a temporary EKS demonstration cluster.',
    'A documented release → verify → rollback loop with evidence captured for every stage.',
  ],

  facts: [
    { k: 'Project type', v: 'Individual DevSecOps delivery platform' },
    { k: 'Application', v: 'Node.js API · Nginx frontend · MongoDB Atlas' },
    { k: 'Registry', v: 'Amazon ECR — private, SHA-tagged' },
    { k: 'Platforms', v: 'Kind (local) · Amazon EKS (ap-south-1)' },
    { k: 'Namespace', v: 'cloudpath' },
    { k: 'Author', v: 'Nadeeshan R. M. K. · CCA DevOps internship' },
  ],

  stack: [
    { area: 'Source & CI', items: ['Git', 'GitHub', 'GitHub Actions', 'Dependabot'] },
    { area: 'Quality & Security', items: ['ESLint', 'npm audit', 'CodeQL', 'Trivy', 'OIDC'] },
    { area: 'Containers', items: ['Docker', 'Docker Compose', 'Amazon ECR', 'Git-SHA tags'] },
    { area: 'Kubernetes', items: ['Kind', 'Amazon EKS', 'kubectl', 'Kustomize', 'NetworkPolicy', 'PDB'] },
    { area: 'Infrastructure', items: ['Terraform', 'AWS IAM', 'CloudWatch', 'VPC'] },
    { area: 'Application', items: ['Node.js', 'Nginx', 'MongoDB Atlas', 'JWT'] },
  ],

  /* -------- animated architecture diagram -------- */
  flow: [
    {
      stage: 'Source',
      nodes: [{ code: '01', label: 'Developer', sub: 'git commit · git push · pull request' }],
    },
    {
      stage: 'Source',
      nodes: [
        { code: '02', label: 'GitHub Repository', sub: 'main · develop · feature/<short-description>' },
      ],
    },
    {
      stage: 'CI gates',
      nodes: [
        {
          code: '03',
          label: 'GitHub Actions',
          sub: 'ci.yml · security.yml · codeql.yml',
          chips: ['ESLint', 'Unit tests', 'npm audit', 'CodeQL'],
        },
      ],
    },
    {
      stage: 'Supply chain',
      nodes: [
        { code: '04', label: 'Docker Build', sub: 'api + web images, .dockerignore' },
        { code: '05', label: 'Trivy Scan', sub: 'image CVE gate before publish' },
      ],
    },
    {
      stage: 'Cloud auth',
      nodes: [
        { code: '06', label: 'GitHub OIDC', sub: 'short-lived token' },
        { code: '07', label: 'AWS IAM Role', sub: 'least-privilege ECR push' },
      ],
    },
    {
      stage: 'Registry',
      nodes: [
        {
          code: '08',
          label: 'Amazon ECR',
          sub: 'cloudpath-focusflow-api-dev:<git-sha> · web-dev:<git-sha>',
        },
      ],
    },
    {
      stage: 'Runtime',
      nodes: [
        { code: '09', label: 'Kind — local', sub: 'repeatable verification cluster' },
        { code: '10', label: 'Amazon EKS', sub: 'ap-south-1 · namespace: cloudpath' },
      ],
    },
    {
      stage: 'Workloads',
      nodes: [
        { code: '11', label: 'focusflow-api', sub: 'Deployment · probes · Secret' },
        { code: '12', label: 'focusflow-web', sub: 'Deployment · Nginx · Service' },
      ],
    },
    {
      stage: 'Data & ops',
      nodes: [
        { code: '13', label: 'MongoDB Atlas', sub: 'MONGODB_URI injected as a Secret' },
        { code: '14', label: 'CloudWatch', sub: 'EKS control-plane + app logs' },
      ],
    },
    {
      stage: 'Evidence',
      nodes: [
        {
          code: '15',
          label: 'Health · Rollout · Rollback',
          sub: '/health → kubectl logs → rollout undo → captured proof',
        },
      ],
    },
  ] as FlowRow[],

  /* -------- repository structure -------- */
  tree: [
    { path: 'cloudpath-focusflow/', note: 'Git is the single source of truth' },
    { path: 'app/', note: 'FocusFlow API — src/config · controllers · middleware · models · routes, tests/' },
    { path: 'app/Dockerfile', note: 'Separate API image (+ .dev and .bookworm variants)' },
    { path: 'frontend/', note: 'Nginx-served frontend — src/, public/, nginx*.conf' },
    { path: 'frontend/Dockerfile.k8s', note: 'Kubernetes-specific frontend image' },
    { path: '.github/workflows/', note: 'ci.yml · codeql.yml · security.yml · publish-ecr.yml' },
    { path: '.github/dependabot.yml', note: 'Dependency update visibility' },
    { path: 'k8s/base/', note: 'namespace · configmap · deployments · services · probes · netpol · PDB' },
    { path: 'k8s/overlays/eks/', note: 'Kustomize patches → immutable ECR images + env config' },
    { path: 'k8s/secret.example.yaml', note: 'Template only — real values never enter Git' },
    { path: 'terraform/modules/ecr/', note: 'Reusable ECR repository module' },
    { path: 'terraform/oidc.tf', note: 'GitHub OIDC provider + IAM role' },
    { path: 'terraform/eks-demo/', note: 'Temporary VPC · subnets · IAM · EKS · node group · CloudWatch' },
    { path: 'scripts/', note: 'release-kind.sh · rollback-kind.sh — repeatable release evidence' },
    { path: 'docs/', note: 'aws-eks-troubleshooting.md · aws-final-week-cost-control.md' },
    { path: 'evidence/', note: 'week-02…05 · final-release · aws-final — command proof per stage' },
    { path: 'compose.yaml', note: 'One-command local stack' },
    { path: '.env.example', note: 'Variable names only — secrets are never committed' },
  ] satisfies TreeNode[],

  /* -------- command deck -------- */
  commands: [
    {
      id: 'start',
      label: 'Quick start',
      hint: 'clone → configure → run locally',
      lines: [
        { text: 'git clone <repository-url> && cd cloudpath-focusflow', kind: 'cmd' },
        { text: 'cp .env.example .env   # names only — add your own values', kind: 'cmd' },
        { text: 'npm ci --prefix app && npm ci --prefix frontend', kind: 'cmd' },
        { text: 'docker compose -f compose.dev.yaml up --build', kind: 'cmd' },
        { text: 'curl -i http://localhost:5000/health', kind: 'cmd' },
        { text: 'HTTP/1.1 200 OK', kind: 'out' },
      ],
    },
    {
      id: 'docker',
      label: 'Docker',
      hint: 'build · run · scan',
      lines: [
        { text: 'docker build -t focusflow-api:local -f app/Dockerfile app', kind: 'cmd' },
        { text: 'docker build -t focusflow-web:local -f frontend/Dockerfile frontend', kind: 'cmd' },
        { text: 'docker run --rm -p 5000:5000 focusflow-api:local', kind: 'cmd' },
        { text: 'trivy image focusflow-api:local', kind: 'cmd' },
        { text: 'Report Summary: Critical: 0 · High: 0 · Total: 0', kind: 'out' },
      ],
    },
    {
      id: 'k8s',
      label: 'Kubernetes',
      hint: 'deploy · observe · roll back',
      lines: [
        { text: 'kind create cluster --name cloudpath', kind: 'cmd' },
        { text: 'kubectl apply -k k8s/base', kind: 'cmd' },
        { text: 'kubectl -n cloudpath get pods -o wide', kind: 'cmd' },
        { text: 'focusflow-api-7d9f  1/1  Running  0  42s', kind: 'out' },
        { text: 'focusflow-web-5c4b   1/1  Running  0  38s', kind: 'out' },
        { text: 'kubectl -n cloudpath rollout status deployment/focusflow-api --timeout=300s', kind: 'cmd' },
        { text: 'kubectl -n cloudpath port-forward service/focusflow-web 8080:80', kind: 'cmd' },
        { text: 'kubectl -n cloudpath rollout undo deployment/focusflow-api', kind: 'cmd' },
      ],
    },
    {
      id: 'tf',
      label: 'Terraform',
      hint: 'foundation · temporary EKS demo',
      lines: [
        { text: 'cd terraform && terraform fmt -recursive', kind: 'cmd' },
        { text: 'terraform init && terraform validate && terraform plan', kind: 'cmd' },
        { text: '+ aws_ecr_repository.api  + aws_iam_role.github  + aws_cloudwatch_log_group', kind: 'out' },
        { text: 'cd eks-demo && terraform apply   # VPC · subnets · EKS · 1 node group', kind: 'cmd' },
        { text: 'terraform destroy                # always cleaned up after evidence', kind: 'cmd' },
      ],
    },
    {
      id: 'aws',
      label: 'AWS · ECR',
      hint: 'authenticate · push · verify',
      lines: [
        { text: 'export IMAGE_TAG="$(git rev-parse --short HEAD)"', kind: 'cmd' },
        { text: 'aws ecr get-login-password --region ap-south-1 \\', kind: 'cmd' },
        { text: '  | docker login --username AWS --password-stdin "$ECR_REGISTRY"', kind: 'cmd' },
        { text: 'Login Succeeded', kind: 'out' },
        { text: 'docker push "$API_IMAGE" && docker push "$WEB_IMAGE"', kind: 'cmd' },
        { text: 'aws ecr describe-images --repository-name cloudpath-focusflow-api-dev \\', kind: 'cmd' },
        { text: '  --image-ids imageTag="$IMAGE_TAG" --output table', kind: 'cmd' },
        { text: 'aws eks update-kubeconfig --region ap-south-1 --name cloudpath-focusflow-final', kind: 'cmd' },
      ],
    },
  ] satisfies CommandBlock[],

  notes: [
    'Repository ships example configuration and secret templates only — .env, terraform.tfvars, Terraform state, AWS credentials, MongoDB URIs, JWT secrets and Kubernetes Secret values are never committed.',
    'Cost controls: one EKS node group, no NAT Gateway, no RDS, no permanent load balancer — the cluster is time-boxed and destroyed once evidence is captured.',
  ],

  repoUrl: 'https://github.com/nadeeshan01/cloudpath-focusflow/tree/develop',
}
