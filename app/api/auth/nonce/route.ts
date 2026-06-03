import { NextResponse } from 'next/server';
import { createNonce } from '@/lib/siwe';

export async function GET() {
  const nonce = createNonce();
  return NextResponse.json({ nonce });
}
