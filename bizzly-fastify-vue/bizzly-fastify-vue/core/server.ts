import { resolve } from 'node:path'
import * as fs from 'fs';
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import FastifyFormBody from '@fastify/formbody'
import config from '@/config.js'

interface Database {
  todoList: string[]
}

const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  }
})

// @ts-ignore TODO
await server.register(FastifyFormBody)

await server.register(FastifyVite, {
  root: resolve(import.meta.dirname, '..'),
  distDir: import.meta.dirname, // This file will also live in the dist folder when built
  renderer: '@fastify/vue',
})

await server.vite.ready()

server.decorate<Database>('db', {
  todoList: [
    'Do laundry',
    'Respond to emails',
    'Write report',
  ]
})

server.get('/loaded', async (_request, reply) => {
  const addonsDir = resolve(import.meta.dirname, '..', 'addons')
  const addons = fs.readdirSync(addonsDir)
  return reply
      .code(200)
      .type('text/plain; charset=utf-8')
      .send('Loaded addons: ' + addons.join(', '))
});

server.put<{
  Body: string
}>('/api/todo/items', (req, reply) => {
  const db = server.getDecorator<Database>('db')
  db.todoList.push(req.body)
  reply.send({ ok: true })
})

server.delete<{
  Body: number
}>('/api/todo/items', (req, reply) => {
  const db = server.getDecorator<Database>('db')
  db.todoList.splice(req.body, 1)
  reply.send({ ok: true })
})

await server.listen({ port: config.port, host: config.host })
