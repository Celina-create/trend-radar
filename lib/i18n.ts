export type Lang = 'en' | 'zh'

export const DEFAULT_LANG: Lang = 'en'

export interface Messages {
  brand: string
  version: string
  pageTitle: string
  pageSubtitle: (sourceCount: number) => string
  builtBy: string
  llmNotConfigured: string
  llmNotConfiguredHint: string
  llmEnable: (envVar: string) => string
  sources: string
  sourcesHealthy: (ok: number, total: number, posts: number) => string
  postsLabel: string
  postsCountLabel: (n: number) => string
  whyItMatters: string
  topPosts: string
  empty: string
  built: string
  source: string
  date: string
  toggleAria: string
  poweredByLLM: string
}

const en: Messages = {
  brand: 'Trend Radar',
  version: 'v0.1',
  pageTitle: 'Today in AI / Agent / OSS',
  pageSubtitle: (n) =>
    `Aggregated from ${n} sources. Clusters ranked by cross-source signal density.`,
  builtBy: 'Built by Celina as a portfolio agent for AI Growth roles.',
  llmNotConfigured: 'LLM not configured.',
  llmNotConfiguredHint: 'Trends shown without AI summaries.',
  llmEnable: (e) => `Set ${e} in Vercel env vars to enable.`,
  sources: 'Sources',
  sourcesHealthy: (ok, total, posts) =>
    `· ${ok}/${total} healthy · ${posts} posts`,
  postsLabel: 'posts',
  postsCountLabel: (n) => `${n} ${n === 1 ? 'post' : 'posts'}`,
  whyItMatters: 'Why it matters',
  topPosts: 'Top posts',
  empty:
    'No trends found. All source fetches may have failed — check the source health bar above.',
  built: 'Built with',
  source: 'Source',
  date: 'date',
  toggleAria: 'Toggle language',
  poweredByLLM: 'AI summary',
}

const zh: Messages = {
  brand: 'Trend Radar',
  version: 'v0.1',
  pageTitle: '今日 AI / Agent / 开源动向',
  pageSubtitle: (n) =>
    `聚合自 ${n} 个信源，按跨源信号密度排序。`,
  builtBy:
    '蔡琪玲（Celina）为 AI 增长岗位求职打造的作品集 agent。',
  llmNotConfigured: '尚未配置大模型',
  llmNotConfiguredHint: '当前以原始信号展示，无 AI 摘要。',
  llmEnable: (e) => `在 Vercel 环境变量中设置 ${e} 即可启用。`,
  sources: '信源',
  sourcesHealthy: (ok, total, posts) =>
    `· ${ok}/${total} 健康 · 共 ${posts} 条`,
  postsLabel: '条',
  postsCountLabel: (n) => `${n} 条`,
  whyItMatters: '为什么值得关注',
  topPosts: '原始信号',
  empty: '今日未发现趋势 —— 上方信源面板可能全部失败了。',
  built: '技术栈',
  source: '源码',
  date: '日期',
  toggleAria: '切换语言',
  poweredByLLM: 'AI 摘要',
}

export const messages: Record<Lang, Messages> = { en, zh }

export function detectInitialLang(): Lang {
  if (typeof window === 'undefined') return DEFAULT_LANG
  try {
    const stored = window.localStorage.getItem('trend-radar:lang')
    if (stored === 'en' || stored === 'zh') return stored
  } catch {}
  if (typeof navigator !== 'undefined' && navigator.language?.startsWith('zh')) {
    return 'zh'
  }
  return DEFAULT_LANG
}
