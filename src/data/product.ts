export const product = {
  name: 'Zeke',
  url: 'https://zeke.pruven.top/',
  description:
    'A Git hook that copies missing, ignored environment files from your main checkout into new worktrees. Install it once in your project and keep working.',
  tags: ['Git worktrees', 'Node.js / Bun', 'CLI'],
  install: 'bun add --dev @pruven/zeke\nbun --bun zeke install',
} as const;

export const rtboard = {
  name: 'rtboard',
  url: 'https://rtboard.pruven.top/',
  repository: 'https://github.com/pruven/rtboard',
  description:
    'An infinite canvas for notes, drawings, links and playable media embeds. Keep your boards in your browser, without creating an account, and export them as shareable HTML.',
  tags: ['Infinite canvas', 'Media embeds', 'Local-first'],
  features: [
    'Collect notes, drawings and links on one canvas',
    'Play supported video and social embeds inline',
    'Export shareable HTML or editable board files',
  ],
} as const;

export const products = [product, rtboard] as const;
