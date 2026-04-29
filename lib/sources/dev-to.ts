import type { FetchResult, Post } from './types'

const SOURCE = 'devto' as const

interface DevToArticle {
  id: number
  title: string
  description: string
  url: string
  published_at: string
  positive_reactions_count: number
  comments_count: number
  tag_list: string[]
  user: { username: string; name: string }
}

export async function fetchDevTo(): Promise<FetchResult> {
  const start = Date.now()
  try {
    const url =
      'https://dev.to/api/articles?tag=ai&top=1&per_page=30'
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      headers: {
        'user-agent':
          'trend-radar/0.1 (+https://github.com/Celina-create/trend-radar)',
        accept: 'application/vnd.forem.api-v1+json',
      },
    })
    if (!res.ok) throw new Error(`Dev.to HTTP ${res.status}`)
    const data = (await res.json()) as DevToArticle[]
    const posts: Post[] = data.map((a) => ({
      id: `devto-${a.id}`,
      source: SOURCE,
      title: a.title,
      url: a.url,
      author: a.user.username,
      authorUrl: `https://dev.to/${a.user.username}`,
      publishedAt: a.published_at,
      score: a.positive_reactions_count,
      comments: a.comments_count,
      excerpt: a.description?.slice(0, 240),
      tags: a.tag_list,
    }))
    return {
      source: SOURCE,
      posts,
      fetchedAt: new Date().toISOString(),
      ok: true,
      durationMs: Date.now() - start,
    }
  } catch (err) {
    return {
      source: SOURCE,
      posts: [],
      fetchedAt: new Date().toISOString(),
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    }
  }
}
