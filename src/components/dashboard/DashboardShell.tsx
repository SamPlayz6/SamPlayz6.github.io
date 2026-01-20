'use client'

import { useState } from 'react'
import ManualEntryModal, { ManualEntryFAB } from './ManualEntryModal'
import type { QuadrantCategory } from '@/types/dashboard'

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

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

      // Optionally show a success toast/notification here
      console.log('Entry saved successfully')
    } catch (error) {
      console.error('Error saving entry:', error)
      // Optionally show an error toast/notification here
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
