# Spiritual Coach

A Next.js-powered spiritual coaching application that provides personalized guidance through AI conversations, blending wisdom from multiple spiritual masters and maintaining context across sessions through intelligent memory systems.

## Features

### Phase 1: Core Chat System
- **Multi-Master Personality**: Chat with a spiritual coach that blends personalities from selected masters (Rumi, Marcus Aurelius, Carl Jung, Eckhart Tolle, Jesus)
- **User Authentication**: Secure login and profile management via Supabase
- **Onboarding**: Select your preferred spiritual guides during setup

### Phase 2: The Memory & Observer ✨
- **Insights Table**: Stores user psychological patterns, blockages, and strengths
- **Observer Agent**: Background AI agent that automatically analyzes conversations to identify:
  - Blockages (fears, limiting beliefs)
  - Strengths (hidden capabilities, positive patterns)
  - Patterns (recurring emotional or behavioral themes)
- **Context-Aware Chat**: The AI remembers your trauma history and patterns across sessions, providing personalized guidance without explicitly mentioning them
- **Cross-Session Memory**: Builds a continuous understanding of each user's spiritual journey

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI**: OpenAI GPT-4o via Vercel AI SDK
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Julio0795/Spiritual-Coach.git
cd Spiritual-Coach
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

4. Set up Supabase:
   - Create a `profiles` table with `spiritual_config` column
   - Create an `insights` table with columns:
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to auth.users)
     - `title` (text)
     - `observation` (text)
     - `type` (text: 'blockage', 'strength', or 'pattern')
     - `created_at` (timestamp)

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
spiritual-coach/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API with Observer integration
│   ├── actions/
│   │   └── profile.ts            # Server actions for profile updates
│   ├── dashboard/
│   ├── login/
│   └── onboarding/
├── components/
│   ├── chat/
│   │   └── ChatWindow.tsx        # Main chat interface
│   └── onboarding/
│       └── GuruSelector.tsx      # Master selection component
├── lib/
│   ├── ai/
│   │   └── observer.ts           # Observer agent for analyzing conversations
│   └── constants.ts              # Spiritual masters data
└── utils/
    └── supabase/
        ├── client.ts             # Browser Supabase client
        └── server.ts             # Server Supabase client
```

## How It Works

1. **User Onboarding**: Select preferred spiritual masters that shape the AI's personality
2. **Conversation**: Chat with the AI coach about life, struggles, and spiritual growth
3. **Observer Analysis**: After each conversation, the Observer agent automatically analyzes the exchange for deep psychological insights
4. **Memory Storage**: Insights are saved to the database and associated with the user
5. **Context Injection**: In future conversations, the AI reads previous insights and subtly incorporates them into guidance without explicitly mentioning them

## License

[Add your license here]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
