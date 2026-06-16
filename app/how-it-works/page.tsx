'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Card } from '@/components/ui/Card';

const SECTIONS = [
  {
    id: 'permissions',
    title: 'The Permission Model',
    tag: 'ERC-7715',
    content: [
      'DELEGATE uses ERC-7715, a new standard for smart account permissions. When you grant a permission, you define exactly what DELEGATE can do: which tokens it can spend, how much per period, which contracts it can interact with, and when the permission expires.',
      'This is fundamentally different from token approvals. A traditional approval gives unlimited access to a specific token. An ERC-7715 permission is scoped, time-limited, and revocable at any time. Your MetaMask Smart Account enforces these constraints on-chain.',
      'You sign once. The permission lives on your smart account. Every future agent action is validated against this permission automatically - no more wallet popups.',
    ],
    code: `// ERC-7715 Permission Request
wallet_grantPermissions({
  permissions: [{
    type: "spend",
    data: {
      token: "0xA0b8...eB48", // USDC
      allowance: "10000000",  // $10
      period: 3600,           // per hour
      validUntil: 1748390400, // expiry
    },
    policies: [{
      type: "contract-call",
      data: { allowedContracts: [...] }
    }]
  }]
})`,
  },
  {
    id: 'coordination',
    title: 'Agent Coordination',
    tag: 'ERC-7710',
    content: [
      'When you submit a task, DELEGATE\'s orchestrator uses Venice AI to break it into subtasks. Each subtask gets its own specialized agent - a Data Fetcher, Chain Analyzer, AI Inference engine, or Executor.',
      'Each sub-agent receives a narrower permission slice via ERC-7710 redelegation. If you granted $10/hour, a Data Fetcher might get $1 with a 5-minute expiry. The sub-agent literally cannot exceed its budget - the smart contract enforces it.',
      'Sub-agents work in parallel when possible and sequentially when there are dependencies. The orchestrator monitors progress and synthesizes results when all subtasks complete.',
    ],
    code: `// ERC-7710 Redelegation
contract.spawnSubAgent({
  taskId: "0xabc...",
  subAgent: "0x123...",
  token: USDC_ADDRESS,
  budget: 1_000_000,    // $1 max
  expiry: now + 300,     // 5 minutes
  allowedContracts: [
    DEFI_LLAMA,
    VENICE_API
  ]
})`,
  },
  {
    id: 'payments',
    title: 'Autonomous Payments',
    tag: 'x402 + 1Shot',
    content: [
      'Sub-agents pay for resources using the x402 protocol - an HTTP-native payment standard. When an agent hits a paywalled API, the server responds with HTTP 402 and a payment request. The agent pays automatically using its delegated budget.',
      'All payments are relayed through 1Shot\'s permissionless relayer. 1Shot takes the ERC-7710 delegation and executes the payment on-chain without requiring the agent to hold any keys. The relayer verifies the delegation is valid, the budget isn\'t exceeded, and the target contract is allowed.',
      'The result: machine-to-machine payments that are instant, verifiable, and constrained by the user\'s original permission. No human in the loop.',
    ],
    code: `// x402 Payment Flow
// 1. Agent fetches resource
GET /api/defi-yields
→ 402 Payment Required
→ X-Payment: 0.001 USDC

// 2. Agent pays via 1Shot
POST /relay {
  delegation: erc7710Delegation,
  calls: [{
    to: USDC_ADDRESS,
    data: transfer(recipient, 1000)
  }]
}
→ { txHash: "0x..." }

// 3. Agent retries with proof
GET /api/defi-yields
X-Payment-Proof: 0x...
→ 200 OK { yields: [...] }`,
  },
  {
    id: 'privacy',
    title: 'Privacy-First AI',
    tag: 'Venice AI',
    content: [
      'DELEGATE uses Venice AI for all inference - task planning, data synthesis, and result generation. Venice runs Llama 3.3 70B with a privacy-first architecture: your prompts and data are never stored, logged, or used for training.',
      'This matters for Web3. When you ask DELEGATE to analyze your portfolio or find yield opportunities, the AI never sees your wallet address in a way that can be traced back to you. Venice\'s infrastructure ensures inference privacy by default.',
    ],
    code: null,
  },
  {
    id: 'security',
    title: 'Security Model',
    tag: 'Defense in depth',
    content: [
      'DELEGATE\'s security is enforced at multiple layers. On-chain: the smart contract checks every agent action against the user\'s permission - budget limits, allowed contracts, expiry times, and reentrancy guards. Off-chain: the orchestrator validates all sub-agent actions before submission.',
      'Key constraints: agents cannot spend more than their budget. Agents cannot interact with unapproved contracts. Permissions expire automatically. Users can revoke instantly. Sub-agent permissions are always narrower than the parent. The 1Shot relayer independently verifies every delegation.',
      'The contract includes Pausable for emergency stops and ReentrancyGuard on all payment functions. There is no admin key that can override user permissions.',
    ],
    code: null,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <div className="container-app py-16">
        <ScrollReveal>
          <h1 className="mb-2 text-center text-3xl font-bold tracking-tighter md:text-4xl">
            How DELEGATE Works
          </h1>
          <p className="mx-auto mb-16 max-w-lg text-center text-sm text-muted">
            A deep dive into the technology behind autonomous wallet intelligence.
          </p>
        </ScrollReveal>

        <div className="mx-auto max-w-3xl space-y-16">
          {SECTIONS.map((section, i) => (
            <ScrollReveal key={section.id} delay={i * 0.05}>
              <section id={section.id}>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight">
                    {section.title}
                  </h2>
                  <span className="mono rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-muted">
                    {section.tag}
                  </span>
                </div>
                <div className="space-y-4">
                  {section.content.map((p, pi) => (
                    <p key={pi} className="text-sm leading-relaxed text-white/75">
                      {p}
                    </p>
                  ))}
                </div>
                {section.code && (
                  <div className="mono mt-6 overflow-x-auto rounded-xl border border-white/10 bg-surface p-5 text-xs leading-relaxed text-white/80">
                    <pre>{section.code}</pre>
                  </div>
                )}
              </section>
            </ScrollReveal>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
