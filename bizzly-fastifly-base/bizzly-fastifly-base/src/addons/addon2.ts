import { FastifyRequest, FastifyReply } from 'fastify';
import { AddonRoutes } from '../types/index.js';

export function register(routes: AddonRoutes): void {
  routes.set('/addon2', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.send('Hello from Addon 2!');
  });
  routes.set('/addon2/info', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.send({ addon: 'addon2', description: 'This is addon 2' });
  });
}
