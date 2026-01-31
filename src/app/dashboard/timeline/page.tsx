'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QuickLinks from '@/components/dashboard/QuickLinks'
import type { TimelineEntry, QuadrantCategory } from '@/types/dashboard'

const categoryColors: Record<QuadrantCategory, { bg: string; text: string; border: string }> = {
  relationships: { bg: 'bg-quadrant-relationships/20', text: 'text-quadrant-relationships', border: 'border-quadrant-relationships' },
  parkour: { bg: 'bg-quadrant-parkour/20', text: 'text-quadrant-parkour', border: 'border-quadrant-parkour' },
  work: { bg: 'bg-quadrant-work/20', text: 'text-quadrant-work', border: 'border-quadrant-work' },
  travel: { bg: 'bg-quadrant-travel/20', text: 'text-quadrant-travel', border: 'border-quadrant-travel' },
}

const categoryIcons: Record<QuadrantCategory, JSX.Element> = {
  relationships: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  parkour: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  work: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  travel: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<QuadrantCategory | 'all'>('all')
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const fetchTimeline = async () => {
    try {
      const res = await fetch('/api/data/timeline')
      if (res.ok) {
        const data = await res.json()
        setTimeline(data)
      }
    } catch (error) {
      console.error('Failed to fetch timeline:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTimeline()
  }, [])

  const addEntry = async (entry: { title: string; content: string; category: QuadrantCategory; date: string; significance: string }) => {
    try {
      const res = await fetch('/api/data/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (res.ok) {
        await fetchTimeline()
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to add entry:', error)
    }
  }

  const filteredTimeline = filter === 'all'
    ? timeline
    : timeline.filter((entry) => entry.category === filter)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <QuickLinks />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Timeline</h1>
            <p className="text-dashboard-text-secondary">
              A visual story of your journey
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-quadrant-parkour to-quadrant-work text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Moment</span>
          </button>
        </div>

        <AnimatePresence>
          {showAddForm && (
            <AddTimelineForm onAdd={addEntry} onCancel={() => setShowAddForm(false)} />
          )}
        </AnimatePresence>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              filter === 'all'
                ? 'bg-white text-dashboard-bg'
                : 'bg-dashboard-card text-dashboard-text-secondary hover:text-white'
            }`}
          >
            All
          </button>
          {(Object.keys(categoryColors) as QuadrantCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2 ${
                filter === category
                  ? `${categoryColors[category].bg} ${categoryColors[category].text} border ${categoryColors[category].border}`
                  : 'bg-dashboard-card text-dashboard-text-secondary hover:text-white'
              }`}
            >
              {categoryIcons[category]}
              <span className="capitalize">{category}</span>
            </button>
          ))}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-quadrant-parkour"></div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-quadrant-relationships via-quadrant-parkour via-quadrant-work to-quadrant-travel" />

            <AnimatePresence>
              <div className="space-y-6">
                {filteredTimeline.map((entry, index) => {
                  const colors = categoryColors[entry.category]
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-16"
                    >
                      <div
                        className={`absolute left-4 w-5 h-5 rounded-full border-4 border-dashboard-bg ${colors.bg.replace('/20', '')} flex items-center justify-center`}
                      >
                        <div className={`w-2 h-2 rounded-full ${colors.bg.replace('/20', '')}`} />
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedEntry(entry)}
                        className={`bg-dashboard-card rounded-xl p-5 border-l-4 ${colors.border} cursor-pointer hover:bg-dashboard-card/80 transition-colors`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={colors.text}>{categoryIcons[entry.category]}</span>
                            <span className="text-xs text-dashboard-text-muted capitalize">
                              {entry.category}
                            </span>
                          </div>
                          <span className="text-xs text-dashboard-text-muted">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{entry.title}</h3>
                        <p className="text-dashboard-text-secondary text-sm line-clamp-2">
                          {entry.content}
                        </p>
                        {entry.significance === 'major' && (
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${colors.bg} ${colors.text}`}>
                            Major Moment
                          </span>
                        )}
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>
            </AnimatePresence>

            {filteredTimeline.length === 0 && (
              <div className="text-center py-12">
                <p className="text-dashboard-text-muted">No entries found</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-dashboard-card rounded-xl p-6 max-w-lg w-full border-l-4 ${categoryColors[selectedEntry.category].border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={categoryColors[selectedEntry.category].text}>
                    {categoryIcons[selectedEntry.category]}
                  </span>
                  <span className="text-sm text-dashboard-text-muted capitalize">
                    {selectedEntry.category}
                  </span>
                </div>
                <span className="text-sm text-dashboard-text-muted">
                  {formatDate(selectedEntry.date)}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{selectedEntry.title}</h2>
              <p className="text-dashboard-text-secondary leading-relaxed mb-4">
                {selectedEntry.content}
              </p>
              {selectedEntry.imageUrl && (
                <img
                  src={selectedEntry.imageUrl}
                  alt={selectedEntry.title}
                  className="rounded-lg w-full mb-4"
                />
              )}
              {selectedEntry.sourceNote && (
                <p className="text-xs text-dashboard-text-muted">
                  Source: {selectedEntry.sourceNote}
                </p>
              )}
              <button
                onClick={() => setSelectedEntry(null)}
                className="mt-4 w-full py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AddTimelineForm({
  onAdd,
  onCancel,
}: {
  onAdd: (entry: { title: string; content: string; category: QuadrantCategory; date: string; significance: string }) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<QuadrantCategory>('work')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [significance, setSignificance] = useState('notable')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    await onAdd({ title: title.trim(), content: content.trim(), category, date, significance })
    setSubmitting(false)
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="bg-dashboard-card rounded-xl p-5 mb-8 space-y-4 border border-white/5"
    >
      <h3 className="text-lg font-bold text-white">Add a Moment</h3>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What happened?"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-dashboard-text-muted focus:outline-none focus:border-quadrant-parkour transition-colors text-sm"
        autoFocus
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tell the story..."
        rows={3}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-dashboard-text-muted focus:outline-none focus:border-quadrant-parkour transition-colors text-sm resize-none"
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-dashboard-text-muted mb-1">Category</label>
          <div className="flex flex-wrap gap-1.5">
            {(['relationships', 'parkour', 'work', 'travel'] as QuadrantCategory[]).map((cat) => (
              <button key={cat} type="button" onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors capitalize ${
                  category === cat ? `${categoryColors[cat].bg} ${categoryColors[cat].text}` : 'bg-white/5 text-dashboard-text-secondary hover:bg-white/10'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-dashboard-text-muted mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-quadrant-parkour transition-colors" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-dashboard-text-muted mb-1">Significance</label>
        <div className="flex gap-2">
          {['minor', 'notable', 'major'].map((sig) => (
            <button key={sig} type="button" onClick={() => setSignificance(sig)}
              className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${
                significance === sig ? 'bg-white/20 text-white' : 'bg-white/5 text-dashboard-text-secondary hover:bg-white/10'
              }`}>
              {sig}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 bg-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={!title.trim() || !content.trim() || submitting}
          className="flex-1 py-2 bg-gradient-to-r from-quadrant-parkour to-quadrant-work rounded-lg text-sm text-white font-medium disabled:opacity-50 transition-opacity">
          {submitting ? 'Adding...' : 'Add to Timeline'}
        </button>
      </div>
    </motion.form>
  )
}
