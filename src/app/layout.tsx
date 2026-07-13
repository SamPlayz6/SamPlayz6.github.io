import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sam Dunning - AI & Full-Stack Developer',
  description: 'AI and full-stack developer, and First Class Data Science graduate, building AI products end to end.',
  icons: {
    icon: '/images/x-icon.png',
  },
  openGraph: {
    title: 'Sam Dunning - AI & Full-Stack Developer',
    description: 'AI and full-stack developer, and First Class Data Science graduate, building AI products end to end.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Handlee&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-kalam">{children}</body>
    </html>
  )
}
