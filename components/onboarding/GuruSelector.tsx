'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { SPIRITUAL_MASTERS } from '@/lib/constants'
import { updateSpiritualConfig } from '@/app/actions/profile'

export default function GuruSelector() {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      // Remove if already selected
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      // Add only if less than 3 are selected
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id])
      }
    }
  }

  const handleSubmit = async () => {
    if (selectedIds.length === 0 || isLoading) return

    setIsLoading(true)

    try {
      const result = await updateSpiritualConfig(selectedIds)

      if (result.success) {
        router.push('/dashboard')
      } else {
        console.error('Failed to update spiritual config:', result.error)
        alert(result.error || 'Failed to save your selection. Please try again.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error updating spiritual config:', error)
      alert('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Choose Your Spiritual Guides
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Select up to 3 masters whose wisdom resonates with you
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPIRITUAL_MASTERS.map((master) => {
            const isSelected = selectedIds.includes(master.id)
            const isDisabled = !isSelected && selectedIds.length >= 3

            return (
              <motion.div
                key={master.id}
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  bg-slate-800 p-6 rounded-xl cursor-pointer transition-all border-2
                  ${
                    isSelected
                      ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-slate-700'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !isDisabled && toggleSelection(master.id)}
                role="checkbox"
                aria-pressed={isSelected}
                aria-disabled={isDisabled}
                tabIndex={isDisabled ? -1 : 0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                    e.preventDefault()
                    toggleSelection(master.id)
                  }
                }}
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  {master.name}
                </h3>
                <p className="text-sm text-slate-400 mb-3">
                  {master.tradition}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {master.description}
                </p>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 text-amber-500 font-semibold text-sm"
                  >
                    ✓ Selected
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="text-white">
            <span className="font-semibold">Selected {selectedIds.length}/3</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || isLoading}
            className={`
              bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-8 rounded-full
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all flex items-center gap-2
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Aligning Spirit...</span>
              </>
            ) : (
              'Begin Journey'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

