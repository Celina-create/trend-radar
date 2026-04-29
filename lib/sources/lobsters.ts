import type { FetchResult, Post } from './types'

const SOURCE = 'lobsters' as const

interface LobstersStory {
  short_id: string
  short_id_url: string
  created_at: string
  title: string
  url: string
  score: number
  comment_count: number
  comments_url: string
  submitter_user: string
  tags: string[]
}

const AI_TAGS = new Set([
  'ai',
  'ml',
  'llms',
  'compsci',
  'programming',
  'devops',
])

export async function fetchLobsters(): Promise<FetchResult> {
  const start = Date.now()
  try {
    const res = await fetch('https://lobste.rs/hottest.json', {
      next: { revalidate: 1800 },
      headers: {
        'user-agent':
          'trend-radar/0.1 (+https://github.com/Celina-create/trend-radar)',
        accept: 'application/json',
      },
    })
    if (!res.ok) throw new Error(`Lobsters HTTP ${res.status}`)
    const stories = (await res.json()) as LobstersStory[]
    const posts: Post[] = stories
      .filter((s) => s.tags.some((t) => AI_TAGS.has(t)))
      .slice(0, 25)
      .map((s) => ({
        id: `lobsters-${s.short_id}`,
        source: SOURCE,
        title: s.title,
        url: s.url || s.short_id_url,
        author: s.submitter_user,
        authorUrl: `https://lobste.rs/u/${s.submitter_user}`,
        publishedAt: s.created_at,
        score: s.score,
        comments: s.comment_count,
        tags: s.tags,
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
