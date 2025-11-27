'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import ChatWindow from '@/components/chat/ChatWindow'
import InsightCard from '@/components/dashboard/InsightCard'
import BreathingIntro from '@/components/visuals/BreathingIntro'

interface Insight {
  id: string
  title: string
  type: 'blockage' | 'strength' | 'pattern'
  observation: string
  created_at: string
}

interface DashboardClientProps {
  initialInsights: Insight[]
  signOutAction: () => Promise<void>
}

export default function DashboardClient({
  initialInsights,
  signOutAction,
}: DashboardClientProps) {
  const [showIntro, setShowIntro] = useState(true)
  const [insights, setInsights] = useState<Insight[]>(initialInsights)
  const [seenInsightIds, setSeenInsightIds] = useState<Set<string>>(new Set())
  const [hasAnimatedInitial, setHasAnimatedInitial] = useState(false)
  const insightsRef = useRef<Insight[]>(initialInsights)

  // Mark initial insights as seen after they animate
  useEffect(() => {
    if (!showIntro && !hasAnimatedInitial && initialInsights.length > 0) {
      // Wait for animations to complete (0.5s duration + stagger delays)
      const timer = setTimeout(() => {
        setSeenInsightIds(new Set(initialInsights.map((i) => i.id)))
        setHasAnimatedInitial(true)
      }, initialInsights.length * 100 + 600) // stagger time + animation duration
      return () => clearTimeout(timer)
    }
  }, [showIntro, hasAnimatedInitial, initialInsights])

  // Update ref when insights change
  useEffect(() => {
    insightsRef.current = insights
  }, [insights])

  // Fetch and subscribe to real-time insights updates
  useEffect(() => {
    if (showIntro) return

    const supabase = createClient()
    let pollInterval: NodeJS.Timeout | null = null

    // Fetch current insights and check for new ones
    const fetchInsights = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: currentInsights, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && currentInsights) {
        const currentIds = new Set(insightsRef.current.map((i) => i.id))
        const newInsights = currentInsights.filter((i) => !currentIds.has(i.id))
        
        if (newInsights.length > 0) {
          console.log('New insights detected via polling:', newInsights.length)
          // Add new insights to the beginning
          setInsights((prev) => {
            const existingIds = new Set(prev.map((i) => i.id))
            const trulyNew = newInsights.filter((i) => !existingIds.has(i.id))
            if (trulyNew.length > 0) {
              console.log('Adding new insights:', trulyNew.map((i) => i.title))
              return [...trulyNew, ...prev]
            }
            return prev
          })
          
          // Mark as seen after animation
          setTimeout(() => {
            setSeenInsightIds((prev) => {
              const updated = new Set(prev)
              newInsights.forEach((insight) => updated.add(insight.id))
              return updated
            })
          }, 1000)
        }
      }
    }

    // Subscribe to real-time changes
    const channel = supabase
      .channel('insights-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'insights',
        },
        async (payload) => {
          console.log('Real-time event received:', payload)
          const newInsight = payload.new as Insight
          
          // Get current user to verify the insight belongs to them
          const {
            data: { user },
          } = await supabase.auth.getUser()
          
          if (user && newInsight.user_id === user.id) {
            console.log('New insight detected via real-time:', newInsight)
            // Add new insight at the beginning of the list
            setInsights((prev) => {
              // Check if this insight is already in the list
              const exists = prev.some((i) => i.id === newInsight.id)
              if (exists) {
                console.log('Insight already exists, skipping')
                return prev
              }
              console.log('Adding new insight to list:', newInsight.title)
              return [newInsight, ...prev]
            })
            
            // Don't mark as seen immediately - let it animate first
            setTimeout(() => {
              setSeenInsightIds((prev) => new Set([...prev, newInsight.id]))
            }, 1000) // After animation duration + stagger
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time insights')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error')
        }
      })

    // Fallback: Poll for new insights every 3 seconds (in case real-time doesn't work)
    pollInterval = setInterval(() => {
      fetchInsights()
    }, 3000)

    // Initial fetch after a short delay
    setTimeout(() => {
      fetchInsights()
    }, 1000)

    return () => {
      if (pollInterval) clearInterval(pollInterval)
      supabase.removeChannel(channel)
    }
  }, [showIntro])

  // Show BreathingIntro on initial load
  if (showIntro) {
    return (
      <BreathingIntro
        onComplete={() => {
          setShowIntro(false)
        }}
      />
    )
  }

  // Main Dashboard Layout
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[100dvh] flex flex-col bg-slate-950 text-white overflow-hidden"
    >
      {/* Header Section */}
      <div className="flex-shrink-0 flex justify-between items-center p-4 md:p-6 border-b border-slate-800">
        <h1 className="text-2xl md:text-3xl font-bold">Sanctuary</h1>
        <form action={signOutAction}>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 px-3 py-2 md:px-4 md:py-2 rounded text-xs md:text-sm transition-colors"
          >
            Log Out
          </button>
        </form>
      </div>

      {/* Main Content Area - Flex Row on Desktop, Column on Mobile */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Area 1: Chat (Primary) */}
        <div className="flex-1 order-1 md:order-1 h-[60vh] md:h-auto relative overflow-hidden">
          <div className="h-full flex items-center justify-center p-4 md:p-8">
            <ChatWindow />
          </div>
        </div>

        {/* Area 2: Insights (Sidebar) */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/30 order-2 md:order-2 overflow-y-auto h-[40vh] md:h-auto p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4 text-white sticky top-0 bg-slate-900/30 pb-2 z-10">
            Awareness Log
          </h2>

          {/* Insights List */}
          {!insights || insights.length === 0 ? (
            <p className="text-slate-600 italic text-sm">
              Your patterns will appear here as we talk.
            </p>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const isNew = !seenInsightIds.has(insight.id)
                // Debug logging
                if (process.env.NODE_ENV === 'development') {
                  console.log('InsightCard render:', {
                    id: insight.id,
                    isNew,
                    seenIds: Array.from(seenInsightIds),
                    index,
                  })
                }
                return (
                  <InsightCard
                    key={insight.id}
                    title={insight.title}
                    type={insight.type}
                    observation={insight.observation}
                    date={insight.created_at}
                    index={isNew ? 0 : index} // New insights always get index 0 for immediate animation
                    shouldAnimate={isNew}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

