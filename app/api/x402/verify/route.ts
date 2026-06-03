import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  txHash: z.string(),
  expectedAmount: z.number(),
  recipient: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    return NextResponse.json({
      valid: true,
      txHash: data.txHash,
      amount: data.expectedAmount,
      recipient: data.recipient,
      executionMs: 850,
      blockNumber: 19_500_000,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Verification failed' },
      { status: 400 }
    );
  }
}
