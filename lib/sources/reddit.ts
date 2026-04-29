import type { FetchResult, Post, SourceName } from './types'

interface RedditChild {
  data: {
    id: string
    title: string
    url: string
    permalink: string
    author: string
    score: number
    num_comments: number
    created_utc: number
    subreddit: string
    selftext?: string
    stickied?: boolean
  }
}

interface RedditListing {
  data: { children: RedditChild[] }
}

async function fetchSubreddit(
  subreddit: string,
  source: SourceName
): Promise<FetchResult> {
  const start = Date.now()
  const url = `https://www.reddit.com/r/${subreddit}/top.json?t=day&limit=25`
  try {
    const res = await fetch(url, {
      next: { revalidate: 600 },
      headers: {
        'user-agent':
          'trend-radar/0.1 (+https://github.com/Celina-create/trend-radar)',
      },
    })
    if (!res.ok) throw new Error(`Reddit HTTP ${res.status}`)
    const data = (await res.json()) as RedditListing
    const posts: Post[] = data.data.children
      .map((c) => c.data)
      .filter((p) => !p.stickied)
      .map((p) => ({
        id: `reddit-${p.id}`,
        source,
        title: p.title,
        url: p.url.startsWith('/r/') ? `https://reddit.com${p.url}` : p.url,
        author: p.author,
        authorUrl: `https://reddit.com/u/${p.author}`,
        publishedAt: new Date(p.created_utc * 1000).toISOString(),
        score: p.score,
        comments: p.num_comments,
        excerpt: p.selftext?.slice(0, 240),
        tags: [`r/${p.subreddit}`],
      }))
    return {
      source,
      posts,
      fetchedAt: new Date().toISOString(),
      ok: true,
      durationMs: Date.now() - start,
    }
  } catch (err) {
    return {
      source,
      posts: [],
      fetchedAt: new Date().toISOString(),
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    }
  }
}

export async function fetchRedditLocalLlama(): Promise<FetchResult> {
  return fetchSubreddit('LocalLLaMA', 'reddit-localllama')
}

export async function fetchRedditMachineLearning(): Promise<FetchResult> {
  return fetchSubreddit('MachineLearning', 'reddit-machinelearning')
}
