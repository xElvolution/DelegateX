export async function payForResource(
  url: string,
  maxAmount: number,
  agentWallet: string,
  delegation: unknown
): Promise<{ proof: string; response: unknown }> {
  // Step 1: fetch resource
  const initial = await fetch(url);

  if (initial.status !== 402) {
    return { proof: '', response: await initial.json() };
  }

  // Step 2: parse payment request from 402 response
  const paymentAmount = initial.headers.get('X-Payment-Amount') || '0';
  const paymentRecipient = initial.headers.get('X-Payment-Recipient') || '';
  const amount = parseFloat(paymentAmount);

  if (amount > maxAmount) {
    throw new Error(`Payment ${amount} exceeds max ${maxAmount}`);
  }

  // Step 3: pay via 1Shot relayer using delegation
  const { relayTransaction } = await import('./oneshot');
  const relay = await relayTransaction(
    delegation as never,
    [
      {
        to: paymentRecipient,
        value: BigInt(0),
        data: '0x',
      },
    ]
  );

  // Step 4: retry with payment proof
  const retried = await fetch(url, {
    headers: {
      'X-Payment-Proof': relay.txHash,
    },
  });

  return {
    proof: relay.txHash,
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
          'X-Payment-Network': 'ethereum',
          'X-Payment-Token': 'USDC',
        },
      };
    }

    // In production, verify the payment proof on-chain
    return { valid: true, headers: {} };
  };
}
