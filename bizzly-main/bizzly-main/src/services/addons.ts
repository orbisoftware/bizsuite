import { FastifyInstance } from 'fastify';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve, isAbsolute } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';

export type AddonManifest = {
  id: string; // unique key, e.g., folder name
  name: string;
  version: string;
  main: string; // path to main server script relative to addon root
  view: string; // path to main view (ejs) relative to addon root
  publicDir?: string; // optional static dir
};

export type LoadedAddon = AddonManifest & {
  basePath: string;
};

export type CoreSdk = {
  registerRoute: (route: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    handler: Parameters<FastifyInstance['route']>[0]['handler'];
  }) => void;
  render: (view: string, data?: Record<string, unknown>) => Promise<string>;
  getUserById: (id: string) => Promise<{ id: string; email: string; name: string } | null>;
};

export async function loadAddons(fastify: FastifyInstance): Promise<LoadedAddon[]> {
  const addonsDir = resolve(process.cwd(), 'addons');
  if (!existsSync(addonsDir)) return [];

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
  const folders = readdirSync(addonsDir, { withFileTypes: true }).filter((d) => d.isDirectory());

  const loaded: LoadedAddon[] = [];
  for (const dir of folders) {
    const basePath = join(addonsDir, dir.name);
    const manifestPath = join(basePath, 'manifest.xml');
    if (!existsSync(manifestPath)) continue;
    const xml = readFileSync(manifestPath, 'utf8');
    const m = parser.parse(xml)?.manifest;
    if (!m) continue;

    const manifest: AddonManifest = {
      id: m.id || dir.name,
      name: m.name,
      version: m.version || '0.0.0',
      main: m.main,
      view: m.view,
      publicDir: m.publicDir,
    };

    // Mount addon static assets if any
    if (manifest.publicDir) {
      const pub = join(basePath, manifest.publicDir);
      if (existsSync(pub)) {
        fastify.register(fastifyStatic, {
          root: pub,
          prefix: `/addons/${manifest.id}/public/`,
          decorateReply: false,
        });
      }
    }

    // Provide minimal SDK to addon main
    const sdk: CoreSdk = {
      registerRoute: (route) => fastify.route(route as any),
      render: (viewPath, data) => {
        // If addon passes an absolute path, render directly via EJS to avoid core view root prefixing
        if (isAbsolute(viewPath)) {
          return new Promise<string>((resolveRender, reject) => {
            ejs.renderFile(viewPath, data ?? {}, {}, (err, str) => {
              if (err) reject(err);
              else resolveRender(str);
            });
          });
        }
        return new Promise((resolveRender, reject) => {
          (fastify as any).view(viewPath, data, (err: any, html: string) => {
            if (err) reject(err);
            else resolveRender(html);
          });
        });
      },
      getUserById: async (id: string) => {
        // In minimal MVP, return a mock user; later wire to DB
        return { id, email: 'admin@example.com', name: 'Admin' };
      },
    };

    // Import addon main file dynamically
    const addonMainPath = join(basePath, manifest.main);
    const addonModule = await import(`file://${addonMainPath}`);
    if (typeof addonModule.default === 'function') {
      await addonModule.default(fastify, sdk, { id: manifest.id, basePath });
    }

    loaded.push({ ...manifest, basePath });
  }

  return loaded;
}


