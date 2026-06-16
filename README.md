# DELEGATE

**One permission. Infinite agents.**

DELEGATE is a Web3 task delegation platform: a user grants a single,
budget-capped, time-bound spending permission, and an autonomous agent swarm
plans, spawns sub-agents, and executes the task on-chain - without ever asking
the user to sign another transaction.

Submission for the **1Shot API × x402 × Venice AI Dev Cook Off**.

---

## Live on Base Sepolia (chain 84532)

All four contracts are deployed and **verified** on Basescan.

| Contract | Address |
| --- | --- |
| `MockUSDC` | [`0x9fb8F70371C5b64680593BC284DE82ea08C19BC8`](https://sepolia.basescan.org/address/0x9fb8F70371C5b64680593BC284DE82ea08C19BC8#code) |
| `SubAgentRegistry` | [`0xD2624D25f638d6e7D6A48111c181D3Bc52EAb0fB`](https://sepolia.basescan.org/address/0xD2624D25f638d6e7D6A48111c181D3Bc52EAb0fB#code) |
| `X402PaymentVerifier` | [`0xdE89771dE48344366180af7819500B3C75014798`](https://sepolia.basescan.org/address/0xdE89771dE48344366180af7819500B3C75014798#code) |
| `DelegateCore` | [`0x543b4b8c50387cfdc3507162A3e2276e10452eE9`](https://sepolia.basescan.org/address/0x543b4b8c50387cfdc3507162A3e2276e10452eE9#code) |

---

## How it works

1. **You grant** - Connect MetaMask, sign one `grantPermission` tx on
   `DelegateCore`. That puts a budget + expiry + allow-list on-chain. The tx
   hash shows up on Basescan; the app links it.
2. **AI plans** - Venice AI (Llama 3.3 70B) decomposes your prompt into a
   subtask DAG. Sub-agents run in parallel where possible.
3. **Agents pay** - Each subtask's cost is a real `MockUSDC.transfer` on Base
   Sepolia, routed through 1Shot's managed-wallet relayer (or a viem-direct
   fallback). Every payment shows up in the live feed as a clickable Basescan
   link.
4. **You verify** - Dashboard → "On-chain proof" lists deployed contracts and
   recent agent txs. Activity page is a unified on-chain feed.

No simulated hashes. No `0xaaaa…` placeholders. If a tx is shown, it landed.

## Sponsor stack

- **MetaMask** - wallet connect + SIWE auth + the user-signed
  `grantPermission` tx + ERC-7715 erc20-token-periodic permission (best-effort).
- **1Shot API** - OAuth client-credentials → managed wallet relays every agent
  spend (`MockUSDC.transfer`). Falls back to a viem-direct path so demos work
  before the 1Shot dashboard is configured.
- **x402 Protocol** - Payment-gated resource flow with real on-chain payment
  records on `X402PaymentVerifier`.
- **Venice AI** - Llama 3.3 70B for task planning and result synthesis. No
  data leaves Venice's privacy boundary.

## Stack

Next.js 14 (App Router) · Tailwind · Framer Motion · GSAP ·
wagmi + viem · RainbowKit · Prisma + Neon Postgres (optional) ·
Foundry · Solidity 0.8.20 · OpenZeppelin v5

## App surfaces

- `/` - landing
- `/app` - task workspace (grant → run → live feed)
- `/app/agents` - sub-agent swarm view (live + historical)
- `/app/activity` - unified on-chain feed with Basescan links
- `/app/task/[id]` - task detail (plan, sub-agents, payment hashes, result)
- `/app/wallet` - balances + 1,000-USDC faucet button
- `/app/dashboard` - stats, spending, permissions, on-chain proof panel
- `/how-it-works` - explainer

## Run it

See [`DEPLOY.md`](./DEPLOY.md) for the full runbook. Short version:

```bash
pnpm install
forge install foundry-rs/forge-std
cp .env.local.example .env.local      # then fill PRIVATE_KEY + addresses + Venice key
pnpm contracts:build
pnpm contracts:deploy                 # to Base Sepolia
pnpm dev:all                          # Next + WebSocket server
```

Open <http://localhost:3000/app>, connect MetaMask (Base Sepolia), grant a
permission, run a task, watch real tx hashes fill the feed.

## License

[MIT](./LICENSE).
