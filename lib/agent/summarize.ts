import { generateObject } from 'ai'
import { z } from 'zod'
import type { Trend } from '../sources/types'
import type { Cluster } from './cluster'
import { provider, SUMMARY_MODEL, hasLLM } from '../ai'
import { SOURCE_LABELS } from '../sources'

const schema = z.object({
  topic: z
    .string()
    .min(3)
    .max(80)
    .describe('English topic name in 4-10 words. No quotes, no period.'),
  topicZh: z
    .string()
    .min(2)
    .max(40)
    .describe('简体中文主题，4-12 个字，不要加引号或句号'),
  summary: z
    .string()
    .min(10)
    .max(280)
    .describe('English: 1-2 neutral sentences describing what is being discussed.'),
  summaryZh: z
    .string()
    .min(8)
    .max(180)
    .describe('简体中文：1-2 句中性描述正在讨论的事情'),
  whyItMatters: z
    .string()
    .min(10)
    .max(280)
    .describe('English: 1 sentence on why an AI growth operator should care.'),
  whyItMattersZh: z
    .string()
    .min(8)
    .max(180)
    .describe('简体中文：1 句话说明 AI 增长岗位为什么要关心'),
})

function fallbackTrend(cluster: Cluster, idx: number): Trend {
  const sortedPosts = [...cluster.posts].sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  )
  const top = sortedPosts[0]
  const topic =
    cluster.topTokens.slice(0, 4).join(' · ') || top.title.slice(0, 60)
  return {
    id: `trend-${idx}-${top.id}`,
    topic,
    topicZh: topic,
    summary: top.title,
    summaryZh: top.title,
    whyItMatters:
      'LLM unavailable — manual review recommended. Set AI_GATEWAY_API_KEY or OPENAI_API_KEY to enable AI summaries.',
    whyItMattersZh:
      '尚未配置大模型 —— 建议人工审阅。在 Vercel 环境变量中设置 AI_GATEWAY_API_KEY 或 OPENAI_API_KEY 即可启用 AI 摘要。',
    postCount: cluster.posts.length,
    sources: [...new Set(cluster.posts.map((p) => p.source))],
    posts: sortedPosts,
    topPostUrl: top.url,
    generatedAt: new Date().toISOString(),
  }
}

function buildPrompt(cluster: Cluster): string {
  const lines = cluster.posts.slice(0, 8).map((p) => {
    const src = SOURCE_LABELS[p.source]
    const stat = `${p.score ?? 0} pts · ${p.comments ?? 0} comments`
    return `- [${src}] ${p.title} (${stat})`
  })
  return [
    "You are an AI Growth analyst summarizing today's trending discussion in one cluster.",
    'Output BOTH English and Simplified Chinese versions. Both languages must be tight, specific, and avoid hype words like "revolutionary".',
    '',
    'Posts in this cluster:',
    ...lines,
    '',
    `Top tokens: ${cluster.topTokens.join(', ')}`,
    '',
    'Field rules:',
    '- topic / topicZh: a single concise topic name (no quotes, no period).',
    '- summary / summaryZh: 1-2 neutral sentences describing what is being discussed.',
    '- whyItMatters / whyItMattersZh: 1 sentence on why an AI Growth Operator (AI agent / dev-tools market) should care.',
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
      topicZh: object.topicZh,
      summary: object.summary,
      summaryZh: object.summaryZh,
      whyItMatters: object.whyItMatters,
      whyItMattersZh: object.whyItMattersZh,
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
