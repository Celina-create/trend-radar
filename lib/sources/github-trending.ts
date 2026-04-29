import type { FetchResult, Post } from './types'

const SOURCE = 'github-trending' as const

interface GitHubRepo {
  id: number
  full_name: string
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics?: string[]
  owner: { login: string; html_url: string }
  pushed_at: string
}

interface SearchResult {
  items: GitHubRepo[]
}

export async function fetchGitHubTrending(): Promise<FetchResult> {
  const start = Date.now()
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
    const q = encodeURIComponent(`created:>${since} stars:>50`)
    const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=30`

    const headers: HeadersInit = {
      'user-agent':
        'trend-radar/0.1 (+https://github.com/Celina-create/trend-radar)',
      accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    }
    if (process.env.GITHUB_TOKEN) {
      headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const res = await fetch(url, { next: { revalidate: 3600 }, headers })
    if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`)
    const data = (await res.json()) as SearchResult

    const posts: Post[] = data.items.map((r) => ({
      id: `gh-${r.id}`,
      source: SOURCE,
      title: r.full_name + (r.description ? ` — ${r.description}` : ''),
      url: r.html_url,
      author: r.owner.login,
      authorUrl: r.owner.html_url,
      publishedAt: r.pushed_at,
      score: r.stargazers_count,
      tags: [r.language, ...(r.topics ?? [])].filter(
        (t): t is string => Boolean(t)
      ),
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
