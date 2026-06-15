import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createTaskRecord } from '@/lib/data';
import { executeTaskPipeline } from '@/agent/taskRunner';

const schema = z.object({
  prompt: z.string().min(1).max(2000),
  permissionId: z.string(),
  address: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, permissionId, address } = schema.parse(body);

    const task = await createTaskRecord({
      userAddress: address,
      permissionId,
      prompt,
    });

    void executeTaskPipeline({
      taskId: task.id,
      prompt,
      userAddress: address,
      permissionId,
    });

    return NextResponse.json({
      taskId: task.id,
      status: 'PENDING',
      prompt,
      permissionId,
      wsUrl: `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/${task.id}`,
      createdAt: task.createdAt,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
