import { FastifyRequest, FastifyReply } from 'fastify';
import { AddonRoutes } from '../types/index.js';

export function register(routes: AddonRoutes): void {
  routes.set('/addon3', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.send('Hello from Addon 3!');
  });
  routes.set('/addon3/info', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.send({ addon: 'addon3', description: 'This is addon 3' });
  });
}
