import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { taskId: string } }
) {
  return NextResponse.json({
    taskId: params.taskId,
    status: 'COMPLETE',
    result: 'Demo result',
    totalCost: 0.053,
    agentCount: 4,
    duration: 35000,
    completedAt: Date.now(),
  });
}
