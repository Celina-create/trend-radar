export type SourceName =
  | 'hackernews'
  | 'lobsters'
  | 'hackernoon'
  | 'devto'
  | 'github-trending'

export interface Post {
  id: string
  source: SourceName
  title: string
  url: string
  author?: string
  authorUrl?: string
  publishedAt: string
  score?: number
  comments?: number
  excerpt?: string
  tags?: string[]
}

export interface FetchResult {
  source: SourceName
  posts: Post[]
  fetchedAt: string
  ok: boolean
  error?: string
  durationMs: number
}

export interface Trend {
  id: string
  topic: string
  summary: string
  whyItMatters: string
  postCount: number
  sources: SourceName[]
  posts: Post[]
  topPostUrl: string
  generatedAt: string
}

export interface SourceHealth {
  source: SourceName
  ok: boolean
  postCount: number
  fetchedAt: string
  durationMs: number
  error?: string
}

export interface DailyDigest {
  date: string
  generatedAt: string
  trends: Trend[]
  sourceHealth: SourceHealth[]
  totalPosts: number
}
