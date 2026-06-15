import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revokePermission } from '@/lib/data';

const schema = z.object({
  permissionId: z.string(),
  address: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { permissionId, address } = schema.parse(body);
    const ok = await revokePermission(permissionId, address);
    if (!ok) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
