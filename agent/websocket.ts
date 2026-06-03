import { WebSocketServer, WebSocket } from 'ws';
import type { FeedEvent } from '../types';

const PORT = parseInt(process.env.WS_PORT || '3001', 10);

const wss = new WebSocketServer({ port: PORT });
const clients = new Map<string, Set<WebSocket>>();

wss.on('connection', (ws, req) => {
  const url = req.url || '';
  const taskId = url.replace('/', '') || 'global';

  if (!clients.has(taskId)) clients.set(taskId, new Set());
  clients.get(taskId)!.add(ws);

  ws.on('close', () => {
    clients.get(taskId)?.delete(ws);
  });

  ws.send(JSON.stringify({ type: 'CONNECTED', taskId, timestamp: Date.now() }));
});

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

console.log(`DELEGATE WebSocket server listening on ws://localhost:${PORT}`);
