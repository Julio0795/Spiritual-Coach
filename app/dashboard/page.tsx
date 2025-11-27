import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChatWindow from '@/components/chat/ChatWindow'

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

      {/* Chat Window */}
      <div className="flex-1 w-full max-w-4xl mx-auto flex items-center justify-center">
        <ChatWindow />
      </div>
    </div>
  )
}

