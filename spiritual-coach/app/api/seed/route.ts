import { generateEmbedding } from '@/lib/ai/embedding'
import { createClient } from '@/utils/supabase/server'

export async function GET(req: Request) {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables')
      return Response.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Define documents to seed
    const documents = [
      {
        content: 'The wound is the place where the Light enters you.',
        author: 'Rumi',
      },
      {
        content: 'Stop acting so small. You are the universe in ecstatic motion.',
        author: 'Rumi',
      },
      {
        content: 'What you seek is seeking you.',
        author: 'Rumi',
      },
      {
        content:
          'You have power over your mind - not outside events. Realize this, and you will find strength.',
        author: 'Marcus Aurelius',
      },
      {
        content:
          'The happiness of your life depends upon the quality of your thoughts.',
        author: 'Marcus Aurelius',
      },
      {
        content:
          'Waste no more time arguing about what a good man should be. Be one.',
        author: 'Marcus Aurelius',
      },
    ]

    // Initialize Supabase client
    const supabase = await createClient()

    // Process all documents in parallel
    const insertPromises = documents.map(async (doc) => {
      try {
        // Generate embedding for the document content
        const embedding = await generateEmbedding(doc.content)

        // Insert into knowledge_base table
        const { error } = await supabase.from('knowledge_base').insert({
          content: doc.content,
          author: doc.author,
          embedding: embedding, // Vector dimension: 1536 (text-embedding-3-small)
        })

        if (error) {
          console.error(`Error inserting document from ${doc.author}:`, error)
          throw error
        }

        return { success: true, author: doc.author, content: doc.content }
      } catch (error) {
        console.error(`Error processing document from ${doc.author}:`, error)
        throw error
      }
    })

    // Wait for all inserts to complete
    await Promise.all(insertPromises)

    return Response.json({
      success: true,
      message: 'Database seeded successfully',
      count: documents.length,
    })
  } catch (error: any) {
    console.error('Error seeding database:', error)
    return Response.json(
      {
        error: 'Failed to seed database',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

