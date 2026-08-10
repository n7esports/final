'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { motion } from 'framer-motion'

const CONFETTI_COLORS = ['#FF69B4', '#FFB6C1', '#C9A0DC', '#E6C15A', '#FFF0F5']

function fireConfetti() {
  const end = Date.now() + 2500

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.7 },
      colors: CONFETTI_COLORS,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.7 },
      colors: CONFETTI_COLORS,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }

  confetti({
    particleCount: 140,
    spread: 100,
    origin: { y: 0.6 },
    colors: CONFETTI_COLORS,
  })
  frame()
}

const title = 'Happy Birthday Arfa'

export function Celebration({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    fireConfetti()
    const id = setTimeout(onComplete, 4200)
    return () => clearTimeout(id)
  }, [onComplete])

  return (
    <motion.section
      aria-label="Birthday celebration"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        aria-hidden="true"
        className="text-6xl md:text-7xl"
      >
        {'\u{1F496}'}
      </motion.div>

      <h1 className="flex flex-wrap items-center justify-center gap-x-4 text-balance font-serif text-5xl font-semibold md:text-7xl">
        {title.split(' ').map((word, wi) => (
          <span key={wi} className="inline-flex">
            {word.split('').map((char, ci) => (
              <motion.span
                key={ci}
                initial={{ y: 40, opacity: 0, rotate: -6 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{
                  delay: 0.4 + (wi * 6 + ci) * 0.05,
                  type: 'spring',
                  stiffness: 260,
                  damping: 18,
                }}
                className={wi === 2 ? 'text-primary' : undefined}
              >
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="max-w-md text-pretty text-lg text-muted-foreground"
      >
        Today the whole sky turns pink for you.
      </motion.p>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            style={{ left: `${8 + i * 9}%` }}
            initial={{ y: '110vh', opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, 0.8, 0.8, 0] }}
            transition={{
              duration: 5 + (i % 3),
              delay: i * 0.3,
              ease: 'linear',
            }}
          >
            {i % 2 === 0 ? '\u{1F496}' : '\u2728'}
          </motion.span>
        ))}
      </motion.div>
    </motion.section>
  )
}
