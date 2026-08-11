'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Countdown } from '@/components/birthday/countdown'
import { Celebration } from '@/components/birthday/celebration'
import { Hero } from '@/components/birthday/hero'
import { PolaroidBoard } from '@/components/birthday/polaroid-board'
import { GalaxyGallery } from '@/components/birthday/galaxy-gallery'
import { FloatingHearts } from '@/components/birthday/floating-hearts'
import { ThemeToggle } from '@/components/birthday/theme-toggle'
import CakeScene from "@/components/birthday/cake-scene/CakeScene"

export default function Home() {
  return <CakeScene />
}

type Phase = 'countdown' | 'celebration' | 'experience'

export default function BirthdayPage() {
  const [phase, setPhase] = useState<Phase>('countdown')

  const toCelebration = useCallback(() => setPhase('celebration'), [])
  const toExperience = useCallback(() => setPhase('experience'), [])

  // Target is September 15, computed fresh from the visitor's current date.
  const now = new Date()
  const BIRTHDAY_DATE = new Date(now.getFullYear(), 8, 15, 0, 0, 0, 0)
  if (BIRTHDAY_DATE.getTime() < now.getTime()) {
    BIRTHDAY_DATE.setFullYear(BIRTHDAY_DATE.getFullYear() + 1)
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-pink-100/60 via-background to-purple-100/50 dark:from-pink-950/30 dark:via-background dark:to-purple-950/30">
      <FloatingHearts />
      <ThemeToggle />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {phase === 'countdown' && (
            <Countdown 
              key="countdown" 
              onComplete={toCelebration} 
              targetDate={BIRTHDAY_DATE}
            />
          )}
          {phase === 'celebration' && (
            <Celebration key="celebration" onComplete={toExperience} />
          )}
          {phase === 'experience' && (
            <motion.div
              key="experience"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="space-y-20 md:space-y-32"
            >
              <Hero />
              <PolaroidBoard />
              
              {/* Birthday Scene - Full height with reduced padding */}
              <div className="relative -mx-4 md:-mx-8">
                <BirthdayScene />
              </div>
              
              <GalaxyGallery />

              <footer className="flex flex-col items-center gap-3 px-4 pb-16 pt-8 text-center">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="font-serif text-2xl italic text-primary md:text-3xl"
                >
                  Happy Birthday, Arfa ✨
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground md:text-base"
                >
                  May this year be as soft, bright, and beautiful as you make
                  everything around you. September 15 will always be a little
                  more magical because of you. 🎂
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-4 flex gap-2 text-2xl"
                >
                  <span>💖</span>
                  <span>✨</span>
                  <span>🎉</span>
                  <span>🌟</span>
                  <span>💝</span>
                </motion.div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
