const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const dataFile = path.join(rootDir, 'data', 'messages.json');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function ensureDataFile() {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf8');
  }
}

function readMessages() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function writeMessages(messages) {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(messages, null, 2), 'utf8');
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function serveStaticFile(req, res) {
  const requestPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const safePath = path.normalize(requestPath).replace(/^\.(?!\.)/, '');
  const filePath = path.join(rootDir, safePath);

  if (!filePath.startsWith(rootDir)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (requestPath === '/' || requestPath === '') {
        sendJson(res, 404, { error: 'Not found' });
        return;
      }
      fs.readFile(path.join(rootDir, 'index.html'), 'utf8', (indexErr, indexContent) => {
        if (indexErr) {
          sendJson(res, 404, { error: 'Not found' });
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexContent);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        sendJson(res, 500, { error: 'Failed to read file' });
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true, message: 'Portfolio backend is running' });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/contact') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = body ? JSON.parse(body) : {};
        const name = String(payload.name || '').trim();
        const email = String(payload.email || '').trim();
        const message = String(payload.message || '').trim();

        if (!name || !email || !message) {
          sendJson(res, 400, { ok: false, error: 'Please provide your name, email, and a message.' });
          return;
        }

        const messages = readMessages();
        messages.push({
          id: Date.now(),
          name,
          email,
          message,
          createdAt: new Date().toISOString()
        });
        writeMessages(messages);

        sendJson(res, 200, { ok: true, message: 'Message received successfully.' });
      } catch (error) {
        sendJson(res, 400, { ok: false, error: 'Invalid request body.' });
      }
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/messages') {
    sendJson(res, 200, { messages: readMessages() });
    return;
  }

  serveStaticFile(req, res);
});

server.listen(PORT, () => {
  console.log(`Portfolio server running on http://localhost:${PORT}`);
});
