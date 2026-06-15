'use client';

import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { PermissionManager } from '@/components/dashboard/PermissionManager';
import { OnchainProof } from '@/components/dashboard/OnchainProof';
import { TaskHistory } from '@/components/dashboard/TaskHistory';
import { Badge } from '@/components/ui/Badge';
import { useWallet } from '@/hooks/useWallet';

export default function AppDashboardPage() {
  const { authenticated } = useWallet();

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tighter">Dashboard</h2>
          <p className="mt-1 text-sm text-muted">
            Task history, spending, and permission management.
          </p>
        </div>
        {authenticated ? (
          <Badge tone="green" dot>
            Wallet connected
          </Badge>
        ) : (
          <Badge tone="muted">Connect wallet for live data</Badge>
        )}
      </div>

      <DashboardStats />

      <div className="mt-6">
        <OnchainProof />
      </div>

      <div className="mt-6">
        <SpendingChart />
      </div>

      <div className="mt-6">
        <PermissionManager />
      </div>

      <div className="mt-6">
        <TaskHistory />
      </div>
    </div>
  );
}
