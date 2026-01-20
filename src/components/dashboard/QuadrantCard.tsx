'use client'

import { motion } from 'framer-motion'
import StatusIndicator from './StatusIndicator'

type QuadrantType = 'relationships' | 'parkour' | 'work' | 'travel'
type Status = 'thriving' | 'balanced' | 'needs_attention' | 'dormant' | 'neglected'

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
  connectionQuality?: string
}

interface Skill {
  name: string
  status: string
}

interface QuadrantCardProps {
  type: QuadrantType
  name: string
  status: Status
  lastActivity: string
  activityPulse?: boolean
  recentEntries: TimelineEntry[]
  people?: Person[]
  skills?: Skill[]
  metrics?: Record<string, string | number>
  currentFocus?: {
    company?: string
    description?: string
    stage?: string
  }
  japanDream?: {
    status?: string
    quote?: string
  }
  trainingPhilosophy?: string
}

const quadrantColors = {
  relationships: {
    border: 'border-quadrant-relationships',
    text: 'text-quadrant-relationships',
    bg: 'bg-quadrant-relationships/10',
    glow: 'shadow-quadrant-relationships/20',
    pulse: 'bg-quadrant-relationships',
  },
  parkour: {
    border: 'border-quadrant-parkour',
    text: 'text-quadrant-parkour',
    bg: 'bg-quadrant-parkour/10',
    glow: 'shadow-quadrant-parkour/20',
    pulse: 'bg-quadrant-parkour',
  },
  work: {
    border: 'border-quadrant-work',
    text: 'text-quadrant-work',
    bg: 'bg-quadrant-work/10',
    glow: 'shadow-quadrant-work/20',
    pulse: 'bg-quadrant-work',
  },
  travel: {
    border: 'border-quadrant-travel',
    text: 'text-quadrant-travel',
    bg: 'bg-quadrant-travel/10',
    glow: 'shadow-quadrant-travel/20',
    pulse: 'bg-quadrant-travel',
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

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-IE', { month: 'short', day: 'numeric' })
}

export default function QuadrantCard({
  type,
  name,
  status,
  lastActivity,
  activityPulse,
  recentEntries,
  people,
  skills,
  metrics,
  currentFocus,
  japanDream,
  trainingPhilosophy,
}: QuadrantCardProps) {
  const colors = quadrantColors[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-dashboard-card rounded-xl p-6 border-l-4 ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
    >
      {/* Activity Pulse Animation */}
      {activityPulse && (
        <motion.div
          className={`absolute top-4 right-4 w-3 h-3 rounded-full ${colors.pulse}`}
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
            {quadrantIcons[type]}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${colors.text}`}>{name}</h3>
            <p className="text-xs text-dashboard-text-muted">
              {formatDate(lastActivity)}
            </p>
          </div>
        </div>
        <StatusIndicator status={status} size="md" />
      </div>

      {/* Current Focus (for Work) */}
      {currentFocus && (
        <div className={`mb-4 p-3 rounded-lg ${colors.bg} border border-white/10`}>
          <p className={`text-sm font-semibold ${colors.text}`}>{currentFocus.company}</p>
          <p className="text-xs text-dashboard-text-muted">{currentFocus.description}</p>
          {currentFocus.stage && (
            <p className="text-xs text-white/70 mt-1">{currentFocus.stage}</p>
          )}
        </div>
      )}

      {/* Japan Dream (for Travel) */}
      {japanDream && (
        <div className={`mb-4 p-3 rounded-lg ${colors.bg} border border-white/10`}>
          <p className="text-xs text-dashboard-text-muted uppercase tracking-wider mb-1">
            {japanDream.status?.replace(/_/g, ' ')}
          </p>
          {japanDream.quote && (
            <p className="text-sm text-white/80 italic">"{japanDream.quote}"</p>
          )}
        </div>
      )}

      {/* Training Philosophy (for Parkour) */}
      {trainingPhilosophy && (
        <div className={`mb-4 p-3 rounded-lg ${colors.bg} border border-white/10`}>
          <p className="text-xs text-dashboard-text-muted uppercase tracking-wider mb-1">Philosophy</p>
          <p className="text-sm text-white/80 italic">"{trainingPhilosophy}"</p>
        </div>
      )}

      {/* Content - Recent Entries */}
      <div className="relative min-h-[100px] mb-4">
        {recentEntries.length > 0 ? (
          <div className="space-y-2">
            {recentEntries.slice(0, 2).map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/5 p-3 rounded-lg border-l-2 ${
                  entry.significance === 'major'
                    ? colors.border
                    : entry.significance === 'notable'
                    ? 'border-white/30'
                    : 'border-white/10'
                }`}
              >
                <p className="text-sm text-white font-medium">{entry.title}</p>
                <p className="text-xs text-dashboard-text-muted line-clamp-2">{entry.content}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-dashboard-text-muted">
            <p className="text-sm italic">Waiting for your next move...</p>
          </div>
        )}
      </div>

      {/* People Section (for relationships) */}
      {people && people.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-dashboard-text-muted mb-2">Key People</p>
          <div className="flex flex-wrap gap-2">
            {people.slice(0, 4).map((person) => (
              <span
                key={person.name}
                className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} flex items-center gap-1`}
              >
                {person.connectionQuality === 'deep' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                )}
                {person.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section (for parkour) */}
      {skills && skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-dashboard-text-muted mb-2">Current Focus</p>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 4).map((skill) => (
              <span
                key={skill.name}
                className={`text-xs px-2 py-1 rounded-full ${
                  skill.status === 'hard_goal'
                    ? `${colors.bg} ${colors.text} border border-current`
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
          {Object.entries(metrics).slice(0, 3).map(([key, value]) => (
            <div key={key} className="text-center">
              <p className={`text-lg font-bold ${colors.text}`}>{value}</p>
              <p className="text-xs text-dashboard-text-muted capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
