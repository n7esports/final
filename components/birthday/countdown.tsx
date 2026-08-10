'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BackgroundEffects } from './BackgroundEffects'
import { CelebrationEffects } from './CelebrationEffects'

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function computeTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  }
}

function SingleDigit({ digit }: { digit: string }) {
  return (
    <div className="relative flex h-20 w-7 items-center justify-center overflow-hidden md:h-28 md:w-10">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="font-serif text-3xl font-semibold text-primary drop-shadow-[0_0_12px_rgba(255,93,162,0.4)] md:text-5xl"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

function FlipCard({ value, label }: { value: number; label: string }) {
  const digits = String(value).padStart(2, '0').split('')
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-20 px-3 items-center justify-center rounded-2xl md:h-28 md:px-5 glass glow-ring">
        {digits.map((d, i) => (
          <SingleDigit key={`${value}-${i}`} digit={d} />
        ))}
      </div>
      <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground md:text-sm">
        {label}
      </span>
    </div>
  )
}

export function Countdown({ onComplete, targetDate }: { onComplete: () => void; targetDate?: Date }) {
  // Get target date - use passed date or calculate September 15
  const getTargetDate = useCallback(() => {
    if (targetDate) return new Date(targetDate)
    
    const now = new Date()
    const currentYear = now.getFullYear()
    
    // Set to September 15 at exactly midnight
    const date = new Date(currentYear, 8, 15, 0, 0, 0, 0)
    
    // Only roll over if this year's date has passed
    if (date.getTime() < now.getTime()) {
      date.setFullYear(currentYear + 1)
    }
    
    return date
  }, [targetDate])

  const [target] = useState(getTargetDate)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | undefined>(undefined)
  const [isComplete, setIsComplete] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [confettiItems, setConfettiItems] = useState<
    { id: number; x: number; delay: number; color: string; size: number; rotate: number }[]
  >([])
  const [fireworks, setFireworks] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([])
  const completedRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // SCENE 1: Page load animations (handled by framer-motion in JSX)
  // SCENE 2: Ambient loop (background effects)
  
  // Trigger celebration sequence
  const triggerCelebration = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    
    // SCENE 4: Final second flash
    setCelebrate(true)

    // SCENE 5: Celebration explosion - confetti + fireworks
    const colors = ['#ffaad4', '#ffc8e0', '#ffd966', '#ffffff', '#f0b0ff']
    const items = Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 12,
      rotate: Math.random() * 360,
    }))
    setConfettiItems(items)

    const fw = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 60,
      delay: Math.random() * 1.5,
      size: 60 + Math.random() * 100,
    }))
    setFireworks(fw)

    // SCENE 6: Content reveal - show birthday message after 2.8s
    celebrationTimeoutRef.current = setTimeout(() => {
      setIsComplete(true)
    }, 2800)

    // SCENE 7: Idle celebration loop + call onComplete
    completeTimeoutRef.current = setTimeout(() => {
      onComplete()
    }, 4000)
  }, [onComplete])

  // Timer effect with 250ms polling
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const tick = () => {
      if (completedRef.current) return
      
      const diff = target.getTime() - Date.now()
      
      if (diff <= 0) {
        triggerCelebration()
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        return
      }
      
      setTimeLeft(computeTimeLeft(target))
    }

    tick()
    intervalRef.current = setInterval(tick, 250)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current)
        celebrationTimeoutRef.current = null
      }
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current)
        completeTimeoutRef.current = null
      }
    }
  }, [target, triggerCelebration])

  // Compute if in "last 10 seconds" for tension build (SCENE 3)
  const totalSec = (timeLeft?.days ?? 0) * 86400 + (timeLeft?.hours ?? 0) * 3600 + (timeLeft?.minutes ?? 0) * 60 + (timeLeft?.seconds ?? 0)
  const isLast10 = totalSec <= 10 && totalSec > 0
  const srText = timeLeft ? `${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds remaining` : 'Loading countdown'

  const dateStr = target.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })

  // Developer skip button (remove after testing)
  const skipToExperience = useCallback(() => {
    completedRef.current = true
    if (intervalRef.current) clearInterval(intervalRef.current)
    onComplete()
  }, [onComplete])

  if (timeLeft === undefined) {
    return null // Still loading, don't render until we have time
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {srText}
      </span>

      {/* Background Effects (SCENE 1 & 2: Entry + Ambient) */}
      <BackgroundEffects celebrate={celebrate} />

      {/* Celebration Effects (SCENE 4 & 5) */}
      <CelebrationEffects fireworks={fireworks} confettiItems={confettiItems} />

      {/* Content Canvas */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-4 py-8">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key="countdown-interface"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center justify-center gap-8 w-full"
            >
              {/* SCENE 1: Hero intro (fade up) */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
                className="text-center"
              >
                <p className="text-sm uppercase tracking-[0.4em] text-primary mb-3">{dateStr}</p>
                <h1 className="font-serif text-4xl md:text-6xl font-semibold text-foreground drop-shadow-lg leading-tight">
                  Something magical <br className="sm:hidden" />
                  <span className="text-primary">is coming</span>
                  <br className="hidden sm:block" />
                  <span className="text-primary">for Arfa</span>
                </h1>
              </motion.div>

              {/* SCENE 2: Countdown card (glass morphism + pulse) */}
              <motion.div
                className="glass-strong glow-pulse rounded-3xl px-6 py-8 md:px-12 md:py-10 flex items-center gap-2 md:gap-4 flex-wrap justify-center"
               initial={{ scale: 0.9, opacity: 0 }}
                // SCENE 3: Last 10 seconds tension build (scale pulse + brightness)
                animate={isLast10 ? { scale: [1, 1.05, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
                transition={
                  isLast10
                    ? { duration: 0.5, repeat: Infinity }
                    : { delay: 0.4, duration: 1, ease: 'easeOut' }
                }
              >
                <FlipCard value={timeLeft.days} label="Days" />
                <span className="pb-6 font-serif text-2xl text-muted-foreground/60">:</span>
                <FlipCard value={timeLeft.hours} label="Hours" />
                <span className="pb-6 font-serif text-2xl text-muted-foreground/60">:</span>
                <FlipCard value={timeLeft.minutes} label="Minutes" />
                <span className="pb-6 font-serif text-2xl text-muted-foreground/60">:</span>
                <FlipCard value={timeLeft.seconds} label="Seconds" />
              </motion.div>

              {/* Developer Skip Button (remove after testing/deployment) */}
              <motion.button
                onClick={skipToExperience}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.5 }}
                whileHover={{ opacity: 1, scale: 1.02 }}
                transition={{ delay: 1 }}
                className="mt-6 px-4 py-2 text-xs bg-muted/50 hover:bg-muted rounded-full border border-border/50 text-muted-foreground hover:text-foreground transition-all"
              >
                [DEV] Skip to Experience
              </motion.button>
            </motion.div>
          ) : (
            // SCENE 6: Birthday message reveal
            <motion.div
              key="birthday-interface"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center"
            >
              <motion.div
                animate={{
                  textShadow: [
                    '0 0 20px rgba(255,106,170,0.4)',
                    '0 0 60px rgba(255,106,170,0.8)',
                    '0 0 20px rgba(255,106,170,0.4)',
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <h1 className="font-serif text-5xl md:text-7xl font-semibold text-primary drop-shadow-lg">
                  Happy Birthday
                  <br className="sm:hidden" />
                  <span className="block"> Arfa 💖</span>
                </h1>
                <p className="mt-6 text-lg text-foreground/80 tracking-widest">The day is finally here ✨</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
