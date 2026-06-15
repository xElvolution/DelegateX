import { NextResponse } from 'next/server';
import { getTaskDetail } from '@/lib/data';

export async function GET(
  _req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const task = await getTaskDetail(params.taskId);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ task });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load task' },
      { status: 500 }
    );
  }
}
