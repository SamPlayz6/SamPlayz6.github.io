'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const navLinks = [
  { href: '/dashboard', label: 'Overview', icon: 'home' },
  { href: '/dashboard/timeline', label: 'Timeline', icon: 'timeline' },
  { href: '/dashboard/inspiration', label: 'Inspiration', icon: 'spark' },
  { href: '/dashboard/goals', label: 'Goals', icon: 'target' },
  { href: '/dashboard/instagram', label: 'Import', icon: 'camera' },
]

const externalLinks = [
  { href: 'https://nordpass.com', label: 'NordPass', icon: 'lock' },
  { href: 'https://www.skyscanner.net', label: 'Skyscanner', icon: 'plane' },
  { href: 'https://github.com/SamPlayz6', label: 'GitHub', icon: 'github' },
  { href: 'https://instagram.com', label: 'Instagram', icon: 'camera' },
]

const icons: Record<string, JSX.Element> = {
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  timeline: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  spark: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  target: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  plane: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  github: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  camera: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
}

export default function QuickLinks() {
  const pathname = usePathname()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processMessage, setProcessMessage] = useState<string | null>(null)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const handleRefresh = async () => {
    setIsProcessing(true)
    setProcessMessage(null)

    try {
      const response = await fetch('/api/process', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        setProcessMessage('Data refreshed! Reloading...')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setProcessMessage(data.error || 'Failed to refresh data')
        setTimeout(() => setProcessMessage(null), 5000)
      }
    } catch (error) {
      setProcessMessage('Failed to connect to processing server')
      setTimeout(() => setProcessMessage(null), 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <nav className="bg-dashboard-card/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-quadrant-relationships via-quadrant-parkour to-quadrant-travel bg-clip-text text-transparent">
              Life Dashboard
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-dashboard-text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  {icons[link.icon]}
                  <span className="hidden sm:inline">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* External Links + Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isProcessing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isProcessing
                  ? 'bg-quadrant-parkour/20 text-quadrant-parkour cursor-wait'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="Refresh data from Obsidian & GitHub"
            >
              <svg
                className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">
                {isProcessing ? 'Processing...' : 'Refresh'}
              </span>
            </button>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-dashboard-text-muted hover:text-white transition-colors"
                title={link.label}
              >
                {icons[link.icon]}
              </a>
            ))}
            <div className="w-px h-6 bg-white/10 mx-2" />
            <button
              onClick={handleLogout}
              className="p-2 text-dashboard-text-muted hover:text-status-neglected transition-colors"
              title="Logout"
            >
              {icons.logout}
            </button>
          </div>
        </div>

        {/* Process Message Toast */}
        {processMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-lg text-sm ${
              processMessage.includes('refreshed')
                ? 'bg-status-thriving/20 text-status-thriving'
                : 'bg-status-neglected/20 text-status-neglected'
            }`}
          >
            {processMessage}
          </motion.div>
        )}
      </div>
    </nav>
  )
}
