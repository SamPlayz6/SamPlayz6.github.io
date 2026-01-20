'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QuickLinks from '@/components/dashboard/QuickLinks'
import type { InspirationItem, InspirationCategory, InspirationType } from '@/types/dashboard'

const categoryColors: Record<InspirationCategory, { bg: string; text: string }> = {
  movement: { bg: 'bg-quadrant-parkour/20', text: 'text-quadrant-parkour' },
  innovation: { bg: 'bg-quadrant-work/20', text: 'text-quadrant-work' },
  travel: { bg: 'bg-quadrant-travel/20', text: 'text-quadrant-travel' },
  philosophy: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  people: { bg: 'bg-quadrant-relationships/20', text: 'text-quadrant-relationships' },
}

const typeIcons: Record<InspirationType, JSX.Element> = {
  video: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  image: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  quote: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  article: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  profile: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
}

export default function InspirationPage() {
  const [items, setItems] = useState<InspirationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<InspirationCategory | 'all'>('all')
  const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null)

  useEffect(() => {
    async function fetchInspiration() {
      try {
        const res = await fetch('/api/data/inspiration')
        if (res.ok) {
          const data = await res.json()
          setItems(data)
        }
      } catch (error) {
        console.error('Failed to fetch inspiration:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInspiration()
  }, [])

  const filteredItems = filter === 'all'
    ? items
    : items.filter((item) => item.category === filter)

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    return match ? match[1] : null
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <QuickLinks />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Inspiration</h1>
          <p className="text-dashboard-text-secondary">
            Content and people that fuel your fire
          </p>
        </div>

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
          {(Object.keys(categoryColors) as InspirationCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 py-2 rounded-full text-sm transition-colors capitalize ${
                filter === category
                  ? `${categoryColors[category].bg} ${categoryColors[category].text}`
                  : 'bg-dashboard-card text-dashboard-text-secondary hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-quadrant-parkour"></div>
          </div>
        ) : (
          <div className="masonry-grid">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="masonry-item"
                >
                  <InspirationCard
                    item={item}
                    onClick={() => setSelectedItem(item)}
                    getYouTubeId={getYouTubeId}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-dashboard-text-muted">No inspiration found</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dashboard-card rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {selectedItem.type === 'video' && getYouTubeId(selectedItem.content) && (
                <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedItem.content)}`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}
              {selectedItem.type === 'image' && (
                <img
                  src={selectedItem.content}
                  alt={selectedItem.title}
                  className="w-full rounded-lg mb-4"
                />
              )}
              {selectedItem.type === 'quote' && (
                <div className={`${categoryColors[selectedItem.category].bg} rounded-lg p-6 mb-4`}>
                  <p className="text-xl text-white italic leading-relaxed">
                    &ldquo;{selectedItem.content}&rdquo;
                  </p>
                  {selectedItem.source && (
                    <p className={`mt-4 ${categoryColors[selectedItem.category].text}`}>
                      - {selectedItem.source}
                    </p>
                  )}
                </div>
              )}
              <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs ${categoryColors[selectedItem.category].bg} ${categoryColors[selectedItem.category].text} capitalize`}>
                  {selectedItem.category}
                </span>
                {selectedItem.source && selectedItem.type !== 'quote' && (
                  <span className="text-sm text-dashboard-text-muted">
                    via {selectedItem.source}
                  </span>
                )}
              </div>
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedItem.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-dashboard-text-muted">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {(selectedItem.type === 'profile' || selectedItem.type === 'article' || selectedItem.type === 'video') && (
                <a
                  href={selectedItem.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-gradient-to-r from-quadrant-parkour to-quadrant-work rounded-lg text-white text-center hover:opacity-90 transition-opacity"
                >
                  Open Link
                </a>
              )}
              <button
                onClick={() => setSelectedItem(null)}
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

function InspirationCard({
  item,
  onClick,
  getYouTubeId,
}: {
  item: InspirationItem
  onClick: () => void
  getYouTubeId: (url: string) => string | null
}) {
  const colors = categoryColors[item.category]

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-dashboard-card rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Image/Video thumbnail */}
      {item.type === 'image' && (
        <div className="relative">
          <img
            src={item.content}
            alt={item.title}
            className="w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-sm">View</span>
          </div>
        </div>
      )}
      {item.type === 'video' && getYouTubeId(item.content) && (
        <div className="relative aspect-video">
          <img
            src={`https://img.youtube.com/vi/${getYouTubeId(item.content)}/mqdefault.jpg`}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {typeIcons.video}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {item.type === 'quote' && (
          <p className="text-white text-sm italic mb-2 line-clamp-3">
            &ldquo;{item.content}&rdquo;
          </p>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className={colors.text}>{typeIcons[item.type]}</span>
          <span className={`text-xs ${colors.text} capitalize`}>{item.category}</span>
        </div>
        <h3 className="text-white font-medium text-sm line-clamp-2">{item.title}</h3>
        {item.personName && (
          <p className="text-dashboard-text-muted text-xs mt-1">{item.personName}</p>
        )}
        {item.source && item.type !== 'quote' && (
          <p className="text-dashboard-text-muted text-xs mt-1">via {item.source}</p>
        )}
      </div>
    </motion.div>
  )
}
