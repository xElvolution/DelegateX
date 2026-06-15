import { NextResponse } from 'next/server';
import { getActivity } from '@/lib/data';

export async function GET() {
  try {
    const items = await getActivity(40);
    return NextResponse.json({ items });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load activity', items: [] },
      { status: 500 }
    );
  }
}
