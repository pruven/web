export const product = {
  name: 'Zeke',
  url: 'https://zeke.pruven.top/',
  description:
    'A Git hook that copies missing, ignored environment files from your main checkout into new worktrees. Install it once in your project and keep working.',
  tags: ['Git worktrees', 'Node.js / Bun', 'CLI'],
  install: 'bun add --dev @pruven/zeke\nbun --bun zeke install',
} as const;
