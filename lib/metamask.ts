import type { WalletClient, PublicClient } from 'viem';
import { parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  Implementation,
  toMetaMaskSmartAccount,
} from '@metamask/smart-accounts-kit';
import { erc7715ProviderActions } from '@metamask/smart-accounts-kit/actions';
import { USDC_ADDRESS } from '@/lib/permissions';

export interface GrantPermissionInput {
  budget: number;
  periodSeconds: number;
  expiry: number;
  walletClient: WalletClient;
  publicClient: PublicClient;
  chainId: number;
}

export async function createSessionAccount(publicClient: PublicClient) {
  const agentKey = process.env.NEXT_PUBLIC_AGENT_SESSION_KEY;
  if (agentKey) {
    const account = privateKeyToAccount(agentKey as `0x${string}`);
    return toMetaMaskSmartAccount({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [account.address, [], [], []],
      deploySalt: '0x',
      signer: { account },
    });
  }

  return null;
}

export async function requestErc7715Permission(input: GrantPermissionInput) {
  const extended = input.walletClient.extend(erc7715ProviderActions());

  const sessionAccount = await createSessionAccount(input.publicClient);
  const expirySeconds = Math.floor(input.expiry / 1000);

  const granted = await extended.requestExecutionPermissions([
    {
      chainId: input.chainId,
      expiry: expirySeconds,
      to: (sessionAccount?.address ?? input.walletClient.account?.address) as `0x${string}`,
      permission: {
        type: 'erc20-token-periodic',
        data: {
          tokenAddress: USDC_ADDRESS as `0x${string}`,
          periodAmount: parseUnits(String(input.budget), 6),
          periodDuration: input.periodSeconds,
          justification: `DELEGATE autonomous agent spending — up to $${input.budget} USDC per period`,
        },
        isAdjustmentAllowed: true,
      },
    },
  ]);

  return {
    granted,
    sessionAddress: sessionAccount?.address,
    signature: JSON.stringify(granted),
  };
}

export async function getSmartAccountForUser(
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  const address = walletClient.account?.address;
  if (!address) throw new Error('Wallet not connected');

  return toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [address, [], [], []],
    deploySalt: '0x',
    // The kit's WalletClient type requires a non-optional `account`, but viem's
    // base WalletClient bakes `Account | undefined` into every method signature,
    // making the intersection unassignable. We guarded for `address` above, so
    // this cast is sound — the kit will see a concrete account at runtime.
    signer: { walletClient } as never,
  });
}
