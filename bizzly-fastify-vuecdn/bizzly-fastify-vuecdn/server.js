import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: true });

// Serve dashboard static files
fastify.register(fastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/',
});

const INSTALLED_JSON = join(__dirname, 'installed.json');

async function readInstalled() {
  try {
    const raw = await fs.readFile(INSTALLED_JSON, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function writeInstalled(list) {
  await fs.writeFile(INSTALLED_JSON, JSON.stringify(list, null, 2), 'utf8');
}

// List addons: shows available (folders in addons-available) and installed (folders in addons)
fastify.get('/api/addons', async () => {
  const availDir = join(__dirname, 'public/addons');
  const addonsDir = join(__dirname, 'public/addons');
  const avail = await fs.readdir(availDir, { withFileTypes: true });
  const available = [];
  for (const d of avail) {
    if (d.isDirectory()) {
      const manifestPath = join(availDir, d.name, 'manifest.json');
      let manifest = { name: d.name };
      try {
        const raw = await fs.readFile(manifestPath, 'utf8');
        manifest = JSON.parse(raw);
      } catch (e) {}
      available.push({ id: d.name, manifest });
    }
  }
  const installed = await readInstalled();
  return { available, installed };
});

// Install: copy folder from addons-available -> addons and add to installed.json
fastify.post('/api/install/:name', async (request, reply) => {
  const name = request.params.name;
  const src = join(__dirname, 'public/addons', name);
  const dest = join(__dirname, 'public/addons', name);
  try {
    // copy (recursive)
    await fs.cp(src, dest, { recursive: true });
  } catch (err) {
    reply.code(500).send({ error: 'copy_failed', detail: err.message });
    return;
  }
  const installed = await readInstalled();
  if (!installed.includes(name)) installed.push(name);
  await writeInstalled(installed);
  return { ok: true, installed };
});

// Uninstall: remove folder from addons and update installed.json
fastify.post('/api/uninstall/:name', async (request, reply) => {
  const name = request.params.name;
  const target = join(__dirname, 'public/addons', name);
  try {
    await fs.rm(target, { recursive: true, force: true });
  } catch (err) {
    // ignore
  }
  let installed = await readInstalled();
  installed = installed.filter(x => x !== name);
  await writeInstalled(installed);
  return { ok: true, installed };
});

// Simple health
fastify.get('/api/health', async () => ({ ok: true }));

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server running at http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
