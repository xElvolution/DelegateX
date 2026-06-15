import { NextResponse } from 'next/server';
import { z } from 'zod';
import { relaySpend, recordPaymentOnchain, agentAddress, spendingEnabled } from '@/lib/agent-wallet';

const schema = z.object({
  url: z.string().url(),
  maxAmount: z.number().positive(),
  recipient: z.string().optional(),
  amount: z.number().positive().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, maxAmount, recipient, amount } = schema.parse(body);

    if (!spendingEnabled()) {
      return NextResponse.json(
        { error: 'On-chain spending not configured (set AGENT_PRIVATE_KEY or 1Shot env)' },
        { status: 503 }
      );
    }

    const pay = Math.min(amount ?? 0.001, maxAmount);
    const spend = await relaySpend({ amountUsdc: pay, to: recipient });
    await recordPaymentOnchain({
      payer: agentAddress() || '',
      recipient: recipient || '',
      amountUsdc: pay,
      resourceId: url,
    });

    return NextResponse.json({
      proof: spend.txHash,
      via: spend.via,
      url,
      amount: pay,
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
