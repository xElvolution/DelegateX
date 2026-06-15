import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import type { FeedEvent } from '../types';

const PORT = parseInt(process.env.WS_PORT || '3001', 10);

const clients = new Map<string, Set<WebSocket>>();

function subscribe(taskId: string, ws: WebSocket) {
  if (!clients.has(taskId)) clients.set(taskId, new Set());
  clients.get(taskId)!.add(ws);
}

function unsubscribe(taskId: string, ws: WebSocket) {
  clients.get(taskId)?.delete(ws);
}

export function broadcast(taskId: string, event: FeedEvent): void {
  const subscribers = clients.get(taskId);
  if (!subscribers) return;

  const payload = JSON.stringify(event);
  for (const ws of subscribers) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  }
}

export function broadcastAll(event: FeedEvent): void {
  const payload = JSON.stringify(event);
  for (const subscribers of clients.values()) {
    for (const ws of subscribers) {
      if (ws.readyState === WebSocket.OPEN) ws.send(payload);
    }
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/broadcast') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { taskId, event } = JSON.parse(body) as {
          taskId: string;
          event: FeedEvent;
        };
        broadcast(taskId, event);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400);
        res.end('Invalid payload');
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url = req.url || '';
  const taskId = url.replace('/', '') || 'global';

  subscribe(taskId, ws);

  ws.on('close', () => {
    unsubscribe(taskId, ws);
  });

  ws.send(JSON.stringify({ type: 'CONNECTED', taskId, timestamp: Date.now() }));
});

server.listen(PORT, () => {
  console.log(`DELEGATE WebSocket server listening on ws://localhost:${PORT}`);
  console.log(`DELEGATE broadcast HTTP on http://localhost:${PORT}/broadcast`);
});
