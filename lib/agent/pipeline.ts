import { fetchAllSources } from '../sources'
import type { DailyDigest, SourceHealth } from '../sources/types'
import { clusterPosts } from './cluster'
import { summarizeAll } from './summarize'

const MAX_CLUSTERS = 8
const MIN_CLUSTER_SIZE = 1

export async function runPipeline(): Promise<DailyDigest> {
  const fetchResults = await fetchAllSources()

  const allPosts = fetchResults.flatMap((r) => r.posts)
  const clusters = clusterPosts(allPosts)
    .filter((c) => c.posts.length >= MIN_CLUSTER_SIZE)
    .slice(0, MAX_CLUSTERS)

  const trends = await summarizeAll(clusters)

  const sourceHealth: SourceHealth[] = fetchResults.map((r) => ({
    source: r.source,
    ok: r.ok,
    postCount: r.posts.length,
    fetchedAt: r.fetchedAt,
    durationMs: r.durationMs,
    error: r.error,
  }))

  return {
    date: new Date().toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    trends,
    sourceHealth,
    totalPosts: allPosts.length,
  }
}
