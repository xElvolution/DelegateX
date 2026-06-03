import { NextResponse } from 'next/server';

const MOCK_HISTORY = [
  {
    id: 'task_1',
    prompt: 'Research the top 3 DeFi yields on Ethereum and move $50 to the best one',
    status: 'COMPLETE',
    totalCost: 0.056,
    agentCount: 4,
    duration: 35000,
    signatures: 0,
    createdAt: Date.now() - 3600_000,
    completedAt: Date.now() - 3600_000 + 35000,
  },
  {
    id: 'task_2',
    prompt: 'Check if my Aave position is at liquidation risk',
    status: 'COMPLETE',
    totalCost: 0.012,
    agentCount: 2,
    duration: 8000,
    signatures: 0,
    createdAt: Date.now() - 7200_000,
    completedAt: Date.now() - 7200_000 + 8000,
  },
];

export async function GET() {
  return NextResponse.json({ tasks: MOCK_HISTORY });
}
