import type { FetchResult, Post } from './types'

const SOURCE = 'hackernews' as const

const SEARCH_URL =
  'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30'

interface HnHit {
  objectID: string
  title: string
  url: string | null
  story_id: number | null
  author: string
  points: number
  num_comments: number
  created_at: string
  _tags: string[]
}

export async function fetchHackerNews(): Promise<FetchResult> {
  const start = Date.now()
  try {
    const res = await fetch(SEARCH_URL, {
      next: { revalidate: 600 },
      headers: { 'user-agent': 'trend-radar/0.1 (+https://github.com/Celina-create/trend-radar)' },
    })
    if (!res.ok) throw new Error(`HN HTTP ${res.status}`)
    const data = (await res.json()) as { hits: HnHit[] }
    const posts: Post[] = data.hits
      .filter((h) => h.title && (h.url || h.story_id))
      .map((h) => ({
        id: `hn-${h.objectID}`,
        source: SOURCE,
        title: h.title,
        url: h.url ?? `https://news.ycombinator.com/item?id=${h.story_id}`,
        author: h.author,
        authorUrl: `https://news.ycombinator.com/user?id=${h.author}`,
        publishedAt: h.created_at,
        score: h.points,
        comments: h.num_comments,
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
