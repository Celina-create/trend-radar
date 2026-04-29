import { runPipeline } from '@/lib/agent/pipeline'
import { getCachedDigest, setCachedDigest } from '@/lib/cache'
import { TrendCard } from '@/components/trend-card'
import { SourceHealthBar } from '@/components/source-health'
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

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--color-accent)' }}
            />
            <span className="text-[11px] uppercase tracking-widest text-text-secondary font-medium">
              Trend Radar · v0.1
            </span>
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight mb-2">
            Today in AI / Agent / OSS
          </h1>
          <p className="text-[13px] text-text-secondary leading-relaxed max-w-xl">
            Aggregated from {digest.sourceHealth.length} sources. Clusters
            ranked by cross-source signal density. Built by{' '}
            <a
              href="https://github.com/Celina-create"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              Celina
            </a>{' '}
            as a portfolio agent for AI Growth roles.
          </p>
        </header>

        {!hasLLM && (
          <div
            className="card px-4 py-3 mb-6"
            style={{
              borderColor: 'rgba(245,158,11,0.4)',
              background: 'rgba(245,158,11,0.05)',
            }}
          >
            <div className="text-[12px] text-text-primary mb-1">
              <span className="font-medium">LLM not configured.</span> Trends
              shown without AI summaries.
            </div>
            <div className="text-[11px] text-text-secondary">
              Set <code className="font-mono text-accent">AI_GATEWAY_API_KEY</code>{' '}
              or <code className="font-mono text-accent">OPENAI_API_KEY</code>{' '}
              in Vercel env vars to enable.
            </div>
          </div>
        )}

        <SourceHealthBar
          health={digest.sourceHealth}
          totalPosts={digest.totalPosts}
          generatedAt={digest.generatedAt}
        />

        {digest.trends.length === 0 ? (
          <div className="card px-5 py-12 text-center">
            <p className="text-[13px] text-text-secondary">
              No trends found. All source fetches may have failed — check the
              source health bar above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {digest.trends.map((t, i) => (
              <TrendCard key={t.id} trend={t} rank={i + 1} />
            ))}
          </div>
        )}

        <footer className="mt-16 pt-6 border-t text-[11px] text-text-muted flex flex-wrap items-center justify-between gap-2">
          <div>
            Built with{' '}
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noreferrer"
              className="hover:text-text-secondary"
            >
              Next.js 16
            </a>{' '}
            ·{' '}
            <a
              href="https://sdk.vercel.ai"
              target="_blank"
              rel="noreferrer"
              className="hover:text-text-secondary"
            >
              Vercel AI SDK
            </a>{' '}
            ·{' '}
            <a
              href="https://github.com/Celina-create/trend-radar"
              target="_blank"
              rel="noreferrer"
              className="hover:text-text-secondary"
            >
              Source
            </a>
          </div>
          <div className="font-mono">{digest.date}</div>
        </footer>
      </div>
    </main>
  )
}
