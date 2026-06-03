'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

const SECTIONS = [
  {
    id: 'quickstart',
    title: 'Quick Start',
    content: `## Quick Start

\`\`\`bash
# Clone and install
git clone https://github.com/delegate-app/delegate
cd delegate
npm install

# Set up environment
cp .env.local.example .env.local
# Fill in your API keys

# Run development server
npm run dev
\`\`\`

Visit \`http://localhost:3000\` and connect your MetaMask wallet.

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- A funded Ethereum wallet (testnet or mainnet)`,
  },
  {
    id: 'permissions',
    title: 'Permission API',
    content: `## Permission API

### Grant Permission

\`\`\`
POST /api/permissions/grant
\`\`\`

**Request Body:**
\`\`\`json
{
  "token": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "maxAmount": 10000000,
  "period": 3600,
  "expiry": 1748390400,
  "allowedContracts": [
    "0xVenice...",
    "0xDeFiLlama..."
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "id": "perm_abc123",
  "status": "ACTIVE",
  "erc7715Sig": "0x..."
}
\`\`\`

### Revoke Permission

\`\`\`
POST /api/permissions/revoke
\`\`\`

\`\`\`json
{ "permissionId": "perm_abc123" }
\`\`\`

### List Active Permissions

\`\`\`
GET /api/permissions/active
\`\`\``,
  },
  {
    id: 'agents',
    title: 'Agent API',
    content: `## Agent API

### Create Task

\`\`\`
POST /api/tasks/create
\`\`\`

\`\`\`json
{
  "prompt": "Research top 3 DeFi yields",
  "permissionId": "perm_abc123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "taskId": "task_xyz",
  "status": "PENDING",
  "wsUrl": "ws://localhost:3001/task_xyz"
}
\`\`\`

### Task Status

\`\`\`
GET /api/tasks/status/:taskId
\`\`\`

Returns SSE stream of task updates.

### Task History

\`\`\`
GET /api/tasks/history
\`\`\`

Returns all completed tasks with cost breakdown.`,
  },
  {
    id: 'websocket',
    title: 'WebSocket Events',
    content: `## WebSocket Events

Connect to \`ws://localhost:3001\` for real-time agent activity.

### Event Types

**AGENT_SPAWNED**
\`\`\`json
{
  "type": "AGENT_SPAWNED",
  "taskId": "task_xyz",
  "agent": {
    "id": "agent_001",
    "type": "DATA_FETCHER",
    "budget": 1.0,
    "status": "ACTIVE"
  },
  "timestamp": 1748300000
}
\`\`\`

**PAYMENT_MADE**
\`\`\`json
{
  "type": "PAYMENT_MADE",
  "taskId": "task_xyz",
  "agentId": "agent_001",
  "amount": 0.001,
  "recipient": "DeFiLlama",
  "oneShotTx": "0x...",
  "timestamp": 1748300002
}
\`\`\`

**TASK_COMPLETE**
\`\`\`json
{
  "type": "TASK_COMPLETE",
  "taskId": "task_xyz",
  "result": "...",
  "totalCost": 0.053,
  "agentCount": 4,
  "duration": 35000,
  "timestamp": 1748300035
}
\`\`\``,
  },
  {
    id: 'x402',
    title: 'x402 Integration',
    content: `## x402 Integration

DELEGATE uses x402 for machine-to-machine payments.

### Paying for Resources

\`\`\`typescript
import { payForResource } from '@/agent/x402';

const result = await payForResource(
  'https://api.example.com/data',
  0.01,        // max payment
  agentWallet, // sub-agent address
  delegation   // ERC-7710 delegation
);
// result.proof — payment proof header
// result.response — API response data
\`\`\`

### Creating x402-Gated Endpoints

\`\`\`typescript
import { create402Middleware } from '@/agent/x402';

const middleware = create402Middleware(
  0.001,
  'DeFi yield data access'
);

// Apply to your API route
export async function GET(req) {
  const payment = await middleware(req);
  if (!payment.valid) {
    return new Response(null, {
      status: 402,
      headers: payment.headers
    });
  }
  return Response.json({ data: '...' });
}
\`\`\``,
  },
  {
    id: 'contracts',
    title: 'Smart Contracts',
    content: `## Smart Contract Reference

### DelegateCore

Main permission and agent management contract.

**Key Functions:**

\`\`\`solidity
function grantPermission(
  address token,
  uint256 maxAmount,
  uint256 period,
  uint256 expiry,
  address[] calldata allowedContracts
) external

function revokePermission() external

function spawnSubAgent(
  bytes32 taskId,
  address subAgent,
  address token,
  uint256 budget,
  uint256 expiry
) external onlyOrchestrator

function executeWithPermission(
  address target,
  bytes calldata data,
  uint256 amount
) external onlySubAgent
\`\`\`

### SubAgentRegistry

Tracks all spawned sub-agents and task associations.

### X402PaymentVerifier

Verifies x402 payment proofs on-chain.`,
  },
  {
    id: 'examples',
    title: 'Code Examples',
    content: `## Code Examples

### Full Task Flow

\`\`\`typescript
// 1. Grant permission
const perm = await fetch('/api/permissions/grant', {
  method: 'POST',
  body: JSON.stringify({
    token: USDC_ADDRESS,
    maxAmount: 10_000_000,
    period: 3600,
    expiry: Math.floor(Date.now() / 1000) + 86400,
    allowedContracts: APPROVED_CONTRACTS,
  }),
});

// 2. Create task
const task = await fetch('/api/tasks/create', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Research top DeFi yields',
    permissionId: perm.id,
  }),
});

// 3. Listen for updates
const ws = new WebSocket(
  \`ws://localhost:3001/\${task.taskId}\`
);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'AGENT_SPAWNED':
      console.log('New agent:', data.agent);
      break;
    case 'PAYMENT_MADE':
      console.log('Payment:', data.amount);
      break;
    case 'TASK_COMPLETE':
      console.log('Result:', data.result);
      ws.close();
      break;
  }
};
\`\`\``,
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <div className="container-app flex gap-8 py-8">
        {/* Sidebar */}
        <aside className="sticky top-20 hidden h-fit w-48 shrink-0 lg:block">
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  'block rounded-md px-3 py-1.5 text-sm transition-colors',
                  activeSection === s.id
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted hover:text-white'
                )}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <h1 className="mb-8 text-2xl font-bold tracking-tighter">Documentation</h1>
          <div className="space-y-16">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id}>
                <div className="prose-invert prose-sm max-w-none">
                  <div className="space-y-4">
                    {section.content.split('\n\n').map((block, i) => {
                      if (block.startsWith('## ')) {
                        return (
                          <h2
                            key={i}
                            className="text-xl font-bold tracking-tight"
                          >
                            {block.replace('## ', '')}
                          </h2>
                        );
                      }
                      if (block.startsWith('### ')) {
                        return (
                          <h3
                            key={i}
                            className="mt-6 text-base font-semibold tracking-tight"
                          >
                            {block.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (block.startsWith('```')) {
                        const lines = block.split('\n');
                        const lang = lines[0].replace('```', '');
                        const code = lines.slice(1, -1).join('\n');
                        return (
                          <pre
                            key={i}
                            className="mono overflow-x-auto rounded-xl border border-white/10 bg-surface p-4 text-xs leading-relaxed text-white/80"
                          >
                            <code>{code}</code>
                          </pre>
                        );
                      }
                      if (block.startsWith('**')) {
                        const text = block.replace(/\*\*/g, '');
                        return (
                          <p key={i} className="text-sm font-semibold text-white">
                            {text}
                          </p>
                        );
                      }
                      return (
                        <p key={i} className="text-sm leading-relaxed text-white/75">
                          {block}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
