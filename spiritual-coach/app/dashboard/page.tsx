import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

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
    <DashboardClient
      initialInsights={insights || []}
      signOutAction={signOut}
    />
  )
}

