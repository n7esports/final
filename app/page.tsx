'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Countdown } from '@/components/birthday/countdown'
import { Celebration } from '@/components/birthday/celebration'
import { Hero } from '@/components/birthday/hero'
import { PolaroidBoard } from '@/components/birthday/polaroid-board'
import { Scrapbook } from '@/components/birthday/scrapbook'
import { GalaxyGallery } from '@/components/birthday/galaxy-gallery'
import { FloatingHearts } from '@/components/birthday/floating-hearts'
import { ThemeToggle } from '@/components/birthday/theme-toggle'

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
            >
              <Hero />
              <PolaroidBoard />
              <Scrapbook />
              <GalaxyGallery />

              <footer className="flex flex-col items-center gap-3 px-4 pb-16 pt-8 text-center">
                <p className="font-serif text-2xl italic text-primary md:text-3xl">
                  Happy Birthday, Arfa
                </p>
                <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                  May this year be as soft, bright, and beautiful as you make
                  everything around you. September 15 will always be a little
                  more magical because of you.
                </p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
