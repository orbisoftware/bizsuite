import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import pointOfView from '@fastify/view';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import formbody from '@fastify/formbody';
import fastifyStatic from '@fastify/static';
import { AddonRoutes, AddonModule, DashboardData, RouteHandler } from './types/index.js';

const app: FastifyInstance = Fastify({ logger: true });

const ADDON_DIR: string = path.resolve('./dist/addons');
const INSTALLED_FILE: string = path.resolve('./installed.json');

let installedAddons: string[] = [];
if (fs.existsSync(INSTALLED_FILE)) {
  installedAddons = JSON.parse(fs.readFileSync(INSTALLED_FILE, 'utf8'));
}

app.register(formbody);
app.register(pointOfView, { engine: { ejs } });

app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  prefix: '/public/', // URL prefix to access static files
});

// This map holds all active route handlers keyed by route path
const addonRoutes: AddonRoutes = new Map<string, RouteHandler>();

// Generic catch-all route delegates to addonRoutes handlers
app.all('*', async (req: FastifyRequest, reply: FastifyReply) => {
  const handler: RouteHandler | undefined = addonRoutes.get(req.url);
  if (handler) {
    try {
      return await handler(req, reply);
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send('Internal Server Error');
    }
  }
  return reply.callNotFound();
});

function saveInstalled(): void {
  fs.writeFileSync(INSTALLED_FILE, JSON.stringify(installedAddons, null, 2));
}

// Load an addon and register its routes into addonRoutes map
async function loadAddon(name: string): Promise<void> {
  const filePath: string = path.join(ADDON_DIR, `${name}.js`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Addon file not found: ${name}`);
  }
  // Import the addon module fresh (no cache)
  const modPath: string = pathToFileURL(filePath).href;
  // Clear from cache for reload (optional)
  if (import.meta && import.meta.url && (globalThis as any).__importedModules) {
    delete (globalThis as any).__importedModules[modPath];
  }
  const mod: AddonModule = await import(`${modPath}?update=${Date.now()}`);
  if (typeof mod.register !== 'function') {
    throw new Error(`Addon ${name} must export a 'register' function`);
  }
  // The addon registers its routes inside addonRoutes map
  mod.register(addonRoutes);
}

// Unload addon routes from addonRoutes map
function unloadAddon(name: string): void {
  // Convention: addon routes start with /addonName or /addonName/*
  for (const route of addonRoutes.keys()) {
    if (route === `/${name}` || route.startsWith(`/${name}/`)) {
      addonRoutes.delete(route);
    }
  }
}

// Load all installed addons on startup
(async (): Promise<void> => {
  for (const addon of installedAddons) {
    try {
      await loadAddon(addon);
      app.log.info(`Loaded addon: ${addon}`);
    } catch (e) {
      app.log.error(`Failed to load addon ${addon}: ${(e as Error).message}`);
    }
  }
})();

// Dashboard route
app.get('/', (req: FastifyRequest, reply: FastifyReply) => {
  const allAddons: string[] = fs.readdirSync(ADDON_DIR)
    .filter((f: string) => f.endsWith('.js'))
    .map((f: string) => path.basename(f, '.js'));
  const available: string[] = allAddons.filter((name: string) => !installedAddons.includes(name));
  const data: DashboardData = { installed: installedAddons, available };
  reply.view('dashboard.ejs', data);
});

// Install addon
app.post('/install/:name', async (req: FastifyRequest<{Params: {name: string}}>, reply: FastifyReply) => {
  const name: string = req.params.name;
  if (!installedAddons.includes(name)) {
    try {
      await loadAddon(name);
      installedAddons.push(name);
      saveInstalled();
      app.log.info(`Addon installed: ${name}`);
    } catch (e) {
      app.log.error(`Failed to install addon ${name}: ${(e as Error).message}`);
    }
  }
  reply.redirect('/');
});

// Uninstall addon
app.post('/uninstall/:name', (req: FastifyRequest<{Params: {name: string}}>, reply: FastifyReply) => {
  const name: string = req.params.name;
  if (installedAddons.includes(name)) {
    unloadAddon(name);
    installedAddons = installedAddons.filter((n: string) => n !== name);
    saveInstalled();
    app.log.info(`Addon uninstalled: ${name}`);
  }
  reply.redirect('/');
});

app.listen({ port: 3000 });
