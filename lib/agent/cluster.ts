import type { Post } from '../sources/types'

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'should', 'could', 'may', 'might', 'must', 'shall', 'to',
  'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'from', 'as',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
  'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its',
  'our', 'their', 'show', 'how', 'why', 'what', 'when', 'where', 'who',
  'new', 'use', 'using', 'used', 'make', 'made', 'get', 'got', 'going',
  'just', 'like', 'one', 'two', 'three', 'first', 'last', 'best', 'better',
  'good', 'great', 'really', 'very', 'much', 'many', 'some', 'all', 'any',
  'no', 'not', 'only', 'over', 'under', 'into', 'out', 'up', 'down', 'now',
  'then', 'there', 'here', 'so', 'than', 'too', 'also', 'still', 'yet',
  'vs', 'amp', 'via', 'feat',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  for (const t of a) if (b.has(t)) intersection++
  const union = a.size + b.size - intersection
  return intersection / union
}

export interface Cluster {
  posts: Post[]
  topTokens: string[]
}

const SIMILARITY_THRESHOLD = 0.18

export function clusterPosts(posts: Post[]): Cluster[] {
  const tokenSets = posts.map((p) => {
    const text = [p.title, p.excerpt ?? '', ...(p.tags ?? [])].join(' ')
    return new Set(tokenize(text))
  })

  const clusters: Cluster[] = []
  const assigned = new Array<boolean>(posts.length).fill(false)

  for (let i = 0; i < posts.length; i++) {
    if (assigned[i]) continue
    assigned[i] = true
    const members = [posts[i]]
    const tokens = new Map<string, number>()
    for (const t of tokenSets[i]) tokens.set(t, (tokens.get(t) ?? 0) + 1)

    for (let j = i + 1; j < posts.length; j++) {
      if (assigned[j]) continue
      if (jaccard(tokenSets[i], tokenSets[j]) >= SIMILARITY_THRESHOLD) {
        assigned[j] = true
        members.push(posts[j])
        for (const t of tokenSets[j]) tokens.set(t, (tokens.get(t) ?? 0) + 1)
      }
    }

    const topTokens = [...tokens.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t]) => t)

    clusters.push({ posts: members, topTokens })
  }

  return clusters.sort((a, b) => b.posts.length - a.posts.length)
}
