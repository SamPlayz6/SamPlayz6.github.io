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
  const [showAddForm, setShowAddForm] = useState<'near' | 'far' | null>(null)

  const fetchGoals = async () => {
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

  useEffect(() => {
    fetchGoals()
  }, [])

  const toggleGoal = async (goalId: string, completed: boolean) => {
    try {
      const res = await fetch('/api/data/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, completed: !completed }),
      })
      if (res.ok) {
        setGoals((prev) => {
          if (!prev) return prev
          const update = (list: Goal[]) =>
            list.map((g) =>
              g.id === goalId ? { ...g, completed: !completed } : g
            )
          return {
            ...prev,
            nearFuture: update(prev.nearFuture),
            farFuture: update(prev.farFuture),
          }
        })
      }
    } catch (error) {
      console.error('Failed to toggle goal:', error)
    }
  }

  const addGoal = async (text: string, category: QuadrantCategory | '', timeframe: 'near' | 'far') => {
    try {
      const res = await fetch('/api/data/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category: category || null, timeframe }),
      })
      if (res.ok) {
        await fetchGoals()
        setShowAddForm(null)
      }
    } catch (error) {
      console.error('Failed to add goal:', error)
    }
  }

  const deleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/data/goals?id=${goalId}`, { method: 'DELETE' })
      if (res.ok) {
        setGoals((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            nearFuture: prev.nearFuture.filter((g) => g.id !== goalId),
            farFuture: prev.farFuture.filter((g) => g.id !== goalId),
          }
        })
      }
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }

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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
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
                <button
                  onClick={() => setShowAddForm(showAddForm === 'near' ? null : 'near')}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  title="Add near-term goal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <AnimatePresence>
                {showAddForm === 'near' && (
                  <AddGoalForm timeframe="near" onAdd={addGoal} onCancel={() => setShowAddForm(null)} />
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <AnimatePresence>
                  {goals.nearFuture.map((goal, index) => (
                    <GoalCard key={goal.id} goal={goal} index={index} formatDate={formatDate} onToggle={toggleGoal} onDelete={deleteGoal} />
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* Far Future */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
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
                <button
                  onClick={() => setShowAddForm(showAddForm === 'far' ? null : 'far')}
                  className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                  title="Add far-term goal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <AnimatePresence>
                {showAddForm === 'far' && (
                  <AddGoalForm timeframe="far" onAdd={addGoal} onCancel={() => setShowAddForm(null)} />
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <AnimatePresence>
                  {goals.farFuture.map((goal, index) => (
                    <FarGoalCard key={goal.id} goal={goal} index={index} onToggle={toggleGoal} onDelete={deleteGoal} />
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

function AddGoalForm({
  timeframe,
  onAdd,
  onCancel,
}: {
  timeframe: 'near' | 'far'
  onAdd: (text: string, category: QuadrantCategory | '', timeframe: 'near' | 'far') => Promise<void>
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [category, setCategory] = useState<QuadrantCategory | ''>('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    await onAdd(text.trim(), category, timeframe)
    setSubmitting(false)
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="bg-dashboard-card rounded-xl p-4 mb-4 space-y-3"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What do you want to achieve?"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-dashboard-text-muted focus:outline-none focus:border-quadrant-parkour transition-colors text-sm"
        autoFocus
      />
      <div className="flex flex-wrap gap-2">
        {(['relationships', 'parkour', 'work', 'travel'] as QuadrantCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(category === cat ? '' : cat)}
            className={`px-3 py-1 rounded-full text-xs transition-colors capitalize ${
              category === cat
                ? `${categoryColors[cat].bg} ${categoryColors[cat].text}`
                : 'bg-white/5 text-dashboard-text-secondary hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 bg-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={!text.trim() || submitting} className="flex-1 py-2 bg-gradient-to-r from-quadrant-parkour to-quadrant-work rounded-lg text-sm text-white font-medium disabled:opacity-50 transition-opacity">
          {submitting ? 'Adding...' : 'Add Goal'}
        </button>
      </div>
    </motion.form>
  )
}

function GoalCard({ goal, index, formatDate, onToggle, onDelete }: {
  goal: Goal; index: number; formatDate: (date: string) => string
  onToggle: (id: string, completed: boolean) => void; onDelete: (id: string) => void
}) {
  const colors = goal.category ? categoryColors[goal.category] : null
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.1 }}
      className={`bg-dashboard-card rounded-xl p-5 ${colors ? `border-l-4 ${colors.border}` : 'border-l-4 border-gray-600'} group`}>
      <div className="flex items-start gap-4">
        <button onClick={() => onToggle(goal.id, goal.completed)}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${goal.completed ? 'bg-status-thriving border-status-thriving' : 'border-gray-500 hover:border-quadrant-parkour'}`}>
          {goal.completed && (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-white ${goal.completed ? 'line-through opacity-50' : ''}`}>{goal.text}</p>
          {goal.progress !== undefined && goal.progress !== null && !goal.completed && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-dashboard-text-muted">Progress</span>
                <span className={colors?.text || 'text-gray-400'}>{goal.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`h-full rounded-full ${colors?.bg.replace('/20', '') || 'bg-gray-500'}`} style={{ backgroundColor: colors ? undefined : '#6b7280' }} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 mt-3">
            {colors && <span className={`text-xs px-2 py-1 rounded ${colors.bg} ${colors.text} capitalize`}>{goal.category}</span>}
            <span className="text-xs text-dashboard-text-muted">Added {formatDate(goal.createdAt)}</span>
            <button onClick={() => onDelete(goal.id)} className="ml-auto text-dashboard-text-muted hover:text-status-neglected transition-colors opacity-0 group-hover:opacity-100" title="Delete goal">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function FarGoalCard({ goal, index, onToggle, onDelete }: {
  goal: Goal; index: number; onToggle: (id: string, completed: boolean) => void; onDelete: (id: string) => void
}) {
  const colors = goal.category ? categoryColors[goal.category] : null
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.1 }}
      className="relative bg-dashboard-card rounded-xl p-5 overflow-hidden group">
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-white/20 to-transparent" />
      <div className="relative">
        <div className="flex items-start gap-3">
          <button onClick={() => onToggle(goal.id, goal.completed)}
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${goal.completed ? 'bg-status-thriving' : colors?.bg || 'bg-gray-700'}`}>
            {goal.completed ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className={`w-4 h-4 ${colors?.text || 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
          </button>
          <div className="flex-1">
            <p className={`text-white text-lg ${goal.completed ? 'line-through opacity-50' : ''}`}>{goal.text}</p>
            <div className="flex items-center gap-2 mt-2">
              {colors && <span className={`inline-block text-xs px-2 py-1 rounded ${colors.bg} ${colors.text} capitalize`}>{goal.category}</span>}
              <button onClick={() => onDelete(goal.id)} className="ml-auto text-dashboard-text-muted hover:text-status-neglected transition-colors opacity-0 group-hover:opacity-100" title="Delete goal">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
