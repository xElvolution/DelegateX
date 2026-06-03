export interface DelegationConfig {
  delegator: string;
  delegate: string;
  token: string;
  amount: bigint;
  expiry: number;
}

export interface Call {
  to: string;
  value: bigint;
  data: string;
}

export interface RelayResult {
  txHash: string;
  status: string;
}

export interface RelayStatus {
  txHash: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  blockNumber?: number;
  gasUsed?: string;
}

const ONESHOT_URL = process.env.ONESHOT_RELAYER_URL || 'https://api.1shot.io';
const ONESHOT_KEY = process.env.ONESHOT_API_KEY || '';

export async function relayTransaction(
  delegation: DelegationConfig,
  calls: Call[]
): Promise<RelayResult> {
  const response = await fetch(`${ONESHOT_URL}/relay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ONESHOT_KEY}`,
    },
    body: JSON.stringify({ delegation, calls }),
  });

  if (!response.ok) {
    throw new Error(`1Shot relay failed: ${response.status}`);
  }

  return response.json();
}

export async function getRelayStatus(txHash: string): Promise<RelayStatus> {
  const response = await fetch(`${ONESHOT_URL}/status/${txHash}`, {
    headers: { Authorization: `Bearer ${ONESHOT_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`1Shot status check failed: ${response.status}`);
  }

  return response.json();
}
