import { NextResponse } from 'next/server';
import { z } from 'zod';
import { uid } from '@/lib/utils';

const schema = z.object({
  prompt: z.string().min(1).max(2000),
  permissionId: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, permissionId } = schema.parse(body);

    const taskId = uid();

    return NextResponse.json({
      taskId,
      status: 'PENDING',
      prompt,
      permissionId,
      wsUrl: `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/${taskId}`,
      createdAt: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
