# Trend Radar

> AI Growth Intelligence Agent — aggregates trending AI / Agent / OSS signals from 12+ sources daily, clusters them by topic, and produces ready-to-act trend cards for AI growth operators.

Built by [Celina](https://github.com/Celina-create) as a **portfolio agent** for AI Growth Operator roles. Live demo: [trend-radar.vercel.app](https://trend-radar.vercel.app)

---

## What it does

- Pulls today's top posts from **5 sources** (MVP): Hacker News · r/LocalLLaMA · r/MachineLearning · Dev.to (AI tag) · GitHub Trending
- **Clusters** posts by token-level Jaccard similarity (no embeddings needed for MVP)
- **Summarizes** each cluster with `gpt-4o-mini` via Vercel AI SDK — produces a topic, neutral summary, and "why it matters for growth"
- **Ranks** clusters by cross-source signal density
- **Caches** the daily digest for 6 hours; refreshed every morning via Vercel Cron

## Why it matters

For an AI Growth Operator, time-to-signal is everything. A scattered Twitter feed costs 30 min of doom-scrolling per morning to surface 3 tweets worth of insight. Trend Radar compresses that to one card view in under 30 seconds — and frames every cluster around growth implications, not just hype.

This is also a deliberate **portfolio piece**: it shows I can ship an opinionated, end-to-end agent (data → LLM pipeline → product UI → deploy → monitoring) using the modern AI agent stack — not just connect APIs in n8n.

## Stack

| Layer | Tool |
|------|------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind 4 |
| LLM | Vercel AI SDK + `gpt-4o-mini` (via AI Gateway or direct OpenAI) |
| Cache | Vercel KV (production) / in-memory (dev) |
| Cron | Vercel Cron (`0 6 * * *` daily) |
| Hosting | Vercel |

## Run locally

```bash
pnpm install
cp .env.example .env.local
# Add AI_GATEWAY_API_KEY or OPENAI_API_KEY
pnpm dev
```

Without LLM keys, the app still runs — clusters fall back to top-post titles and a notice banner appears.

## Roadmap

See [`specs/trend-radar-sdd-v0.1.md`](https://github.com/refly-ai/agent-digital-cowork/blob/main/specs/trend-radar-sdd-v0.1.md) (private) for the full design doc.

Post-MVP additions:
- 7 more sources (Substack AI, HackerNoon, TLDR, The Neuron, Product Hunt, X via nitter, Medium AI)
- Embedding-based clustering + dedup
- Tweet draft generation per trend (for one-click posting)
- Source health alerts to Discord
- Per-user RSS export

## Built with [`ai-agent-sdd`](https://github.com/Celina-create/X-Studio/tree/main/skills/ai-agent-sdd) skill

The 805-line SDD that powered this build was generated using my open-source `ai-agent-sdd` skill template.
