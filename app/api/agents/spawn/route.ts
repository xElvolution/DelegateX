import { NextResponse } from 'next/server';
import { z } from 'zod';
import { uid } from '@/lib/utils';

const schema = z.object({
  taskId: z.string(),
  agentType: z.string(),
  budget: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    return NextResponse.json({
      agentId: `agent_${uid()}`,
      taskId: data.taskId,
      type: data.agentType,
      budget: data.budget,
      status: 'ACTIVE',
      spawnedAt: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
