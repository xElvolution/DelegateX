import { NextResponse } from 'next/server';
import { getRecentPayments } from '@/lib/data';

export async function GET() {
  try {
    const payments = await getRecentPayments(20);
    return NextResponse.json({ payments });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load payments', payments: [] },
      { status: 500 }
    );
  }
}
