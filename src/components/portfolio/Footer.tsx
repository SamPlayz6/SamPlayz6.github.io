'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const router = useRouter()
  const clickCountRef = useRef(0)
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSecretClick = () => {
    clickCountRef.current += 1

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
    }

    if (clickCountRef.current === 3) {
      clickCountRef.current = 0
      router.push('/dashboard/login')
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0
      }, 500)
    }
  }

  return (
    <footer className="text-center p-4 bg-portfolio-nav-light dark:bg-portfolio-nav-dark transition-colors duration-300">
      <p className="text-portfolio-text-light dark:text-portfolio-text-dark">
        &copy;{' '}
        <span
          onClick={handleSecretClick}
          className="cursor-default select-none"
        >
          {currentYear}
        </span>{' '}
        Sam Dunning | Founder & CEO of{' '}
        <a
          href="https://maupka.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-portfolio-link-light dark:text-portfolio-link-dark hover:underline"
        >
          Maupka
        </a>
      </p>
    </footer>
  )
}
