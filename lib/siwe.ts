import { generateNonce, SiweMessage } from 'siwe';

export function createNonce(): string {
  return generateNonce();
}

export function createSiweMessage(params: {
  address: string;
  chainId: number;
  nonce: string;
  domain?: string;
  uri?: string;
}): string {
  const message = new SiweMessage({
    domain: params.domain || 'delegate.app',
    address: params.address,
    statement: 'Sign in to DELEGATE - Autonomous Wallet Intelligence',
    uri: params.uri || 'https://delegate.app',
    version: '1',
    chainId: params.chainId,
    nonce: params.nonce,
  });
  return message.prepareMessage();
}

export async function verifySiweMessage(
  message: string,
  signature: string
): Promise<{ address: string; valid: boolean }> {
  try {
    const siweMessage = new SiweMessage(message);
    const result = await siweMessage.verify({ signature });
    return {
      address: result.data.address,
      valid: result.success,
    };
  } catch {
    return { address: '', valid: false };
  }
}
