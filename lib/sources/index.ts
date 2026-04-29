import type { FetchResult, SourceName } from './types'
import { fetchHackerNews } from './hacker-news'
import {
  fetchRedditLocalLlama,
  fetchRedditMachineLearning,
} from './reddit'
import { fetchDevTo } from './dev-to'
import { fetchGitHubTrending } from './github-trending'

export const SOURCES: { name: SourceName; fetcher: () => Promise<FetchResult> }[] = [
  { name: 'hackernews', fetcher: fetchHackerNews },
  { name: 'reddit-localllama', fetcher: fetchRedditLocalLlama },
  { name: 'reddit-machinelearning', fetcher: fetchRedditMachineLearning },
  { name: 'devto', fetcher: fetchDevTo },
  { name: 'github-trending', fetcher: fetchGitHubTrending },
]

export const SOURCE_LABELS: Record<SourceName, string> = {
  hackernews: 'Hacker News',
  'reddit-localllama': 'r/LocalLLaMA',
  'reddit-machinelearning': 'r/MachineLearning',
  devto: 'Dev.to',
  'github-trending': 'GitHub Trending',
}

export async function fetchAllSources(): Promise<FetchResult[]> {
  const results = await Promise.allSettled(
    SOURCES.map((s) => s.fetcher())
  )
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
