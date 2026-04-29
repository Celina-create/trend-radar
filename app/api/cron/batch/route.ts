import { NextResponse } from 'next/server'
import { runPipeline } from '@/lib/agent/pipeline'
import { setCachedDigest } from '@/lib/cache'

export const runtime = 'nodejs'
export const maxDuration = 300
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    auth !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  const digest = await runPipeline()
  await setCachedDigest(digest)

  return NextResponse.json({
    ok: true,
    durationMs: Date.now() - start,
    date: digest.date,
    trendCount: digest.trends.length,
    totalPosts: digest.totalPosts,
    sourceHealth: digest.sourceHealth.map((s) => ({
      source: s.source,
      ok: s.ok,
      postCount: s.postCount,
    })),
  })
}
