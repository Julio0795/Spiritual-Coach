'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Repeat, Calendar, X } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

interface InsightCardProps {
  title: string
  type: 'blockage' | 'strength' | 'pattern'
  observation: string
  date: string
  index?: number
  shouldAnimate?: boolean
}

// Helper function to get type-specific configuration
function getTypeConfig(type: InsightCardProps['type']): {
  icon: LucideIcon
  bg: string
  text: string
  border: string
  label: string
} {
  switch (type) {
    case 'blockage':
      return {
        icon: Shield,
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        label: 'BLOCKAGE',
      }
    case 'strength':
      return {
        icon: Zap,
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        label: 'STRENGTH',
      }
    case 'pattern':
      return {
        icon: Repeat,
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/20',
        label: 'PATTERN',
      }
  }
}

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      // If it's not a valid date, return as-is
      return dateString
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export default function InsightCard({
  title,
  type,
  observation,
  date,
  index = 0,
  shouldAnimate = true,
}: InsightCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const config = getTypeConfig(type)
  const Icon = config.icon

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('InsightCard mounted:', {
        title,
        shouldAnimate,
        isMobile,
        index,
      })
    }
  }, [title, shouldAnimate, isMobile, index])

  return (
    <>
      <motion.div
        initial={
          shouldAnimate
            ? { opacity: 0, x: isMobile ? 0 : 20, y: isMobile ? 20 : 0 }
            : { opacity: 1, x: 0, y: 0 }
        }
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={
          shouldAnimate
            ? {
                duration: 0.5,
                delay: (index || 0) * 0.1,
                ease: 'easeOut',
              }
            : { duration: 0 }
        }
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsModalOpen(true)}
        className={`relative overflow-hidden rounded-xl border ${config.border} backdrop-blur-md bg-white/5 p-4 mb-4 transition-colors hover:bg-white/10 cursor-pointer`}
      >
        {/* Decorative gradient glow */}
        <div
          className={`absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl ${config.bg.replace('/10', '')}`}
        />

        {/* Header Section */}
        <div className="flex justify-between items-start mb-3">
          {/* Badge with icon */}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}
          >
            <Icon className="w-3 h-3" />
            <span>{config.label}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(date)}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-white mt-2 mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
            {observation}
          </p>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-2xl rounded-xl border ${config.border} backdrop-blur-sm bg-slate-900/95 p-6 shadow-2xl`}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative gradient glow */}
              <div
                className={`absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-3xl ${config.bg.replace('/10', '')}`}
              />

              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4">
                {/* Badge with icon */}
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${config.bg} ${config.text} border ${config.border}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{config.label}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(date)}</span>
                </div>
              </div>

              {/* Modal Content */}
              <div className="relative z-10">
                <h2 className="text-2xl font-semibold text-white mb-4 pr-8">
                  {title}
                </h2>
                <div className="h-px bg-slate-700 mb-4" />
                <p className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {observation}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

