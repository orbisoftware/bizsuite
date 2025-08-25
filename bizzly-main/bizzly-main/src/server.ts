import Fastify from 'fastify';
import view from '@fastify/view';
import fastifyStatic from '@fastify/static';
import ejs from 'ejs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import { getDb } from './services/db.js';
import { loadAddons } from './services/addons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

async function buildServer() {
  const fastify = Fastify({ logger: true });

  // Views
  fastify.register(view, {
    engine: { ejs },
    root: resolve(process.cwd(), 'src', 'views'),
    viewExt: 'ejs',
  });

  // Public static
  const publicDir = join(process.cwd(), 'public');
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });
  fastify.register(fastifyStatic, {
    root: publicDir,
    prefix: '/public/',
    decorateReply: false,
  });

  // DB init
  await getDb();

  // Load addons (also mounts their routes and static assets)
  const addons = await loadAddons(fastify);

  fastify.get('/', async (req, reply) => {
    return reply.view('home', { addons });
  });

  return fastify;
}

buildServer()
  .then((app) => app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' }))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });


