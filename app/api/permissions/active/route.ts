import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    permissions: [
      {
        id: 'perm_demo',
        status: 'ACTIVE',
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        tokenSymbol: 'USDC',
        maxAmount: 10,
        period: 3600,
        expiry: Date.now() + 24 * 3600_000,
        spent: 2.57,
        remaining: 7.43,
        allowedContracts: ['Venice AI', 'DeFiLlama', 'Uniswap v3', 'Aave v3'],
      },
    ],
  });
}
