'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { memories } from '@/lib/birthday-data'

export function Hero() {
  const ribbonImages = [...memories, ...memories]

  return (
    <header className="flex flex-col items-center gap-14 overflow-hidden pt-24 pb-16 md:pt-32">
      <div className="flex flex-col items-center gap-4 px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-sm uppercase tracking-[0.35em] text-primary"
        >
          September 15
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.9 }}
          className="text-balance font-serif text-5xl font-semibold leading-tight md:text-8xl"
        >
          Happy Birthday
          <span className="block italic text-primary">Arfa {'\u{1F495}'}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9 }}
          className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground"
        >
          A little corner of the internet, made just for you. Scroll slowly
          &mdash; every part of this page is a piece of how loved you are.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="relative w-full"
        aria-label="Photo ribbon carousel"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent md:w-32" />
        <div className="animate-ribbon flex w-max gap-6 px-6">
          {ribbonImages.map((memory, i) => (
            <div
              key={i}
              className="group relative h-52 w-40 shrink-0 overflow-hidden rounded-2xl border border-border shadow-md transition-all duration-500 hover:glow-soft md:h-72 md:w-56"
              style={{ rotate: `${(i % 2 === 0 ? -1 : 1) * 2}deg` }}
            >
              <Image
                src={memory.src || '/placeholder.svg'}
                alt={memory.caption}
                fill
                sizes="(max-width: 768px) 160px, 224px"
                className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <p className="text-sm font-medium text-white">{memory.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </header>
  )
}
