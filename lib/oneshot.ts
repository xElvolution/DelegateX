// Real 1Shot API client (https://docs.1shotapi.com/api/api.html).
//
// Flow:
//   1. OAuth client-credentials -> bearer token (cached until ~expiry).
//   2. POST /v0/methods/{methodId}/execute with {params} -> a transaction.
//   3. Poll /v0/transactions/{id} for the on-chain hash + status.
//
// 1Shot custodies the wallet, so the agent never holds a key here. Configure the
// contract-method endpoints (e.g. MockUSDC.transfer) in the 1Shot dashboard and
// put their ids in ONESHOT_METHOD_* env vars.

const BASE = process.env.ONESHOT_API_URL || 'https://api.1shotapi.com/v0';
const API_KEY = process.env.ONESHOT_API_KEY || '';
const API_SECRET = process.env.ONESHOT_API_SECRET || '';
const METHOD_TRANSFER = process.env.ONESHOT_METHOD_TRANSFER || '';

export interface RelayResult {
  txHash: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  id?: string;
}

export function isOneShotConfigured() {
  return Boolean(API_KEY && API_SECRET && METHOD_TRANSFER);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const res = await fetch(`${BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: API_KEY,
      client_secret: API_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`1Shot auth failed: ${res.status} ${await safeText(res)}`);
  }

  const data = await res.json();
  const token = data.access_token || data.accessToken || data.token;
  if (!token) throw new Error('1Shot auth: no token in response');

  const ttl = Number(data.expires_in || data.expiresIn || 3600) * 1000;
  cachedToken = { value: token, expiresAt: Date.now() + ttl };
  return token;
}

async function authed(path: string, init?: RequestInit) {
  const token = await getToken();
  return fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
}

/// Execute a configured contract method by id. Returns the created transaction.
export async function executeMethod(
  methodId: string,
  params: Record<string, unknown>
): Promise<RelayResult> {
  const res = await authed(`/methods/${methodId}/execute`, {
    method: 'POST',
    body: JSON.stringify({ params }),
  });

  if (!res.ok) {
    throw new Error(`1Shot execute failed: ${res.status} ${await safeText(res)}`);
  }

  const data = await res.json();
  const id = data.id || data.transactionId || data.transaction?.id;
  const immediateHash =
    data.transactionHash || data.txHash || data.hash || data.transaction?.transactionHash;

  if (immediateHash) {
    return { txHash: immediateHash, status: 'PENDING', id };
  }

  // No hash yet -> poll the transaction record for it.
  if (id) return pollTransaction(id);
  throw new Error('1Shot execute: no transaction id or hash returned');
}

async function pollTransaction(id: string, tries = 10): Promise<RelayResult> {
  for (let i = 0; i < tries; i++) {
    const res = await authed(`/transactions/${id}`);
    if (res.ok) {
      const tx = await res.json();
      const hash = tx.transactionHash || tx.txHash || tx.hash;
      const status = String(tx.status || '').toUpperCase();
      if (hash) {
        return {
          txHash: hash,
          id,
          status: status.includes('FAIL')
            ? 'FAILED'
            : status.includes('CONFIRM') || status.includes('COMPLETE')
              ? 'CONFIRMED'
              : 'PENDING',
        };
      }
    }
    await sleep(1500);
  }
  throw new Error(`1Shot: transaction ${id} produced no hash in time`);
}

/// Transfer MockUSDC from the 1Shot managed wallet to a recipient.
export async function oneShotTransfer(to: string, amountBaseUnits: bigint): Promise<RelayResult> {
  return executeMethod(METHOD_TRANSFER, { to, amount: amountBaseUnits.toString() });
}

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return '';
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
