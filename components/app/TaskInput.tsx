'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';

const EXAMPLE_TASKS = [
  'Research top DeFi yields today',
  'Summarize my wallet this week',
  'Find best gas time and batch txs',
  'Check if my positions are at risk',
];

export interface TaskInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  estimatedCost?: string;
}

export function TaskInput({ onSubmit, disabled, estimatedCost }: TaskInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (!prompt.trim() || disabled) return;
    onSubmit(prompt.trim());
  };

  return (
    <div>
      {/* Example chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {EXAMPLE_TASKS.map((task) => (
          <button
            key={task}
            onClick={() => setPrompt(task)}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted transition-colors hover:border-primary/30 hover:text-white"
          >
            {task}
          </button>
        ))}
      </div>

      {/* Input */}
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={`What would you like to delegate?\ne.g. 'Research the top 3 DeFi yields on Ethereum and summarize them'`}
        className="min-h-[120px] text-base"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
      />

      {/* Bottom bar */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted">
          {estimatedCost
            ? `Estimated cost: ${estimatedCost}`
            : prompt.trim()
              ? 'Estimated cost: $0.05–0.15'
              : ''}
        </span>
        <Button
          onClick={handleSubmit}
          disabled={disabled || !prompt.trim()}
          glow
        >
          Delegate
        </Button>
      </div>
    </div>
  );
}
