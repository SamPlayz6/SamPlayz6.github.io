'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { QuadrantCategory } from '@/types/dashboard'

interface ManualEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (entry: {
    content: string
    category: QuadrantCategory
    imageUrl?: string
    link?: string
  }) => void
}

const categories: { value: QuadrantCategory; label: string; color: string }[] = [
  { value: 'relationships', label: 'Relationships', color: 'bg-quadrant-relationships' },
  { value: 'parkour', label: 'Parkour', color: 'bg-quadrant-parkour' },
  { value: 'work', label: 'Work', color: 'bg-quadrant-work' },
  { value: 'travel', label: 'Travel', color: 'bg-quadrant-travel' },
]

export default function ManualEntryModal({ isOpen, onClose, onSubmit }: ManualEntryModalProps) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<QuadrantCategory>('relationships')
  const [imageUrl, setImageUrl] = useState('')
  const [link, setLink] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        content: content.trim(),
        category,
        imageUrl: imageUrl.trim() || undefined,
        link: link.trim() || undefined,
      })
      // Reset form
      setContent('')
      setCategory('relationships')
      setImageUrl('')
      setLink('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-dashboard-card rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Log a Moment</h2>
              <button
                onClick={onClose}
                className="text-dashboard-text-muted hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Content */}
              <div>
                <label className="block text-sm text-dashboard-text-secondary mb-2">
                  What happened?
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe the moment..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-dashboard-text-muted focus:outline-none focus:border-quadrant-parkour transition-colors resize-none"
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-dashboard-text-secondary mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        category === cat.value
                          ? `${cat.color} text-white`
                          : 'bg-white/5 text-dashboard-text-secondary hover:bg-white/10'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional: Image URL */}
              <div>
                <label className="block text-sm text-dashboard-text-secondary mb-2">
                  Image URL <span className="text-dashboard-text-muted">(optional)</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-dashboard-text-muted focus:outline-none focus:border-quadrant-parkour transition-colors"
                />
              </div>

              {/* Optional: Link */}
              <div>
                <label className="block text-sm text-dashboard-text-secondary mb-2">
                  Related Link <span className="text-dashboard-text-muted">(optional)</span>
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-dashboard-text-muted focus:outline-none focus:border-quadrant-parkour transition-colors"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-quadrant-parkour to-quadrant-work rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Floating Action Button component for triggering the modal
export function ManualEntryFAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-quadrant-parkour to-quadrant-work rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:shadow-xl transition-shadow"
      title="Log a moment"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </motion.button>
  )
}
