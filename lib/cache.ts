import type { DailyDigest } from './sources/types'

const memoryCache = new Map<string, { data: DailyDigest; expiresAt: number }>()
const TTL_MS = 6 * 60 * 60 * 1000

function key(date: string) {
  return `digest:${date}`
}

function todayKey() {
  return key(new Date().toISOString().slice(0, 10))
}

export async function getCachedDigest(): Promise<DailyDigest | null> {
  const k = todayKey()

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(
        `${process.env.KV_REST_API_URL}/get/${k}`,
        {
          headers: { authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        }
      )
      if (res.ok) {
        const json = (await res.json()) as { result: string | null }
        if (json.result) return JSON.parse(json.result) as DailyDigest
      }
    } catch (err) {
      console.error('KV read failed', err)
    }
  }

  const hit = memoryCache.get(k)
  if (hit && hit.expiresAt > Date.now()) return hit.data
  return null
}

export async function setCachedDigest(digest: DailyDigest): Promise<void> {
  const k = key(digest.date)

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await fetch(`${process.env.KV_REST_API_URL}/set/${k}`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(JSON.stringify(digest)),
      })
      await fetch(
        `${process.env.KV_REST_API_URL}/expire/${k}/${TTL_MS / 1000}`,
        {
          method: 'POST',
          headers: { authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
        }
      )
      return
    } catch (err) {
      console.error('KV write failed', err)
    }
  }

  memoryCache.set(k, { data: digest, expiresAt: Date.now() + TTL_MS })
}
