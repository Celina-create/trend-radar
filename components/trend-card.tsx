'use client'

import { useState } from 'react'
import type { Trend } from '@/lib/sources/types'
import { SOURCE_LABELS } from '@/lib/sources'
import { ChevronDown, ChevronUp, ExternalLink, MessageSquare, ArrowUp } from 'lucide-react'

interface Props {
  trend: Trend
  rank: number
}

export function TrendCard({ trend, rank }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 hover:bg-bg-elevated/40 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-mono text-text-muted bg-bg-elevated border">
            {String(rank).padStart(2, '0')}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-medium text-text-primary mb-1.5 leading-snug">
              {trend.topic}
            </h3>
            <p className="text-[13px] text-text-secondary leading-relaxed mb-2">
              {trend.summary}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="tag-accent">{trend.postCount} posts</span>
              {trend.sources.map((s) => (
                <span key={s} className="tag">
                  {SOURCE_LABELS[s]}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 self-center text-text-muted">
            {open ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t bg-bg/40">
          <div className="px-5 py-4">
            <div className="text-[11px] uppercase tracking-wider text-text-muted mb-2 font-medium">
              Why it matters
            </div>
            <p className="text-[13px] text-text-primary leading-relaxed mb-5">
              {trend.whyItMatters}
            </p>

            <div className="text-[11px] uppercase tracking-wider text-text-muted mb-2 font-medium">
              Top posts
            </div>
            <ul className="space-y-2">
              {trend.posts.slice(0, 8).map((p) => (
                <li
                  key={p.id}
                  className="flex items-start gap-3 py-2 border-t border-border/40 first:border-t-0"
                >
                  <span className="flex-shrink-0 text-[10px] uppercase tracking-wider text-text-muted font-mono mt-0.5 w-20">
                    {SOURCE_LABELS[p.source]}
                  </span>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex-1 text-[13px] text-text-primary hover:text-accent transition-colors group leading-snug"
                  >
                    {p.title}
                    <ExternalLink className="inline-block w-3 h-3 ml-1 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </a>
                  <div className="flex-shrink-0 flex items-center gap-2 text-[11px] text-text-muted font-mono">
                    {typeof p.score === 'number' && (
                      <span className="flex items-center gap-0.5">
                        <ArrowUp className="w-3 h-3" />
                        {p.score}
                      </span>
                    )}
                    {typeof p.comments === 'number' && (
                      <span className="flex items-center gap-0.5">
                        <MessageSquare className="w-3 h-3" />
                        {p.comments}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
