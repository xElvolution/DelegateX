import { NextResponse } from 'next/server';
import { getActivePermissions } from '@/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  const permissions = await getActivePermissions(address);
  return NextResponse.json({ permissions });
}
