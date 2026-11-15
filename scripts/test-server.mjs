import { preview } from 'astro';
import { fileURLToPath } from 'node:url';

// Keep the server in Playwright's process tree, including when the CLI uses a daemon.
const url = new URL(process.env.TEST_URL || 'http://localhost:4321');
const server = await preview({
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { host: '127.0.0.1', port: Number(url.port || 4321), open: false },
});
process.once('SIGTERM', () => void server.stop());
process.once('SIGINT', () => void server.stop());
await server.closed();
