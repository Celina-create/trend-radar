import type { SourceHealth as SourceHealthType } from '@/lib/sources/types'
import { SOURCE_LABELS } from '@/lib/sources'
import type { Lang } from '@/lib/i18n'
import { messages } from '@/lib/i18n'

interface Props {
  health: SourceHealthType[]
  totalPosts: number
  generatedAt: string
  lang: Lang
}

export function SourceHealthBar({ health, totalPosts, generatedAt, lang }: Props) {
  const t = messages[lang]
  const okCount = health.filter((h) => h.ok).length
  const time = new Date(generatedAt).toLocaleString(
    lang === 'zh' ? 'zh-CN' : 'en-US',
    {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  )

  return (
    <div className="card px-4 py-3 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium">{t.sources}</span>
          <span className="text-[11px] text-text-tertiary">
            {t.sourcesHealthy(okCount, health.length, totalPosts)}
          </span>
        </div>
        <span className="text-[11px] text-text-muted font-mono">{time}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {health.map((h) => (
          <div
            key={h.source}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md border"
            style={{
              borderColor: h.ok ? 'var(--color-border)' : 'rgba(239,68,68,0.4)',
              background: h.ok ? 'transparent' : 'rgba(239,68,68,0.06)',
            }}
            title={h.error || `${h.postCount} posts in ${h.durationMs}ms`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: h.ok
                  ? 'var(--color-success)'
                  : 'var(--color-danger)',
              }}
            />
            <span className="text-[11px] text-text-secondary">
              {SOURCE_LABELS[h.source]}
            </span>
            <span className="text-[10px] text-text-muted font-mono">
              {h.postCount}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
