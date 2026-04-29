import { NextResponse } from 'next/server'
import { runPipeline } from '@/lib/agent/pipeline'
import { getCachedDigest, setCachedDigest } from '@/lib/cache'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET() {
  let digest = await getCachedDigest()
  if (!digest) {
    digest = await runPipeline()
    await setCachedDigest(digest)
  }
  return NextResponse.json(digest, {
    headers: {
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  })
}
