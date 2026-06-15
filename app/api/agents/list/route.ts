import { NextResponse } from 'next/server';
import { getAgentsForUser } from '@/lib/data';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    if (!address) return NextResponse.json({ agents: [] });
    const agents = await getAgentsForUser(address);
    return NextResponse.json({ agents });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to load agents', agents: [] },
      { status: 500 }
    );
  }
}
