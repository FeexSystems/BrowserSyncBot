import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Browser Sync App',
  description: 'A modern browser sync application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
