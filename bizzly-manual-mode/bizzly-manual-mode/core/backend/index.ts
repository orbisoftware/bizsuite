import fastify from 'fastify';
import config from '../config.js';

// Create a Fastify instance
const app = fastify({
    logger: config.logger ? {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            }
        }
    } : false
});

// Handle 404 errors
app.setNotFoundHandler((_, reply) => {
    reply
        .code(404)
        .type('text/plain; charset=utf-8')
        .send('404 Not Found');
});

// Handle internal server errors
app.setErrorHandler((error, _, reply) => {
    reply
        .code(500)
        .type('text/plain; charset=utf-8')
        .send('500 Internal Server Error' + `\n\n${error.message}`);
});

// Define root route
app.get('/', async (_request, reply) => {
    return reply
        .code(200)
        .type('text/plain; charset=utf-8')
        .send('Welcome to the Fastify server!');
});

// Start the server
const port = Number(process.env.PORT ?? config.port);
const host = config.host || 'localhost';
app.listen({ port, host })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
