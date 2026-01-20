'use client'

import { useState, useEffect } from 'react'
import TopBar from '@/components/portfolio/TopBar'
import IntroSection from '@/components/portfolio/IntroSection'
import ProjectsSection from '@/components/portfolio/ProjectsSection'
import BlogSection from '@/components/portfolio/BlogSection'
import Footer from '@/components/portfolio/Footer'

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved preference or system preference
    const savedMode = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedMode === 'true' || (!savedMode && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
    localStorage.setItem('darkMode', (!isDarkMode).toString())
  }

  return (
    <div className="min-h-screen bg-portfolio-bg-light dark:bg-portfolio-bg-dark transition-colors duration-300">
      <TopBar isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      <main>
        <IntroSection />
        <ProjectsSection />
        <BlogSection />
      </main>
      <Footer />
    </div>
  )
}
