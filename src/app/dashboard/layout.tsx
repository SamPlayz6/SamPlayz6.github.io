import type { Metadata } from 'next'
import DashboardShell from '@/components/dashboard/DashboardShell'

export const metadata: Metadata = {
  title: 'Life Dashboard | Sam Dunning',
  description: 'Personal life companion and tracking system',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-dashboard-bg">
      <DashboardShell>
        {children}
      </DashboardShell>
    </div>
  )
}
