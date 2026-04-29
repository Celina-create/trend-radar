import type { FetchResult, SourceName } from './types'
import { fetchHackerNews } from './hacker-news'
import { fetchLobsters } from './lobsters'
import { fetchHackerNoon } from './hackernoon'
import { fetchDevTo } from './dev-to'
import { fetchGitHubTrending } from './github-trending'

export const SOURCES: { name: SourceName; fetcher: () => Promise<FetchResult> }[] = [
  { name: 'hackernews', fetcher: fetchHackerNews },
  { name: 'lobsters', fetcher: fetchLobsters },
  { name: 'hackernoon', fetcher: fetchHackerNoon },
  { name: 'devto', fetcher: fetchDevTo },
  { name: 'github-trending', fetcher: fetchGitHubTrending },
]

export const SOURCE_LABELS: Record<SourceName, string> = {
  hackernews: 'Hacker News',
  lobsters: 'Lobsters',
  hackernoon: 'HackerNoon',
  devto: 'Dev.to',
  'github-trending': 'GitHub Trending',
}

export async function fetchAllSources(): Promise<FetchResult[]> {
  const results = await Promise.allSettled(SOURCES.map((s) => s.fetcher()))
  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return {
      source: SOURCES[i].name,
      posts: [],
      fetchedAt: new Date().toISOString(),
      ok: false,
      error: r.reason instanceof Error ? r.reason.message : String(r.reason),
      durationMs: 0,
    }
  })
}

export type { SourceName, FetchResult } from './types'
