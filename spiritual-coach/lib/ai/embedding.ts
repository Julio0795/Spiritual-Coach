import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'

/**
 * Generates an embedding vector for the given text using OpenAI's text-embedding-3-small model.
 * 
 * @param text - The text to generate an embedding for
 * @returns A promise that resolves to an array of numbers representing the embedding vector
 * @throws Error if the input text is empty
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Edge case: Validate input - throw error for empty strings
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text')
  }

  // Replace newlines with spaces to optimize embedding quality
  const normalizedText = text.replace(/\n/g, ' ')

  // Generate embedding using Vercel AI SDK
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: normalizedText,
  })

  return embedding
}

