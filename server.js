/**
 * Production Node.js Server (ES Module Version)
 * 
 * 1. Serves the React Frontend (Static Files)
 * 2. Acts as the CORS Proxy Backend
 */

import http from 'http';
import https from 'https';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Try to detect the build output directory (Vite usually uses 'dist', CRA uses 'build')
const DIST_DIR = fs.existsSync(path.join(__dirname, 'dist')) 
  ? path.join(__dirname, 'dist') 
  : path.join(__dirname, 'build');

// MIME types to ensure browsers load files correctly
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // ==========================================
  // 1. PROXY API LOGIC
  // ==========================================
  if (parsedUrl.pathname.startsWith('/proxy')) {
    
    // CORS Headers (Allow frontend to talk to backend)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const targetUrl = parsedUrl.query.url;

    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing "url" query parameter' }));
      return;
    }

    // Forward request to Proxy6
    https.get(targetUrl, (proxyRes) => {
      res.statusCode = proxyRes.statusCode;
      res.setHeader('Content-Type', 'application/json');

      proxyRes.pipe(res); // Pipe data directly to response
    }).on('error', (e) => {
      console.error(`[Proxy Error] ${e.message}`);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy request failed', details: e.message }));
      }
    });
    return;
  }

  // ==========================================
  // 2. STATIC FILE SERVER (React App)
  // ==========================================
  
  // Normalize path (remove query strings, etc)
  let sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  let pathname = path.join(DIST_DIR, sanitizePath);

  // Check if file exists
  fs.stat(pathname, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file not found, serve index.html (SPA Fallback)
      // This is crucial for React Router and Health Checks
      pathname = path.join(DIST_DIR, 'index.html');
    }

    fs.readFile(pathname, (err, data) => {
      if (err) {
        // If even index.html fails, send a basic 404 or 500
        res.writeHead(500);
        res.end(`Error loading ${sanitizePath} or index.html`);
        return;
      }

      const ext = path.extname(pathname);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`✅ Production Server running on port ${PORT}`);
  console.log(`📂 Serving static files from: ${DIST_DIR}`);
});