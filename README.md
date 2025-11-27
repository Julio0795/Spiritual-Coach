# Spiritual Coach

A Next.js-powered spiritual coaching application that provides personalized guidance through AI conversations, blending wisdom from multiple spiritual masters and maintaining context across sessions through intelligent memory systems.

## Features

### Phase 1: The Foundation (MVP) ✅

Phase 1 established the core infrastructure and basic functionality of the Spiritual Coach application.

#### Components Implemented:

1. **Next.js & Supabase Setup**
   - Configured Next.js 15 with App Router architecture
   - Integrated Supabase as the backend database and authentication provider
   - Set up server-side and client-side Supabase clients for secure data access

2. **Authentication System**
   - Built complete authentication flow with Supabase Auth
   - Login page (`app/login/page.tsx`) for user sign-in
   - Session management across server and client components
   - Protected routes ensuring only authenticated users can access the dashboard

3. **Guru Selector (Onboarding)**
   - Interactive onboarding experience (`app/onboarding/page.tsx`)
   - GuruSelector component (`components/onboarding/GuruSelector.tsx`) allows users to select their preferred spiritual masters
   - Selected masters are stored in the `profiles` table as JSON in the `spiritual_config` column
   - Available masters include: Rumi, Marcus Aurelius, Carl Jung, Eckhart Tolle, and Jesus

4. **Chat Interface**
   - Built real-time chat interface (`components/chat/ChatWindow.tsx`) using Vercel AI SDK
   - Chat API route (`app/api/chat/route.ts`) connects to OpenAI GPT-4o
   - Streaming responses for real-time user experience
   - Integrates user's selected spiritual masters into the system prompt to create a blended persona

#### Goal Achieved:
✅ Users can chat with a personalized AI coach that embodies the wisdom and personality traits of their selected spiritual masters, creating a unique "Persona" that guides their spiritual journey.

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

### Phase 1 Flow:
1. **User Registration/Login**: Users authenticate through Supabase Auth
2. **Onboarding**: New users select their preferred spiritual masters (gurus) during onboarding
3. **Profile Storage**: Selected masters are saved as JSON in the user's profile (`spiritual_config`)
4. **Chat Session**: Users chat with an AI coach that blends the personalities and teachings of their selected masters
5. **Personalized Responses**: The system prompt dynamically incorporates the selected masters, creating a unique persona for each user

### Phase 2 Flow:
1. **Conversation**: User chats with the AI coach about life, struggles, and spiritual growth
2. **Observer Analysis**: After each conversation completes, the Observer agent automatically analyzes the exchange for deep psychological insights
3. **Memory Storage**: Insights (blockages, strengths, patterns) are saved to the `insights` table and associated with the user
4. **Context Retrieval**: In future conversations, the system fetches the user's last 5 insights before generating a response
5. **Context Injection**: The AI reads previous insights and subtly incorporates them into guidance without explicitly mentioning them, creating a continuous memory across sessions

## License

[Add your license here]

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
