import { FastifyRequest, FastifyReply } from 'fastify';

export interface RouteHandler {
  (req: FastifyRequest, reply: FastifyReply): Promise<any>;
}

export interface AddonRoutes extends Map<string, RouteHandler> {}

export interface AddonModule {
  register: (routes: AddonRoutes) => void;
}

export interface DashboardData {
  installed: string[];
  available: string[];
}
