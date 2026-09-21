/*
 * Punto di ingresso per gli hosting Node.js gestiti, inclusa la modalità
 * "Other" di Hostinger. Avvia l'app Next.js già compilata usando la porta
 * assegnata dalla piattaforma.
 */
const { createServer } = require('node:http');
const next = require('next');

const port = Number.parseInt(process.env.PORT || '3000', 10);
const hostname = process.env.HOST || '0.0.0.0';
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((request, response) => handle(request, response))
      .once('error', (error) => {
        console.error('Impossibile avviare Next.js:', error);
        process.exit(1);
      })
      .listen(port, hostname, () => {
        console.log(`Confapi V1 pronta su http://${hostname}:${port}`);
      });
  })
  .catch((error) => {
    console.error('Impossibile preparare Next.js:', error);
    process.exit(1);
  });
