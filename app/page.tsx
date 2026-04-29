import { runPipeline } from '@/lib/agent/pipeline'
import { getCachedDigest, setCachedDigest } from '@/lib/cache'
import { TrendRadarShell } from '@/components/trend-radar-shell'
import { hasLLM } from '@/lib/ai'

export const revalidate = 1800
export const dynamic = 'force-dynamic'

async function getDigest() {
  let digest = await getCachedDigest()
  if (!digest) {
    digest = await runPipeline()
    await setCachedDigest(digest)
  }
  return digest
}

export default async function Page() {
  const digest = await getDigest()
  return <TrendRadarShell digest={digest} hasLLM={hasLLM} />
}
