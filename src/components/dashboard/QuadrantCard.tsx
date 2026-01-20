'use client'

import { motion } from 'framer-motion'
import StatusIndicator from './StatusIndicator'

type QuadrantType = 'relationships' | 'parkour' | 'work' | 'travel'
type Status = 'thriving' | 'needs_attention' | 'neglected'

interface TimelineEntry {
  id: string
  date: string
  title: string
  content: string
  imageUrl?: string
  significance: 'minor' | 'notable' | 'major'
}

interface Person {
  name: string
  mentionCount: number
}

interface QuadrantCardProps {
  type: QuadrantType
  name: string
  status: Status
  lastActivity: string
  recentEntries: TimelineEntry[]
  people?: Person[]
  metrics?: Record<string, string | number>
}

const quadrantColors = {
  relationships: {
    border: 'border-quadrant-relationships',
    text: 'text-quadrant-relationships',
    bg: 'bg-quadrant-relationships/10',
    glow: 'shadow-quadrant-relationships/20',
  },
  parkour: {
    border: 'border-quadrant-parkour',
    text: 'text-quadrant-parkour',
    bg: 'bg-quadrant-parkour/10',
    glow: 'shadow-quadrant-parkour/20',
  },
  work: {
    border: 'border-quadrant-work',
    text: 'text-quadrant-work',
    bg: 'bg-quadrant-work/10',
    glow: 'shadow-quadrant-work/20',
  },
  travel: {
    border: 'border-quadrant-travel',
    text: 'text-quadrant-travel',
    bg: 'bg-quadrant-travel/10',
    glow: 'shadow-quadrant-travel/20',
  },
}

const quadrantIcons = {
  relationships: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  parkour: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  work: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  travel: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function QuadrantCard({
  type,
  name,
  status,
  lastActivity,
  recentEntries,
  people,
  metrics,
}: QuadrantCardProps) {
  const colors = quadrantColors[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-dashboard-card rounded-xl p-6 border-l-4 ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
            {quadrantIcons[type]}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${colors.text}`}>{name}</h3>
            <p className="text-xs text-dashboard-text-muted">
              Last activity: {lastActivity}
            </p>
          </div>
        </div>
        <StatusIndicator status={status} size="md" />
      </div>

      {/* Content - Scattered Polaroid Style */}
      <div className="relative min-h-[150px] mb-4">
        {recentEntries.length > 0 ? (
          <div className="space-y-2">
            {recentEntries.slice(0, 3).map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, rotate: (index - 1) * 2 }}
                animate={{ opacity: 1 }}
                style={{ '--index': index } as React.CSSProperties}
                className="scattered-item bg-white/5 p-3 rounded-lg border border-white/10"
              >
                <p className="text-sm text-white font-medium truncate">{entry.title}</p>
                <p className="text-xs text-dashboard-text-muted truncate">{entry.content}</p>
                <p className="text-xs text-dashboard-text-muted mt-1">{entry.date}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-dashboard-text-muted">
            <p className="text-sm italic">No recent entries</p>
          </div>
        )}
      </div>

      {/* People Section (for relationships) */}
      {people && people.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-dashboard-text-muted mb-2">Key People</p>
          <div className="flex flex-wrap gap-2">
            {people.slice(0, 5).map((person) => (
              <span
                key={person.name}
                className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}
              >
                {person.name} ({person.mentionCount})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
          {Object.entries(metrics).slice(0, 4).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className={`text-lg font-bold ${colors.text}`}>{value}</p>
              <p className="text-xs text-dashboard-text-muted capitalize">{key.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
