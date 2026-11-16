/**
 * Custom Next.js + Socket.IO Server
 * Alka Refrigeration 2.0
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocketServer } = require('./lib/socketServer');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Initialize Socket.IO with WebSocket support
    initSocketServer(server);

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Alka Refrigeration ready on http://${hostname}:${port}`);
      console.log(`> Real-time Socket.IO active at ws://${hostname}:${port}/socket.io`);
    });
  })
  .catch((ex) => {
    console.error('Failed to start server:', ex.stack);
    process.exit(1);
  });
