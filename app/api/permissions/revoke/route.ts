import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  permissionId: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { permissionId } = schema.parse(body);

    return NextResponse.json({
      id: permissionId,
      status: 'REVOKED',
      revokedAt: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
