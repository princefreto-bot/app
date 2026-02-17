import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

// MIME types mapping
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

// Try to find and serve a file
function serveFile(filePath, res) {
  try {
    const ext = extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const content = readFileSync(filePath);
    
    const headers = { 
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff'
    };
    
    // Cache static assets but not HTML
    if (ext !== '.html') {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }
    
    res.writeHead(200, headers);
    res.end(content);
    return true;
  } catch (error) {
    return false;
  }
}

// Check if path exists and is a file
function isFile(filePath) {
  try {
    return existsSync(filePath) && statSync(filePath).isFile();
  } catch {
    return false;
  }
}

// Create HTTP server
const server = createServer((req, res) => {
  // Parse URL
  let urlPath = req.url || '/';
  
  // Remove query strings and hash
  urlPath = urlPath.split('?')[0].split('#')[0];
  
  // Security: prevent directory traversal attacks
  urlPath = urlPath.replace(/\.\./g, '').replace(/\/\//g, '/');
  
  // Default to index.html for root
  if (urlPath === '/') {
    urlPath = '/index.html';
  }
  
  // Health check endpoint
  if (urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
    return;
  }
  
  // Try to serve from dist folder first
  let fullPath = join(__dirname, 'dist', urlPath);
  
  if (isFile(fullPath)) {
    if (serveFile(fullPath, res)) return;
  }
  
  // Try public folder for videos and other assets
  fullPath = join(__dirname, 'public', urlPath);
  
  if (isFile(fullPath)) {
    if (serveFile(fullPath, res)) return;
  }
  
  // SPA fallback: serve index.html for all other routes
  const indexPath = join(__dirname, 'dist', 'index.html');
  
  if (isFile(indexPath)) {
    if (serveFile(indexPath, res)) return;
  }
  
  // 404 Not Found
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head><title>404 - Not Found</title></head>
    <body style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1>404 - Page Not Found</h1>
      <p>The requested resource could not be found.</p>
      <a href="/">Go to Home</a>
    </body>
    </html>
  `);
});

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🎓 EduAnalytics SaaS Server Started      ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   🚀 Port: ${PORT}                             ║`);
  console.log(`║   🌐 http://localhost:${PORT}                  ║`);
  console.log('║   📊 Ready to analyze student data!        ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
});
