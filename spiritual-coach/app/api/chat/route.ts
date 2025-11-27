import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages } from 'ai'
import { createClient } from '@/utils/supabase/server'
import { SPIRITUAL_MASTERS } from '@/lib/constants'
import { analyzeChat } from '@/lib/ai/observer'
import { generateEmbedding } from '@/lib/ai/embedding'

interface SpiritualConfig {
  masters?: string[]
}

export async function POST(req: Request) {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      console.error('Authentication error:', authError)
      return new Response('Unauthorized', { status: 401 })
    }

    // Fetch user's spiritual config
    let masterIds: string[] = []
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('spiritual_config')
        .eq('id', user.id)
        .single()

      if (!profileError && profile?.spiritual_config) {
        const spiritualConfig = profile.spiritual_config as SpiritualConfig
        masterIds = spiritualConfig.masters || []
      }
    } catch (error) {
      // Log error but allow chat to proceed with empty masters
      console.error('Error fetching spiritual config:', error)
    }

    // Fetch user's previous insights for context
    let insightsContext = ''
    try {
      const { data: insights, error: insightsError } = await supabase
        .from('insights')
        .select('title, type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!insightsError && insights && insights.length > 0) {
        const insightsList = insights
          .map((i) => `[${i.type.toUpperCase()}: ${i.title}]`)
          .join(', ')
        insightsContext = `KNOWN USER PATTERNS: ${insightsList}`
      }
    } catch (error) {
      // Log error but allow chat to proceed without insights context
      console.error('Error fetching insights:', error)
    }

    // Map master IDs to names
    const masterNames = masterIds
      .map((id) => {
        const master = SPIRITUAL_MASTERS.find((m) => m.id === id)
        return master?.name
      })
      .filter((name): name is string => Boolean(name))

    // RAG: Retrieve relevant wisdom from knowledge base
    let wisdomContext = ''
    try {
      // Extract the last user message
      const lastMessage = messages[messages.length - 1]

      // Ensure lastMessage exists and has content
      if (lastMessage && lastMessage.role === 'user') {
        // Handle UIMessage format (with parts) or standard format (with content)
        const userContent =
          lastMessage.parts?.find((part: any) => part.type === 'text')?.text ||
          lastMessage.content ||
          ''

        if (userContent && userContent.trim().length > 0) {
          // Generate embedding for the user's query
          const embedding = await generateEmbedding(userContent)

          // Call Supabase RPC to find matching documents
          const { data: documents, error: rpcError } = await supabase.rpc(
            'match_documents',
            {
              query_embedding: embedding,
              match_threshold: 0.5,
              match_count: 3,
            }
          )

          if (rpcError) {
            console.error('Error calling match_documents RPC:', rpcError)
            // Continue without RAG context if RPC fails
          } else if (documents && documents.length > 0) {
            // Build wisdom context from retrieved documents
            wisdomContext = documents
              .map((doc: any) => `"${doc.content}" - ${doc.author}`)
              .join('\n')
          }
        }
      }
    } catch (ragError: any) {
      // Log error but proceed with chat without RAG context
      console.error('Error in RAG retrieval:', ragError)
    }

    // Construct system prompt
    const masterNamesString =
      masterNames.length > 0
        ? masterNames.join(', ')
        : 'Spiritual Coach'

    const systemPrompt = `You are a spiritual coach. Your personality is a blend of: ${masterNamesString}.

Tone: Empathetic, wise, and grounded.
${insightsContext ? `${insightsContext}` : ''}
${wisdomContext ? `\nLIBRARY OF WISDOM:\n${wisdomContext}` : ''}

CRITICAL INSTRUCTIONS:
1. Use the known patterns to tailor your advice subtly.
2. Do not explicitly list the patterns ("I see you have a fear of failure"). Instead, address them naturally ("Remember that failure is just a lesson...").
3. Analyze the "LIBRARY OF WISDOM" above.
4. If the user's query relates to any of these texts, you MUST explicitly quote the text and cite the author.
   - Example: "As Rumi wrote, 'The wound is the place where the Light enters you.'"
5. Do NOT just paraphrase the wisdom; use the exact words provided if they are relevant.
6. If no wisdom is relevant, answer from your "Spiritual Coach" persona naturally.
7. Keep responses concise but profound.`

    // Convert UIMessages to ModelMessages for streamText
    // The messages from useChat are in UIMessage format (with parts), 
    // but streamText expects ModelMessage format (with content)
    const modelMessages = convertToModelMessages(
      messages.map(({ id, ...message }) => message)
    )

    // Store user ID and original messages for Observer callback
    const userId = user.id
    const originalMessages = messages

    // Stream AI response
    try {
      const result = await streamText({
        model: openai('gpt-4o'),
        system: systemPrompt,
        messages: modelMessages,
        onFinish: async ({ text }) => {
          try {
            // Construct full history: original messages + new assistant response
            const fullHistory = [
              ...originalMessages,
              { role: 'assistant', content: text },
            ]

            // Call Observer to analyze the conversation
            const insight = await analyzeChat(fullHistory)

            // If insight is found, save it to the database
            if (insight !== null) {
              // Create Supabase client for background write
              const supabase = await createClient()

              // Insert insight into the insights table
              const { error: insertError } = await supabase
                .from('insights')
                .insert({
                  user_id: userId,
                  title: insight.title,
                  observation: insight.observation,
                  type: insight.type,
                })

              if (insertError) {
                console.error('Error saving insight to database:', insertError)
              }
            }
          } catch (observerError: any) {
            // Log errors but don't crash the function
            console.error('Error in Observer onFinish callback:', observerError)
          }
        },
      })

      // Use toUIMessageStreamResponse for useChat from @ai-sdk/react
      // This is the correct format that useChat expects
      return result.toUIMessageStreamResponse()
    } catch (streamError: any) {
      console.error('Error calling OpenAI:', streamError)
      console.error('Error details:', {
        message: streamError.message,
        stack: streamError.stack,
        name: streamError.name,
      })
      return new Response(
        JSON.stringify({
          error: 'Failed to generate response',
          details: streamError.message || 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error: any) {
    console.error('Error in chat route:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error.message || 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

