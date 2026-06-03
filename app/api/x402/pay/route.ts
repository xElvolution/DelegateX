import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  url: z.string().url(),
  maxAmount: z.number().positive(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, maxAmount } = schema.parse(body);

    return NextResponse.json({
      proof: `0x${'a'.repeat(64)}`,
      url,
      amount: Math.min(0.01, maxAmount),
      status: 'PAID',
      timestamp: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Payment failed' },
      { status: 400 }
    );
  }
}
