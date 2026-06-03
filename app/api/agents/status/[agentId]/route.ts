import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { agentId: string } }
) {
  return NextResponse.json({
    agentId: params.agentId,
    status: 'COMPLETE',
    spent: 0.053,
    result: 'Subtask result data',
    completedAt: Date.now(),
  });
}
