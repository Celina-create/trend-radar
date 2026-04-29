'use client'

import { useEffect, useState } from 'react'
import type { DailyDigest } from '@/lib/sources/types'
import { TrendCard } from './trend-card'
import { SourceHealthBar } from './source-health'
import { LangToggle } from './lang-toggle'
import { detectInitialLang, messages, type Lang, DEFAULT_LANG } from '@/lib/i18n'

interface Props {
  digest: DailyDigest
  hasLLM: boolean
}

export function TrendRadarShell({ digest, hasLLM }: Props) {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setLang(detectInitialLang())
    setHydrated(true)
  }, [])

  function handleLangChange(next: Lang) {
    setLang(next)
    try {
      window.localStorage.setItem('trend-radar:lang', next)
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
    }
  }

  const t = messages[lang]
  const llmEnvHint = 'AI_GATEWAY_API_KEY / OPENAI_API_KEY'

  return (
    <main className="min-h-screen" suppressHydrationWarning>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--color-accent)' }}
              />
              <span className="text-[11px] uppercase tracking-widest text-text-secondary font-medium">
                {t.brand} · {t.version}
              </span>
            </div>
            <LangToggle lang={lang} onChange={handleLangChange} />
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight mb-2">
            {t.pageTitle}
          </h1>
          <p className="text-[13px] text-text-secondary leading-relaxed max-w-xl">
            {t.pageSubtitle(digest.sourceHealth.length)}{' '}
            <a
              href="https://github.com/Celina-create"
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              {t.builtBy}
            </a>
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
              <span className="font-medium">{t.llmNotConfigured}</span>{' '}
              {t.llmNotConfiguredHint}
            </div>
            <div className="text-[11px] text-text-secondary">
              {t.llmEnable(llmEnvHint)}
            </div>
          </div>
        )}

        <SourceHealthBar
          health={digest.sourceHealth}
          totalPosts={digest.totalPosts}
          generatedAt={digest.generatedAt}
          lang={lang}
        />

        {digest.trends.length === 0 ? (
          <div className="card px-5 py-12 text-center">
            <p className="text-[13px] text-text-secondary">{t.empty}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {digest.trends.map((trend, i) => (
              <TrendCard key={trend.id} trend={trend} rank={i + 1} lang={lang} />
            ))}
          </div>
        )}

        <footer className="mt-16 pt-6 border-t text-[11px] text-text-muted flex flex-wrap items-center justify-between gap-2">
          <div>
            {t.built}{' '}
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
              {t.source}
            </a>
          </div>
          <div className="font-mono">{digest.date}</div>
        </footer>

        {!hydrated && null}
      </div>
    </main>
  )
}
