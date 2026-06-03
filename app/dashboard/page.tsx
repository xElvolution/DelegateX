'use client';

import { Header } from '@/components/layout/Header';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { PermissionManager } from '@/components/dashboard/PermissionManager';
import { TaskHistory } from '@/components/dashboard/TaskHistory';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <div className="container-app py-8">
        {/* Header row */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter">Dashboard</h1>
          <Badge tone="green" dot>
            Active Permission
          </Badge>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Chart */}
        <div className="mt-6">
          <SpendingChart />
        </div>

        {/* Permissions */}
        <div className="mt-6">
          <PermissionManager />
        </div>

        {/* History */}
        <div className="mt-6">
          <TaskHistory />
        </div>
      </div>
    </div>
  );
}
