'use client'

import { useState } from 'react'
import ManualEntryModal, { ManualEntryFAB } from './ManualEntryModal'
import { ToastProvider, useToast } from './Toast'
import type { QuadrantCategory } from '@/types/dashboard'

interface DashboardShellProps {
  children: React.ReactNode
}

function DashboardShellInner({ children }: DashboardShellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (entry: {
    content: string
    category: QuadrantCategory
    imageUrl?: string
    link?: string
  }) => {
    try {
      const response = await fetch('/api/data/manual-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })

      if (!response.ok) {
        throw new Error('Failed to save entry')
      }

      showToast('Moment logged successfully!', 'success')
    } catch {
      showToast('Failed to save entry. Please try again.', 'error')
    }
  }

  return (
    <>
      {children}
      <ManualEntryFAB onClick={() => setIsModalOpen(true)} />
      <ManualEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <ToastProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </ToastProvider>
  )
}
