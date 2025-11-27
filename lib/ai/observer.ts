import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

// Schema for a single insight
const InsightSchema = z.object({
  title: z.string(),
  observation: z.string(),
  type: z.enum(['blockage', 'strength', 'pattern']),
})

// Schema for the analysis result - allows null if no insight is found
const AnalysisSchema = z.object({
  insight: InsightSchema.nullable(),
})

export async function analyzeChat(messages: any[]): Promise<{
  title: string
  observation: string
  type: 'blockage' | 'strength' | 'pattern'
} | null> {
  // Edge case: Return null for empty or very short conversations
  if (!messages || messages.length < 2) {
    return null
  }

  // Construct the prompt
  const systemInstruction =
    'You are The Observer, a background psychoanalyst. Analyze the following conversation history.'

  const criteria =
    'Look for deep fears, limiting beliefs, recurring emotional patterns, or hidden strengths. Do not analyze small talk or greetings. If no deep psychological insight is present, return null for the insight field.'

  // Convert messages to a readable format for the prompt
  const conversationText = messages
    .map((msg) => {
      const role = msg.role || 'user'
      // Handle UIMessage format (with parts) or standard format (with content)
      const content =
        msg.parts?.find((part: any) => part.type === 'text')?.text ||
        msg.content ||
        ''
      return `${role}: ${content}`
    })
    .join('\n\n')

  const prompt = `${systemInstruction}\n\n${criteria}\n\nConversation:\n${conversationText}`

  // Execute AI analysis
  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: AnalysisSchema,
      mode: 'json',
      prompt,
    })

    return result.object.insight
  } catch (error) {
    console.error('Error in Observer analysis:', error)
    // Return null on error to prevent breaking the chat flow
    return null
  }
}

