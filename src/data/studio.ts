export const services = [
  {
    title: 'Product design',
    description:
      'Research, UX and interface design that turns complex workflows into products people enjoy using every day.',
    tags: ['Discovery', 'UX research', 'Design systems', 'Prototyping'],
    art: 'micro-slats',
  },
  {
    title: 'Web engineering',
    description:
      'Fast, accessible web applications, built on modern stacks and tested end to end.',
    tags: ['React and Next.js', 'TypeScript', 'APIs', 'Test automation'],
    art: 'pattern-waves',
  },
  {
    title: 'Cloud and platforms',
    description:
      'Resilient infrastructure, migrations and DevOps that keep your product online and your costs predictable.',
    tags: ['AWS and Google Cloud', 'Kubernetes', 'CI/CD', 'Observability'],
    art: 'ghost-fibers',
  },
  {
    title: 'Data and AI',
    description:
      'Pipelines, analytics and applied machine learning that turn the data you already have into better decisions.',
    tags: ['Data engineering', 'Dashboards', 'LLM features', 'Forecasting'],
    art: 'crt-warp',
  },
] as const;
export const processSteps = [
  {
    name: 'Discover',
    time: 'Understand',
    description:
      'Understand the idea, the people using the software, and what a useful result looks like.',
  },
  {
    name: 'Design',
    time: 'Simplify',
    description:
      'Explore possible approaches, sketch the interface, and agree on a focused direction.',
  },
  {
    name: 'Build',
    time: 'Implement',
    description:
      'Turn the design into working software, test its behavior, and prepare it for use.',
  },
  {
    name: 'Evolve',
    time: 'Ongoing',
    description:
      'Use feedback to fix rough edges, improve documentation, and decide what to build next.',
  },
];
