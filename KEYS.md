# API keys & secrets — acquisition guide

Status of your `.env.local` as of setup. Get the ones marked **NEEDED**; the
rest are optional (the app runs without them).

| Var | Status | Priority |
| --- | --- | --- |
| Contract addresses (4) | ✅ set | done |
| `PRIVATE_KEY` / `AGENT_PRIVATE_KEY` | ✅ set | done |
| `BASESCAN_API_KEY` | ✅ set | done |
| `NEXTAUTH_SECRET` | ✅ generated | done |
| `ONESHOT_API_KEY` / `_SECRET` / `_BUSINESS_ID` | ✅ set | done |
| `ONESHOT_METHOD_TRANSFER` | ⬜ empty | **recommended** |
| `VENICE_API_KEY` | ⬜ empty | **NEEDED for real AI** |
| `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` | ⬜ empty | optional |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ⬜ empty | optional |
| `DATABASE_URL` + Supabase | ⬜ empty | optional |

---

## 1. Venice AI — `VENICE_API_KEY`  ← get this first

Without it, task planning and synthesis fall back to canned text (on-chain txs
are still real, but the "AI" part is fake). It's a sponsor, so you want it real.

1. Go to <https://venice.ai> and sign in.
2. Open **Settings → API** (or <https://venice.ai/settings/api>).
3. Venice API access requires either a Pro account or VVV staking — check the
   API page for the current requirement.
4. Click **Generate New API Key**, copy it.
5. Put it in `.env.local`:
   ```
   VENICE_API_KEY=your_key_here
   ```
6. Confirm the model id. The code uses `llama-3.3-70b`. Verify it's listed at
   <https://docs.venice.ai/api-reference/endpoint/models/list> — if Venice
   renamed it, update the three `model:` lines in `lib/venice.ts`.

## 2. 1Shot transfer method — `ONESHOT_METHOD_TRANSFER`  ← upgrades spending path

You already have the 1Shot account, API key, secret, and Business ID. The only
missing piece is the configured contract-method endpoint id. Without it, agent
spends use the viem-direct fallback (still real txs, just not via 1Shot).

1. Log in at <https://app.1shotapi.com>.
2. **Fund the 1Shot managed wallet** for Base Sepolia: copy its address from the
   dashboard, then mint it test USDC from your deployer:
   ```bash
   cd /Users/mac/Hackathons/delegatex && set -a && . ./.env.local && set +a
   ~/.foundry/bin/cast send $NEXT_PUBLIC_MOCK_USDC_ADDRESS \
     "mint(address,uint256)" <ONESHOT_MANAGED_WALLET> 100000000000 \
     --rpc-url https://sepolia.base.org --private-key $PRIVATE_KEY
   ```
   (Also send it a little Base Sepolia ETH for gas, or enable 1Shot gas funding.)
3. Create a **Contract Method** endpoint:
   - Chain: **Base Sepolia (84532)**
   - Contract address: your MockUSDC `0x9fb8F703…C19BC8`
   - Function: `transfer(address to, uint256 amount)`
4. Save it and copy the **Contract Method ID**.
5. Put it in `.env.local`:
   ```
   ONESHOT_METHOD_TRANSFER=the_method_id
   ONESHOT_WALLET=0xThe1ShotManagedWalletAddress
   ```
   When set, `relaySpend()` automatically routes through 1Shot instead of viem.

## 3. MetaMask Embedded Wallets — `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`  ← optional

Enables social/email sign-in (Phase 5). Without it, the app uses normal MetaMask.

1. Go to <https://developer.metamask.io> and sign in.
2. Create a project → **Embedded Wallets**.
3. Copy the **Client ID**.
4. Under **Allowed Origins**, add `http://localhost:3000` (Sapphire Devnet
   allows localhost; Mainnet does not).
5. Put in `.env.local`:
   ```
   NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=your_client_id
   NEXT_PUBLIC_WEB3AUTH_NETWORK=devnet
   ```

## 4. WalletConnect — `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`  ← optional

Only needed if you want the WalletConnect connector (mobile wallets) in the
injected-MetaMask path.

1. Go to <https://cloud.reown.com> (formerly WalletConnect Cloud).
2. Create a project, copy the **Project ID**.
3. ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

## 5. Neon Postgres (persistence) — `DATABASE_URL` + `DATABASE_DIRECT_URL`  ← optional

Without these, the app uses an in-memory store (data resets when the server
restarts). For data that survives restarts (nice for judging):

1. Create a project at <https://console.neon.tech>.
2. **Dashboard → Connection Details**. Neon gives two host forms:
   - **Pooled** (host contains `-pooler`) → `DATABASE_URL` (runtime queries).
     Append `&pgbouncer=true` so Prisma disables prepared statements.
   - **Direct** (same host without `-pooler`) → `DATABASE_DIRECT_URL`
     (used by `prisma migrate`; the pooler can't run migrations).
   ```
   DATABASE_URL=postgresql://USER:PASS@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require&pgbouncer=true
   DATABASE_DIRECT_URL=postgresql://USER:PASS@ep-xxx.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
3. Create the tables (Prisma reads `.env`, not `.env.local`, so pass inline or
   copy the two vars into `.env` first):
   ```bash
   DATABASE_URL='...' DATABASE_DIRECT_URL='...' pnpm prisma migrate dev --name init
   ```

---

