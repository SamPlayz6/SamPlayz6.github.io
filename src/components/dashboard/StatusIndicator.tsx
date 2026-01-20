'use client'

import { motion } from 'framer-motion'

type Status = 'thriving' | 'balanced' | 'needs_attention' | 'dormant' | 'neglected'

interface StatusIndicatorProps {
  status: Status
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const statusConfig = {
  thriving: {
    color: 'bg-status-thriving',
    label: 'Thriving',
    animation: {
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 2 },
    },
  },
  balanced: {
    color: 'bg-emerald-400',
    label: 'Balanced',
    animation: {},
  },
  needs_attention: {
    color: 'bg-status-attention',
    label: 'Needs Attention',
    animation: {
      scale: [1, 1.2, 1],
      transition: { repeat: Infinity, duration: 1.5 },
    },
  },
  dormant: {
    color: 'bg-gray-500',
    label: 'Dormant',
    animation: {
      opacity: [0.5, 0.8, 0.5],
      transition: { repeat: Infinity, duration: 3 },
    },
  },
  neglected: {
    color: 'bg-status-neglected',
    label: 'Neglected',
    animation: {
      scale: [1, 1.3, 1],
      opacity: [1, 0.5, 1],
      transition: { repeat: Infinity, duration: 1 },
    },
  },
}

const sizeConfig = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export default function StatusIndicator({ status, size = 'md', showLabel = false }: StatusIndicatorProps) {
  const config = statusConfig[status] || statusConfig.balanced
  const sizeClass = sizeConfig[size]

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`${sizeClass} rounded-full ${config.color}`}
        animate={config.animation}
      />
      {showLabel && (
        <span className="text-sm text-dashboard-text-secondary">{config.label}</span>
      )}
    </div>
  )
}
