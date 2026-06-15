import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createPermission } from '@/lib/data';

const schema = z.object({
  address: z.string(),
  token: z.string(),
  maxAmount: z.number().positive(),
  period: z.number().positive(),
  expiry: z.number().positive(),
  allowedContracts: z.array(z.string()),
  erc7715Sig: z.string().optional(),
  grantTxHash: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const permission = await createPermission({
      userAddress: data.address,
      maxAmount: data.maxAmount,
      periodSeconds: data.period,
      expiry: data.expiry,
      allowedContracts: data.allowedContracts,
      erc7715Sig: data.erc7715Sig,
      grantTxHash: data.grantTxHash,
    });

    return NextResponse.json({ permission });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    );
  }
}
