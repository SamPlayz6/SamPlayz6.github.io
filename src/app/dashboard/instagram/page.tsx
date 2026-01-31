'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import QuickLinks from '@/components/dashboard/QuickLinks'

export default function InstagramImportPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [stats, setStats] = useState<{ parsed: number; new: number; duplicates: number } | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setStatus('error')
      setMessage('Please upload a JSON file from your Instagram export.')
      return
    }

    setStatus('uploading')
    setMessage('Processing...')
    setStats(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const response = await fetch('/api/instagram/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setStatus('success')
        setStats(result.stats)
        setMessage(
          `Imported ${result.stats.new} new items (${result.stats.duplicates} duplicates skipped).`
        )
      } else {
        setStatus('error')
        setMessage(result.error || 'Import failed.')
      }
    } catch {
      setStatus('error')
      setMessage('Failed to parse JSON file. Make sure it is a valid Instagram export.')
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <QuickLinks />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Instagram Import</h1>
          <p className="text-dashboard-text-secondary mb-8">
            Upload your Instagram data export to import saved and liked posts as inspiration items.
          </p>

          {/* Instructions */}
          <div className="bg-dashboard-card rounded-xl p-6 mb-6 border border-white/5">
            <h2 className="text-lg font-semibold text-white mb-3">How to export your data</h2>
            <ol className="text-sm text-dashboard-text-secondary space-y-2 list-decimal list-inside">
              <li>
                Go to Instagram Settings &gt; Your Activity &gt; Download Your Information
              </li>
              <li>Select JSON format</li>
              <li>Download and extract the ZIP file</li>
              <li>
                Upload the relevant JSON file (e.g.,{' '}
                <code className="text-quadrant-parkour">saved_saved_media.json</code> or{' '}
                <code className="text-quadrant-parkour">liked_posts.json</code>)
              </li>
            </ol>
          </div>

          {/* Upload Area */}
          <div className="bg-dashboard-card rounded-xl p-8 border border-white/5 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="instagram-upload"
            />
            <label
              htmlFor="instagram-upload"
              className={`cursor-pointer inline-flex flex-col items-center gap-3 ${
                status === 'uploading' ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-dashboard-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <span className="text-white font-medium">
                {status === 'uploading' ? 'Processing...' : 'Click to upload JSON file'}
              </span>
              <span className="text-sm text-dashboard-text-muted">
                Accepts .json files from Instagram export
              </span>
            </label>
          </div>

          {/* Status Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg text-sm ${
                status === 'success'
                  ? 'bg-status-thriving/20 text-status-thriving'
                  : status === 'error'
                    ? 'bg-status-neglected/20 text-status-neglected'
                    : 'bg-white/10 text-white'
              }`}
            >
              <p>{message}</p>
              {stats && (
                <div className="mt-2 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold">{stats.parsed}</p>
                    <p className="text-xs opacity-70">Parsed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats.new}</p>
                    <p className="text-xs opacity-70">New</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stats.duplicates}</p>
                    <p className="text-xs opacity-70">Duplicates</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
