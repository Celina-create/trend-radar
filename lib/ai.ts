import { createOpenAI } from '@ai-sdk/openai'

function getProvider() {
  if (process.env.AI_GATEWAY_API_KEY) {
    return createOpenAI({
      apiKey: process.env.AI_GATEWAY_API_KEY,
      baseURL: 'https://ai-gateway.vercel.sh/v1',
    })
  }
  if (process.env.OPENAI_API_KEY) {
    return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return null
}

export const provider = getProvider()

export const SUMMARY_MODEL = 'gpt-4o-mini'

export const hasLLM = provider !== null
