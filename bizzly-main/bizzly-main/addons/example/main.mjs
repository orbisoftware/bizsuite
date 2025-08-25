/**
 * Default export is the addon entry function.
 * @param {import('fastify').FastifyInstance} fastify
 * @param {import('../../src/services/addons.js').CoreSdk} core
 * @param {{ id: string, basePath: string }} ctx
 */
export default async function registerAddon(fastify, core, ctx) {
  // Route base
  fastify.get(`/addons/${ctx.id}`, async (req, reply) => {
    const html = await core.render(`${ctx.basePath}/views/index.ejs`, {
      title: 'Example Addon',
    });
    reply.type('text/html').send(html);
  });

  // Example API route through core SDK
  core.registerRoute({
    method: 'GET',
    url: `/api/addons/${ctx.id}/me`,
    handler: async (req, reply) => {
      const user = await core.getUserById('dev');
      return { user };
    },
  });
}


