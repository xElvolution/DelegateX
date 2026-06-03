import { NextResponse } from 'next/server';
import { z } from 'zod';
import { uid } from '@/lib/utils';

const schema = z.object({
  token: z.string(),
  maxAmount: z.number().positive(),
  period: z.number().positive(),
  expiry: z.number().positive(),
  allowedContracts: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    return NextResponse.json({
      id: `perm_${uid()}`,
      status: 'ACTIVE',
      token: data.token,
      maxAmount: data.maxAmount,
      period: data.period,
      expiry: data.expiry,
      allowedContracts: data.allowedContracts,
      erc7715Sig: `0x${'0'.repeat(130)}`,
      createdAt: Date.now(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
