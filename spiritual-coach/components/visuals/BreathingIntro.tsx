'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BreathingIntroProps {
  onComplete: () => void
}

export default function BreathingIntro({ onComplete }: BreathingIntroProps) {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale')
  const [text, setText] = useState<string>('Breathe In...')
  const [cycles, setCycles] = useState<number>(0)
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const isCompletingRef = useRef(false)

  const handleComplete = useCallback(() => {
    isCompletingRef.current = true
    setIsVisible(false)
    // Wait 500ms for exit animation before calling onComplete
    setTimeout(() => {
      onComplete()
    }, 500)
  }, [onComplete])

  // Animation Logic (The Breath)
  useEffect(() => {
    // Don't continue if component is completing
    if (isCompletingRef.current) return

    // Cleanup function to clear timeout if component unmounts
    let timeoutId: NodeJS.Timeout | null = null

    // Cycle logic
    const breathCycle = () => {
      if (isCompletingRef.current) return

      if (phase === 'inhale') {
        // Switch to exhale after 4s
        timeoutId = setTimeout(() => {
          if (!isCompletingRef.current) {
            setPhase('exhale')
            setText('Breathe Out...')
          }
        }, 4000)
      } else {
        // Switch to inhale after 4s and increment cycle
        timeoutId = setTimeout(() => {
          if (!isCompletingRef.current) {
            setPhase('inhale')
            setText('Breathe In...')
            setCycles((prev) => {
              const newCycles = prev + 1
              // Check if 3 cycles completed
              if (newCycles >= 3) {
                handleComplete()
              }
              return newCycles
            })
          }
        }, 4000)
      }
    }

    // Start the cycle
    breathCycle()

    // Cleanup: Clear timeout on unmount or phase change
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
      }
    }
  }, [phase, handleComplete])

  // Animation values based on phase
  const circleScale = phase === 'inhale' ? 1.5 : 1
  const circleOpacity = phase === 'inhale' ? 1 : 0.8

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950"
        >
          {/* Breathing Circle */}
          <motion.div
            animate={{
              scale: circleScale,
              opacity: circleOpacity,
            }}
            transition={{
              duration: 4,
              ease: 'easeInOut',
            }}
            className="w-64 h-64 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.1)] backdrop-blur-md flex items-center justify-center"
          >
            {/* Text (Inside Circle) */}
            <AnimatePresence mode="wait">
              <motion.span
                key={text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white text-xl font-light tracking-widest uppercase"
              >
                {text}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Skip Button */}
          <button
            onClick={handleComplete}
            className="absolute bottom-10 text-slate-500 hover:text-white text-sm transition-colors"
          >
            I am Ready
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

