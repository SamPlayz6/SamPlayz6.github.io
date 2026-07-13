'use client'

import { useState, useEffect } from 'react'
import TopBar from '@/components/portfolio/TopBar'
import IntroSection from '@/components/portfolio/IntroSection'
import FreelanceSection from '@/components/portfolio/FreelanceSection'
import ProjectsSection from '@/components/portfolio/ProjectsSection'
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
        <FreelanceSection />
        <ProjectsSection />
      </main>
      <Footer />
    </div>
  )
}
