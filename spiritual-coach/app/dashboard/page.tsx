import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatWindow from '@/components/chat/ChatWindow'
import InsightCard from '@/components/dashboard/InsightCard'

async function signOut() {
  'use server'

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user insights
  const { data: insights } = await supabase
    .from('insights')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white p-4 md:p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sanctuary</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition-colors"
          >
            Log Out
          </button>
        </form>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        {/* Chat Window - Left Side */}
        <div className="lg:col-span-3 flex items-center justify-center">
          <ChatWindow />
        </div>

        {/* Awareness Log - Right Sidebar */}
        <div className="lg:col-span-1 bg-slate-900/50 border border-slate-800 rounded-xl p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Awareness Log
          </h2>

          {/* Insights List */}
          {!insights || insights.length === 0 ? (
            <p className="text-slate-600 italic text-sm">
              Your patterns will appear here as we talk.
            </p>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  title={insight.title}
                  type={insight.type as 'blockage' | 'strength' | 'pattern'}
                  observation={insight.observation}
                  date={insight.created_at}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

