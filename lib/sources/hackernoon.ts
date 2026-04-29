import type { FetchResult, Post } from './types'

const SOURCE = 'hackernoon' as const

const FEED_URL = 'https://hackernoon.com/tagged/ai/feed'

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

function pick(xml: string, tag: string): string | null {
  const m = xml.match(
    new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`)
  )
  return m ? decodeEntities(m[1].trim()) : null
}

export async function fetchHackerNoon(): Promise<FetchResult> {
  const start = Date.now()
  try {
    const res = await fetch(FEED_URL, {
      next: { revalidate: 1800 },
      headers: {
        'user-agent':
          'trend-radar/0.1 (+https://github.com/Celina-create/trend-radar)',
        accept: 'application/rss+xml, application/xml, text/xml',
      },
    })
    if (!res.ok) throw new Error(`HackerNoon HTTP ${res.status}`)
    const xml = await res.text()
    const itemBlocks = xml.split(/<item[\s>]/).slice(1)
    const posts: Post[] = []
    for (const block of itemBlocks.slice(0, 25)) {
      const item = '<item>' + block
      const title = pick(item, 'title')
      const link = pick(item, 'link')
      const guid = pick(item, 'guid')
      const pubDate = pick(item, 'pubDate')
      const creator = pick(item, 'dc:creator') || pick(item, 'author')
      const description = pick(item, 'description')
      if (!title || !link) continue
      const id = guid || link
      const cleanExcerpt = description
        ? description
            .replace(/<[^>]+>/g, '')
            .trim()
            .slice(0, 240)
        : undefined
      posts.push({
        id: `hn0-${Buffer.from(id).toString('base64url').slice(0, 24)}`,
        source: SOURCE,
        title,
        url: link,
        author: creator ?? undefined,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        excerpt: cleanExcerpt,
        tags: ['ai'],
      })
    }
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
