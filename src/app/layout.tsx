import type { Metadata } from 'next'
import './globals.css'

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
