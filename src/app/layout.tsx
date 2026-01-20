import type { Metadata } from 'next'
import { Kalam, Handlee } from 'next/font/google'
import './globals.css'

const kalam = Kalam({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-kalam',
})

const handlee = Handlee({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-handlee',
})

export const metadata: Metadata = {
  title: 'Sam Dunning - Data Scientist',
  description: 'Data Scientist & AI Enthusiast. Building tools that help people learn and create.',
  icons: {
    icon: '/images/x-icon.png',
  },
  openGraph: {
    title: 'Sam Dunning - Data Scientist',
    description: 'Data Scientist & AI Enthusiast. Building tools that help people learn and create.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${kalam.variable} ${handlee.variable}`}>
      <body className="font-kalam">{children}</body>
    </html>
  )
}
