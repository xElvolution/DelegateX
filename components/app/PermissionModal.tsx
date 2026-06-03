'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { cn, formatUSDC } from '@/lib/utils';

export interface PermissionModalProps {
  open: boolean;
  onClose: () => void;
  onGrant: (config: PermissionConfig) => void;
}

export interface PermissionConfig {
  budget: number;
  duration: number;
  durationLabel: string;
  contracts: string[];
}

const DURATIONS = [
  { label: '1 hour', value: 3600, ms: 3600 * 1000 },
  { label: '6 hours', value: 21600, ms: 21600 * 1000 },
  { label: '24 hours', value: 86400, ms: 86400 * 1000 },
  { label: '1 week', value: 604800, ms: 604800 * 1000 },
];

const CONTRACTS = [
  { name: 'Venice AI API', address: '0xVenice', default: true },
  { name: 'DeFiLlama', address: '0xDeFiLlama', default: true },
  { name: 'Uniswap v3', address: '0xUniswap', default: true },
  { name: 'Aave v3', address: '0xAave', default: true },
  { name: 'Compound', address: '0xCompound', default: false },
];

const BUDGET_PRESETS = [5, 10, 25, 50];

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

export function PermissionModal({ open, onClose, onGrant }: PermissionModalProps) {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState(10);
  const [durationIdx, setDurationIdx] = useState(2);
  const [contracts, setContracts] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CONTRACTS.map((c) => [c.name, c.default]))
  );
  const [granting, setGranting] = useState(false);

  const duration = DURATIONS[durationIdx];
  const enabledContracts = Object.entries(contracts)
    .filter(([, v]) => v)
    .map(([k]) => k);
  const expiryDate = new Date(Date.now() + duration.ms);

  const handleGrant = () => {
    setGranting(true);
    setTimeout(() => {
      onGrant({
        budget,
        duration: duration.value,
        durationLabel: duration.label,
        contracts: enabledContracts,
      });
      setGranting(false);
      setStep(0);
      onClose();
    }, 1500);
  };

  const canNext =
    step === 0 ? budget > 0 :
    step === 1 ? true :
    step === 2 ? enabledContracts.length > 0 :
    true;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Grant Permission"
      description="Configure what DELEGATE can do on your behalf."
      size="md"
    >
      {/* Step indicators */}
      <div className="mb-6 flex items-center gap-2">
        {['Budget', 'Duration', 'Contracts', 'Confirm'].map((label, i) => (
          <button
            key={label}
            onClick={() => i < step && setStep(i)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-colors',
              step === i
                ? 'bg-primary/15 font-semibold text-primary'
                : step > i
                  ? 'cursor-pointer text-white/60 hover:text-white'
                  : 'cursor-default text-muted'
            )}
          >
            <span
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold',
                step === i
                  ? 'bg-primary text-white'
                  : step > i
                    ? 'bg-success text-white'
                    : 'bg-white/10 text-muted'
              )}
            >
              {step > i ? '✓' : i + 1}
            </span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-[200px]"
        >
          {/* Step 1: Budget */}
          {step === 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Set Budget</h3>
              <p className="mb-6 text-xs text-muted">
                Maximum USDC per hour that agents can spend.
              </p>
              <Slider
                value={budget}
                min={1}
                max={100}
                step={1}
                onChange={setBudget}
                formatValue={(v) => `$${v}`}
              />
              <div className="mt-4 flex gap-2">
                {BUDGET_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setBudget(p)}
                    className={cn(
                      'mono rounded-md border px-3 py-1.5 text-xs transition-colors',
                      budget === p
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-white/10 text-muted hover:border-white/20'
                    )}
                  >
                    ${p}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted">
                Recommended for most tasks: $10/hr
              </p>
            </div>
          )}

          {/* Step 2: Duration */}
          {step === 1 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Set Duration</h3>
              <p className="mb-6 text-xs text-muted">
                Permission automatically expires after this period.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {DURATIONS.map((d, i) => (
                  <button
                    key={d.value}
                    onClick={() => setDurationIdx(i)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-colors',
                      durationIdx === i
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 hover:border-white/20'
                    )}
                  >
                    <div className="text-sm font-semibold">{d.label}</div>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted">
                Expires:{' '}
                <span className="text-white/70">
                  {expiryDate.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            </div>
          )}

          {/* Step 3: Contracts */}
          {step === 2 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Allowed Contracts</h3>
              <p className="mb-4 text-xs text-muted">
                Agents can only interact with these contracts.
              </p>
              <div className="space-y-2">
                {CONTRACTS.map((c) => (
                  <Toggle
                    key={c.name}
                    label={c.name}
                    description={c.address}
                    checked={contracts[c.name] ?? false}
                    onChange={(v) =>
                      setContracts((prev) => ({ ...prev, [c.name]: v }))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 3 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold">Confirm Permission</h3>
              <p className="mb-4 text-xs text-muted">
                DELEGATE will be able to:
              </p>
              <div className="space-y-2 rounded-xl border border-white/10 bg-surface/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-success">&#x2713;</span>
                  <span>
                    Spend up to{' '}
                    <span className="font-semibold text-primary">
                      {formatUSDC(budget)} USDC/hour
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-success">&#x2713;</span>
                  <span>Only on approved contracts ({enabledContracts.length})</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-success">&#x2713;</span>
                  <span>Expires automatically in {duration.label}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-success">&#x2713;</span>
                  <span>You can revoke anytime</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <Badge tone="orange" size="sm">
                  ERC-7715
                </Badge>
                <span className="text-xs text-muted">
                  This will open MetaMask for approval
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
        >
          {step > 0 ? 'Back' : 'Cancel'}
        </Button>
        {step < 3 ? (
          <Button size="sm" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        ) : (
          <Button glow loading={granting} onClick={handleGrant}>
            Grant Permission
          </Button>
        )}
      </div>
    </Modal>
  );
}
