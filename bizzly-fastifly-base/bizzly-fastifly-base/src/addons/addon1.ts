import { FastifyRequest, FastifyReply } from 'fastify';
import { AddonRoutes } from '../types/index.js';

export function register(routes: AddonRoutes): void {
  routes.set('/addon1', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.send('Hello from Addon 1!');
  });
  routes.set('/addon1/info', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.send({ addon: 'addon1', description: 'This is addon 1' });
  });
}
