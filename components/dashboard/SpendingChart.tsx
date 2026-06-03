'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { SpendingPoint } from '@/types';

const MOCK_DATA: SpendingPoint[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: Number((Math.random() * 0.5 + 0.01).toFixed(3)),
  };
});

export function SpendingChart() {
  return (
    <div className="card-surface p-5">
      <h3 className="mb-4 text-sm font-semibold">Spending (30 days)</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_DATA}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F6851B" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#F6851B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#6B7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: '#16161F',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(val: number) => [`$${val.toFixed(3)}`, 'USDC']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#F6851B"
              strokeWidth={2}
              fill="url(#spendGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
