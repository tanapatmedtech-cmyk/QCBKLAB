import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`[SYSTEM] Starting rebuilding server process...`);
  console.log(`[SYSTEM] Enviroment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[DEBUG] Vite Middleware Active (Development)');
  } else {
    // CRITICAL: Serve static files from /dist
    const distPath = path.resolve(process.cwd(), 'dist');
    console.log(`[PROD] Serving static files from: ${distPath}`);
    
    app.use(express.static(distPath));
    
    // SPA Fallback: ALL routes go to index.html
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SUCCESS] Web Application Live on Port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CRITICAL] Startup failed:', err);
  process.exit(1);
});
