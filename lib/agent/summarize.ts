import { generateObject } from 'ai'
import { z } from 'zod'
import type { Post, Trend } from '../sources/types'
import type { Cluster } from './cluster'
import { provider, SUMMARY_MODEL, hasLLM } from '../ai'
import { SOURCE_LABELS } from '../sources'

const schema = z.object({
  topic: z
    .string()
    .min(3)
    .max(80)
    .describe('A concise 4-10 word topic name'),
  summary: z
    .string()
    .min(10)
    .max(280)
    .describe('1-2 sentence neutral summary of what is happening'),
  whyItMatters: z
    .string()
    .min(10)
    .max(280)
    .describe('1 sentence on why an AI growth operator should care'),
})

function fallbackTrend(cluster: Cluster, idx: number): Trend {
  const sortedPosts = [...cluster.posts].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  )
  const top = sortedPosts[0]
  const topic =
    cluster.topTokens.slice(0, 4).join(' · ') ||
    top.title.slice(0, 60)
  return {
    id: `trend-${idx}-${top.id}`,
    topic,
    summary: top.title,
    whyItMatters:
      'LLM unavailable — manual review recommended. Set AI_GATEWAY_API_KEY or OPENAI_API_KEY to enable AI summaries.',
    postCount: cluster.posts.length,
    sources: [...new Set(cluster.posts.map((p) => p.source))],
    posts: sortedPosts,
    topPostUrl: top.url,
    generatedAt: new Date().toISOString(),
  }
}

function buildPrompt(cluster: Cluster): string {
  const lines = cluster.posts.slice(0, 8).map((p) => {
    const source = SOURCE_LABELS[p.source]
    const stat = `${p.score ?? 0} pts · ${p.comments ?? 0} comments`
    return `- [${source}] ${p.title} (${stat})`
  })
  return [
    'You are an AI Growth analyst summarizing today\'s trending discussion in one cluster.',
    '',
    'Posts in this cluster:',
    ...lines,
    '',
    `Top tokens: ${cluster.topTokens.join(', ')}`,
    '',
    'Output:',
    '- topic: 4-10 words, no quotes, no period',
    '- summary: 1-2 neutral sentences describing what is being discussed',
    '- whyItMatters: 1 sentence on why a growth operator (AI agent/dev tools) should care',
    '',
    'Be specific. Avoid hype words like "revolutionary".',
  ].join('\n')
}

export async function summarizeCluster(
  cluster: Cluster,
  idx: number
): Promise<Trend> {
  if (!hasLLM || !provider) return fallbackTrend(cluster, idx)

  try {
    const { object } = await generateObject({
      model: provider(SUMMARY_MODEL),
      schema,
      prompt: buildPrompt(cluster),
    })

    const sortedPosts = [...cluster.posts].sort(
      (a, b) => (b.score ?? 0) - (a.score ?? 0)
    )

    return {
      id: `trend-${idx}-${sortedPosts[0].id}`,
      topic: object.topic,
      summary: object.summary,
      whyItMatters: object.whyItMatters,
      postCount: cluster.posts.length,
      sources: [...new Set(cluster.posts.map((p) => p.source))],
      posts: sortedPosts,
      topPostUrl: sortedPosts[0].url,
      generatedAt: new Date().toISOString(),
    }
  } catch (err) {
    console.error('summarize failed', err)
    return fallbackTrend(cluster, idx)
  }
}

export async function summarizeAll(clusters: Cluster[]): Promise<Trend[]> {
  const trends: Trend[] = []
  for (let i = 0; i < clusters.length; i++) {
    trends.push(await summarizeCluster(clusters[i], i))
  }
  return trends
}
