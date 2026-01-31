'use client'

import { motion } from 'framer-motion'
import StatusIndicator from './StatusIndicator'

type Status = 'thriving' | 'needs_attention' | 'neglected' | 'balanced' | 'dormant'

interface Actionable {
  id: string
  suggestion: string
  priority: 'low' | 'medium' | 'high'
  effort: 'easy' | 'medium' | 'hard'
  impact: 'small' | 'medium' | 'large'
}

interface ValuesAlignment {
  score: number
  livingWell: string[]
  needsAttention: string[]
  note: string
}

interface RightNowData {
  weekOf: string
  quadrantStatuses: {
    relationships: Status
    parkour: Status
    work: Status
    travel: Status
  }
  summary: string
  valuesAlignment: ValuesAlignment
  actionables: Actionable[]
  celebration: string
  friendlyNote: string
}

interface RightNowPanelProps {
  data: RightNowData
}

const priorityColors = {
  low: 'text-status-thriving',
  medium: 'text-status-attention',
  high: 'text-status-neglected',
}

const quadrantLabels = {
  relationships: { name: 'Relationships', color: 'text-quadrant-relationships' },
  parkour: { name: 'Parkour', color: 'text-quadrant-parkour' },
  work: { name: 'Work', color: 'text-quadrant-work' },
  travel: { name: 'Travel', color: 'text-quadrant-travel' },
}

export default function RightNowPanel({ data }: RightNowPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dashboard-card rounded-xl p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Right Now</h2>
          <p className="text-sm text-dashboard-text-muted">Week of {data.weekOf}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-dashboard-text-secondary">Values Alignment</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-quadrant-parkour to-quadrant-travel bg-clip-text text-transparent">
            {data.valuesAlignment.score}%
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(Object.entries(data.quadrantStatuses) as [keyof typeof quadrantLabels, Status][]).map(
          ([quadrant, status]) => (
            <div
              key={quadrant}
              className="flex items-center gap-2 bg-white/5 rounded-lg p-3"
            >
              <StatusIndicator status={status} size="sm" />
              <span className={`text-sm ${quadrantLabels[quadrant].color}`}>
                {quadrantLabels[quadrant].name}
              </span>
            </div>
          )
        )}
      </div>

      {/* Summary */}
      <div className="mb-6">
        <p className="text-dashboard-text-secondary leading-relaxed">{data.summary}</p>
      </div>

      {/* Values Check */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-status-thriving/10 rounded-lg p-4">
          <p className="text-sm font-medium text-status-thriving mb-2">Living Well</p>
          <div className="flex flex-wrap gap-2">
            {data.valuesAlignment.livingWell.map((value) => (
              <span
                key={value}
                className="text-xs px-2 py-1 bg-status-thriving/20 text-status-thriving rounded-full"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-status-attention/10 rounded-lg p-4">
          <p className="text-sm font-medium text-status-attention mb-2">Needs Attention</p>
          <div className="flex flex-wrap gap-2">
            {data.valuesAlignment.needsAttention.map((value) => (
              <span
                key={value}
                className="text-xs px-2 py-1 bg-status-attention/20 text-status-attention rounded-full"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Celebration */}
      {data.celebration && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-r from-quadrant-travel/20 to-quadrant-parkour/20 rounded-lg p-4 mb-6 border border-quadrant-travel/30"
        >
          <p className="text-sm font-medium text-quadrant-travel mb-1">Major Win</p>
          <p className="text-white">{data.celebration}</p>
        </motion.div>
      )}

      {/* Actionables */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4">Suggested Actions</h3>
        <div className="space-y-3">
          {data.actionables.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 bg-white/5 rounded-lg p-4"
            >
              <span className={`text-sm font-bold ${priorityColors[action.priority]}`}>
                {index + 1}.
              </span>
              <div className="flex-1">
                <p className="text-white">{action.suggestion}</p>
                <div className="flex gap-4 mt-2 text-xs text-dashboard-text-muted">
                  <span>Effort: {action.effort}</span>
                  <span>Impact: {action.impact}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Friendly Note */}
      <div className="bg-white/5 rounded-lg p-4 text-center">
        <p className="text-dashboard-text-secondary italic">{data.friendlyNote}</p>
      </div>
    </motion.div>
  )
}
