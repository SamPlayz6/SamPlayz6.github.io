'use client'

import { motion } from 'framer-motion'

interface BalanceIndicatorProps {
  score: number // 0-100
  mood?: string
  signals?: string[]
  recommendation?: string
}

export default function BalanceIndicator({ score, mood, signals, recommendation }: BalanceIndicatorProps) {
  // Determine color based on score
  const getColor = () => {
    if (score >= 70) return { ring: 'stroke-status-thriving', text: 'text-status-thriving', bg: 'bg-status-thriving/10' }
    if (score >= 50) return { ring: 'stroke-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10' }
    if (score >= 30) return { ring: 'stroke-status-attention', text: 'text-status-attention', bg: 'bg-status-attention/10' }
    return { ring: 'stroke-status-neglected', text: 'text-status-neglected', bg: 'bg-status-neglected/10' }
  }

  const colors = getColor()
  const circumference = 2 * Math.PI * 45 // radius = 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getMoodEmoji = () => {
    if (mood === 'energized' || mood === 'energized_but_stretched') return '⚡'
    if (mood === 'balanced') return '🌿'
    if (mood === 'stressed') return '😤'
    return '🎯'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${colors.bg} rounded-xl p-6 border border-white/10`}
    >
      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="transform -rotate-90 w-24 h-24">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="45"
              className="stroke-white/10"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="48"
              cy="48"
              r="45"
              className={colors.ring}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              style={{ strokeDasharray: circumference }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl">{getMoodEmoji()}</span>
            <span className={`text-lg font-bold ${colors.text}`}>{score}%</span>
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-1">Values Alignment</h3>
          {mood && (
            <p className={`text-xs ${colors.text} capitalize mb-2`}>
              {mood.replace(/_/g, ' ')}
            </p>
          )}
          {signals && signals.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {signals.slice(0, 3).map((signal, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-dashboard-text-muted"
                >
                  {signal}
                </span>
              ))}
            </div>
          )}
          {recommendation && (
            <p className="text-xs text-dashboard-text-muted italic line-clamp-2">
              {recommendation}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
