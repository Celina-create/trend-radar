'use client'

import type { Lang } from '@/lib/i18n'
import { messages } from '@/lib/i18n'

interface Props {
  lang: Lang
  onChange: (lang: Lang) => void
}

export function LangToggle({ lang, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label={messages[lang].toggleAria}
      className="inline-flex items-center rounded-md border bg-bg-elevated p-0.5 text-[11px] font-medium select-none"
    >
      {(['en', 'zh'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          aria-pressed={lang === l}
          className={
            'px-2 py-0.5 rounded-[4px] leading-none transition-colors ' +
            (lang === l
              ? 'bg-bg text-text-primary'
              : 'text-text-tertiary hover:text-text-secondary')
          }
        >
          {l === 'en' ? 'EN' : '中'}
        </button>
      ))}
    </div>
  )
}
