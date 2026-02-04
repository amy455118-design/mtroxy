/**
 * Simple Node.js CORS Proxy for Proxy6 Automator
 * 
 * HOW TO USE:
 * 1. Run this script: node server.js
 * 2. In the App Settings, set Custom Proxy URL to:
 *    http://<YOUR-SERVER-IP>:8080/proxy?url=
 * 
 * This server will forward requests to Proxy6 and add the necessary CORS headers
 * so your browser accepts the response.
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // 1. Handle CORS Preflight (OPTIONS)
  // This tells the browser: "Yes, you are allowed to talk to me."
  const setCorsHeaders = () => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  };

  setCorsHeaders();

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 2. Routing: Only accept requests to /proxy
  if (!parsedUrl.pathname.startsWith('/proxy')) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Proxy6 Automator Backend is Running. Use /proxy?url=... endpoint.');
    return;
  }

  // 3. Get the actual Target URL (Proxy6 API)
  const targetUrl = parsedUrl.query.url;

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing "url" query parameter' }));
    return;
  }

  // 4. Forward the request to Proxy6
  console.log(`[Proxy] Forwarding to: ${targetUrl}`);

  https.get(targetUrl, (proxyRes) => {
    // Forward the status code
    res.statusCode = proxyRes.statusCode;

    // Forward relevant headers from Proxy6, but ensure CORS is kept
    // (Node http sends headers immediately on writeHead, so we just pipe data mostly)
    
    // We force the content type to JSON as Proxy6 returns JSON
    res.setHeader('Content-Type', 'application/json');

    let body = '';

    proxyRes.on('data', (chunk) => {
      body += chunk;
    });

    proxyRes.on('end', () => {
      // Send the body back to the React App
      res.end(body);
    });

  }).on('error', (e) => {
    console.error(`[Proxy Error] ${e.message}`);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy request failed', details: e.message }));
  });
});

server.listen(PORT, () => {
  console.log(`----------------------------------------------------------`);
  console.log(`✅ Backend Proxy running on port ${PORT}`);
  console.log(`👉 Your Custom Proxy URL: http://localhost:${PORT}/proxy?url=`);
  console.log(`----------------------------------------------------------`);
});