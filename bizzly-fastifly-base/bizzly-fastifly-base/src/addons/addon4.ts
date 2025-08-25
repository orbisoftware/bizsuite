import { FastifyRequest, FastifyReply } from 'fastify';
import { AddonRoutes } from '../types/index.js';

export function register(routes: AddonRoutes): void {
  routes.set('/addon4', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.send('Hello from Addon 4!');
  });
  routes.set('/addon4/info', async (req: FastifyRequest, reply: FastifyReply) => {
    reply.send({ addon: 'addon4', description: 'This is addon 4' });
  });
}
