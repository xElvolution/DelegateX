import { NextResponse } from 'next/server';
import { z } from 'zod';
import { publicClient } from '@/lib/chain';

const schema = z.object({
  txHash: z.string(),
  expectedAmount: z.number().optional(),
  recipient: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Real verification: look up the transaction receipt on Base Sepolia.
    const receipt = await publicClient.getTransactionReceipt({
      hash: data.txHash as `0x${string}`,
    });

    return NextResponse.json({
      valid: receipt.status === 'success',
      txHash: data.txHash,
      recipient: data.recipient ?? receipt.to,
      amount: data.expectedAmount,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status,
    });
  } catch (err) {
    return NextResponse.json(
      { valid: false, error: err instanceof Error ? err.message : 'Verification failed' },
      { status: 400 }
    );
  }
}
