'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QuickLinks from '@/components/dashboard/QuickLinks'
import type { Goal, Goals, QuadrantCategory } from '@/types/dashboard'

const categoryColors: Record<QuadrantCategory, { bg: string; text: string; border: string }> = {
  relationships: { bg: 'bg-quadrant-relationships/20', text: 'text-quadrant-relationships', border: 'border-quadrant-relationships' },
  parkour: { bg: 'bg-quadrant-parkour/20', text: 'text-quadrant-parkour', border: 'border-quadrant-parkour' },
  work: { bg: 'bg-quadrant-work/20', text: 'text-quadrant-work', border: 'border-quadrant-work' },
  travel: { bg: 'bg-quadrant-travel/20', text: 'text-quadrant-travel', border: 'border-quadrant-travel' },
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goals | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGoals() {
      try {
        const res = await fetch('/api/data/goals')
        if (res.ok) {
          const data = await res.json()
          setGoals(data)
        }
      } catch (error) {
        console.error('Failed to fetch goals:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGoals()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-GB', {
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <QuickLinks />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Goals</h1>
          <p className="text-dashboard-text-secondary">
            Where you&apos;re headed - near and far
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-quadrant-parkour"></div>
          </div>
        ) : goals ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Near Future */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-quadrant-parkour to-quadrant-work flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Near Future</h2>
                  <p className="text-sm text-dashboard-text-muted">Next 3 months</p>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {goals.nearFuture.map((goal, index) => (
                    <GoalCard key={goal.id} goal={goal} index={index} formatDate={formatDate} />
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* Far Future */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-quadrant-travel to-quadrant-relationships flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Far Future</h2>
                  <p className="text-sm text-dashboard-text-muted">1-2 years out</p>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {goals.farFuture.map((goal, index) => (
                    <FarGoalCard key={goal.id} goal={goal} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-dashboard-text-muted">No goals found</p>
          </div>
        )}

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-quadrant-parkour/10 to-quadrant-travel/10 rounded-xl p-8 text-center border border-white/5"
        >
          <p className="text-xl text-white italic mb-2">
            &ldquo;The future belongs to those who believe in the beauty of their dreams.&rdquo;
          </p>
          <p className="text-dashboard-text-muted">- Eleanor Roosevelt</p>
        </motion.div>
      </main>
    </div>
  )
}

function GoalCard({
  goal,
  index,
  formatDate,
}: {
  goal: Goal
  index: number
  formatDate: (date: string) => string
}) {
  const colors = goal.category ? categoryColors[goal.category] : null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-dashboard-card rounded-xl p-5 ${colors ? `border-l-4 ${colors.border}` : 'border-l-4 border-gray-600'}`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
            goal.completed
              ? 'bg-status-thriving border-status-thriving'
              : 'border-gray-500'
          }`}
        >
          {goal.completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-white ${goal.completed ? 'line-through opacity-50' : ''}`}>
            {goal.text}
          </p>

          {/* Progress bar */}
          {goal.progress !== undefined && !goal.completed && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-dashboard-text-muted">Progress</span>
                <span className={colors?.text || 'text-gray-400'}>{goal.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-full rounded-full ${colors?.bg.replace('/20', '') || 'bg-gray-500'}`}
                  style={{ backgroundColor: colors ? undefined : '#6b7280' }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-3">
            {colors && (
              <span className={`text-xs px-2 py-1 rounded ${colors.bg} ${colors.text} capitalize`}>
                {goal.category}
              </span>
            )}
            <span className="text-xs text-dashboard-text-muted">
              Added {formatDate(goal.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function FarGoalCard({ goal, index }: { goal: Goal; index: number }) {
  const colors = goal.category ? categoryColors[goal.category] : null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.1 }}
      className="relative bg-dashboard-card rounded-xl p-5 overflow-hidden group"
    >
      {/* Decorative gradient background */}
      <div
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
        style={{
          background: colors
            ? `linear-gradient(135deg, ${colors.text.replace('text-', 'var(--')}--tw-text-opacity)) 0%, transparent 100%)`
            : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
        }}
      />

      <div className="relative">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full ${colors?.bg || 'bg-gray-700'} flex items-center justify-center flex-shrink-0`}>
            <svg className={`w-4 h-4 ${colors?.text || 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>

          <div className="flex-1">
            <p className="text-white text-lg">{goal.text}</p>
            {colors && (
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${colors.bg} ${colors.text} capitalize`}>
                {goal.category}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
