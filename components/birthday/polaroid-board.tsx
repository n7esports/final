'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { memories } from '@/lib/birthday-data'

const rotations = [-6, 4, -3, 7, -8, 5]

export function PolaroidBoard() {
  const boardRef = useRef<HTMLDivElement>(null)
  const inView = useInView(boardRef, { once: true, margin: '-100px' })

  return (
    <section aria-label="Polaroid memory board" className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.35em] text-primary">
            Memory Board
          </p>
          <h2 className="text-balance font-serif text-3xl font-semibold md:text-5xl">
            Little moments, pinned forever
          </h2>
          <p className="mt-3 text-muted-foreground">
            Go on &mdash; drag them around. They like being played with.
          </p>
        </div>

        <div
          ref={boardRef}
          className="glass relative h-[520px] overflow-hidden rounded-3xl md:h-[600px]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'radial-gradient(circle, var(--color-primary) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {memories.map((memory, i) => (
            <motion.div
              key={memory.src}
              drag
              dragConstraints={boardRef}
              dragElastic={0.15}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
              whileDrag={{ scale: 1.08, zIndex: 30, cursor: 'grabbing' }}
              whileHover={{ scale: 1.04, zIndex: 20 }}
              initial={{ opacity: 0, y: 60, rotate: 0 }}
              animate={
                inView
                  ? { opacity: 1, y: 0, rotate: rotations[i % rotations.length] }
                  : undefined
              }
              transition={{
                delay: i * 0.12,
                type: 'spring',
                stiffness: 180,
                damping: 20,
              }}
              className="absolute w-36 cursor-grab rounded-lg bg-popover p-2 pb-8 shadow-xl md:w-48 md:p-3 md:pb-12"
              style={{
                left: `${8 + (i % 3) * 28}%`,
                top: `${6 + Math.floor(i / 3) * 42}%`,
              }}
            >
              <span
                aria-hidden="true"
                className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-md"
              />
              <div className="relative aspect-square overflow-hidden rounded-sm">
                <Image
                  src={memory.src || '/placeholder.svg'}
                  alt={memory.caption}
                  fill
                  sizes="(max-width: 768px) 144px, 192px"
                  className="pointer-events-none object-cover"
                />
              </div>
              <p className="mt-2 text-center font-serif text-xs italic text-popover-foreground md:text-sm">
                {memory.caption}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
