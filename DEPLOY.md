# DELEGATE - Real deployment runbook (Base Sepolia)

Everything below is the "install, deploy, connect" sequence. The code is already
written to run against real on-chain state; this wires it up. No demo mode.

> Two env files, on purpose:
> - **`.env`** - read by **Foundry** (`forge`). Holds `PRIVATE_KEY` for deploying.
> - **`.env.local`** - read by **Next.js**. Holds `NEXT_PUBLIC_*`, agent + 1Shot + Venice keys.

---

## 0. Install dependencies

```bash
pnpm install                       # installs @openzeppelin/contracts too
forge install foundry-rs/forge-std # provides forge-std/Script.sol
```

If `forge install` complains about a dirty tree, commit your current changes
first - newer forge requires a clean git state.

## 1. Compile the contracts

```bash
pnpm contracts:build               # = forge build
```

All four should compile: `DelegateCore`, `SubAgentRegistry`, `X402PaymentVerifier`, `MockUSDC`.

## 2. Fund the deployer + set the key

- Get Base Sepolia ETH for your deployer wallet (Coinbase / Alchemy Base Sepolia faucet).
- Create `.env` (Foundry) in repo root:

```
PRIVATE_KEY=0xYOUR_DEPLOYER_KEY
# optional: separate agent + 1Shot managed wallet to seed with test USDC
AGENT_ADDRESS=0x...
ONESHOT_WALLET=0x...
```

## 3. Deploy to Base Sepolia

```bash
pnpm contracts:deploy
```

The script prints the four addresses and a ready-to-paste env block. Copy them.

## 4. Create `.env.local` (Next.js)

Copy `.env.local.example` to `.env.local` and fill:

```
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_DELEGATE_CORE_ADDRESS=0x...        # from step 3
NEXT_PUBLIC_SUB_AGENT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_X402_VERIFIER_ADDRESS=0x...
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...

# Agent wallet = viem-direct fallback that signs real transfers.
# Use the same key you put AGENT_ADDRESS for (must hold MockUSDC + a little ETH).
AGENT_PRIVATE_KEY=0xYOUR_AGENT_KEY

VENICE_API_KEY=...                              # step 6
NEXT_PUBLIC_DEMO_MODE=false
```

`AGENT_PRIVATE_KEY`'s address needs gas (Base Sepolia ETH) and test USDC. The
deploy script mints 100k MockUSDC to `AGENT_ADDRESS`; if you used the deployer as
the agent, it already has 1,000,000.

## 5. (Optional but sponsor-aligned) Wire 1Shot as the relayer

The app works with just `AGENT_PRIVATE_KEY` (viem-direct). To route agent spends
through 1Shot instead:

1. Create an account at https://1shotapi.com → API key + secret → Business ID.
2. Fund the 1Shot **managed wallet** with Base Sepolia ETH, and mint MockUSDC to it
   (`cast send <MockUSDC> "mint(address,uint256)" <managedWallet> 100000000000 --rpc-url https://sepolia.base.org --private-key $PRIVATE_KEY`).
3. In the 1Shot dashboard, add a **contract method endpoint** for `MockUSDC.transfer`
   on Base Sepolia. Copy its method id.
4. Add to `.env.local`:

```
ONESHOT_API_KEY=...
ONESHOT_API_SECRET=...
ONESHOT_BUSINESS_ID=...
ONESHOT_METHOD_TRANSFER=<method id from step 3>
```

When these are set, `relaySpend()` uses 1Shot; otherwise it uses the viem fallback.
Either way the tx is real and verifiable on Basescan.

## 6. Venice AI key

Get a key at https://venice.ai (API settings) → `VENICE_API_KEY` in `.env.local`.
Without it, planning/inference fall back to canned text (no fake on-chain data).

## 7. (Optional) Persistent DB - Neon Postgres

Without `DATABASE_URL` the app uses an in-memory store (data resets on restart).
For persistence across restarts (recommended for judging), use Neon:

```
DATABASE_URL=postgresql://...-pooler.../neondb?sslmode=require&pgbouncer=true   # runtime
DATABASE_DIRECT_URL=postgresql://.../neondb?sslmode=require                     # migrations
```
```bash
# Prisma reads .env (not .env.local); pass inline or copy the two DB vars:
DATABASE_URL='...' DATABASE_DIRECT_URL='...' pnpm prisma migrate dev
```

## 8. Run

```bash
pnpm dev:all                     # Next.js + the WebSocket server together
```

Open http://localhost:3000/app → connect MetaMask (Base Sepolia) → grant a
permission (you sign a real `grantPermission` tx) → run a task → watch the live
feed fill with real Basescan tx links → verify on the dashboard "On-chain proof"
panel.

---

## Verify it's real

```bash
# Real minted balance:
cast call <MockUSDC> "balanceOf(address)(uint256)" <yourWallet> --rpc-url https://sepolia.base.org

# Permission stored on-chain after you grant:
cast call <DelegateCore> "getRemainingBudget(address)(uint256)" <yourWallet> --rpc-url https://sepolia.base.org
```

Every tx hash shown in the UI should resolve on https://sepolia.basescan.org.
