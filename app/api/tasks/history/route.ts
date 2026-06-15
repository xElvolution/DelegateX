import { NextResponse } from 'next/server';
import { getTaskHistory, getDashboardStats } from '@/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  const [tasks, stats] = await Promise.all([
    getTaskHistory(address),
    getDashboardStats(address),
  ]);

  return NextResponse.json({ tasks, stats });
}
