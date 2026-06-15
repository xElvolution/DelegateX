import type { FeedEvent } from '@/types';

const WS_HTTP_URL =
  process.env.WS_HTTP_URL || `http://localhost:${process.env.WS_PORT || '3001'}`;

export async function broadcastTaskEvent(taskId: string, event: FeedEvent) {
  try {
    await fetch(`${WS_HTTP_URL}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, event }),
    });
  } catch (err) {
    console.error('[broadcast]', err);
  }
}
