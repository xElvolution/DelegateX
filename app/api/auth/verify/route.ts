import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifySiweMessage } from '@/lib/siwe';

const schema = z.object({
  message: z.string(),
  signature: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, signature } = schema.parse(body);

    const result = await verifySiweMessage(message, signature);
    if (!result.valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    return NextResponse.json({ address: result.address, authenticated: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Verification failed' },
      { status: 400 }
    );
  }
}
