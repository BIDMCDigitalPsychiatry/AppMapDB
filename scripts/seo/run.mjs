// Runs scripts/seo/generate.ts after `vite build`. It's loaded through Vite (not plain Node) so it can
// import the app's own TypeScript modules: the address format, translations and database config must be
// exactly the ones the site uses.
import { createServer } from 'vite';

const server = await createServer({ appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false } });
try {
  const { generate } = await server.ssrLoadModule('/scripts/seo/generate.ts');
  await generate();
} catch (err) {
  console.error('[seo] Static page generation failed:', err?.message ?? err);
  process.exitCode = 1;
} finally {
  await server.close();
}
