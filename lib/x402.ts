// x402 payment flow for accessing payment-gated resources. When a resource
// returns HTTP 402, the agent makes a REAL on-chain USDC payment (via 1Shot or
// the viem-direct fallback) and records it on the X402PaymentVerifier contract,
// then retries with the payment proof (tx hash).

import { relaySpend, recordPaymentOnchain, agentAddress } from '@/lib/agent-wallet';

export async function payForResource(
  url: string,
  maxAmount: number,
  agentWallet: string,
  _delegation: unknown
): Promise<{ proof: string; response: unknown }> {
  // Step 1: fetch resource
  const initial = await fetch(url);

  if (initial.status !== 402) {
    return { proof: '', response: await initial.json() };
  }

  // Step 2: parse payment request from the 402 response
  const paymentAmount = initial.headers.get('X-Payment-Amount') || '0';
  const paymentRecipient = initial.headers.get('X-Payment-Recipient') || '';
  const amount = parseFloat(paymentAmount);

  if (amount > maxAmount) {
    throw new Error(`Payment ${amount} exceeds max ${maxAmount}`);
  }

  // Step 3: real on-chain payment + record on the verifier contract
  const spend = await relaySpend({ amountUsdc: amount, to: paymentRecipient || undefined });
  await recordPaymentOnchain({
    payer: agentAddress() || agentWallet,
    recipient: paymentRecipient || agentWallet,
    amountUsdc: amount,
    resourceId: url,
  });

  // Step 4: retry with payment proof (the tx hash)
  const retried = await fetch(url, {
    headers: { 'X-Payment-Proof': spend.txHash },
  });

  return {
    proof: spend.txHash,
    response: await retried.json(),
  };
}

export async function create402Middleware(amount: number, description: string) {
  return async (req: Request) => {
    const proof = req.headers.get('X-Payment-Proof');

    if (!proof) {
      return {
        valid: false,
        headers: {
          'X-Payment-Amount': amount.toString(),
          'X-Payment-Description': description,
          'X-Payment-Network': 'base-sepolia',
          'X-Payment-Token': 'USDC',
        },
      };
    }

    // A proof header (tx hash) is present; treat as paid.
    return { valid: true, headers: {} };
  };
}
