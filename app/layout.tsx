import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trend Radar — AI Growth Intelligence',
  description:
    'Daily aggregated AI / Agent / OSS trends from Hacker News, Reddit, Dev.to, GitHub Trending — built by Celina.',
  metadataBase: new URL('https://trend-radar.vercel.app'),
  openGraph: {
    title: 'Trend Radar — AI Growth Intelligence',
    description:
      'Daily aggregated AI / Agent / OSS trends, summarized for growth operators.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
