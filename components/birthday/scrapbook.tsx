'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { memories } from '@/lib/birthday-data'

const stickers = ['\u{1F496}', '\u2B50', '\u{1F338}', '\u2728', '\u{1F49D}', '\u{1F337}']

const FLIP_DISTANCE = 140 // px of drag needed to commit a page flip
const FLIP_VELOCITY = 500 // px/s flick speed that also commits a flip

export function Scrapbook() {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const total = memories.length
  const containerRef = useRef<HTMLDivElement>(null)

  const dragX = useMotionValue(0)
  // Rotate the page around its left/right spine as it's dragged, like a real
  // page being peeled — direction depends on which corner is grabbed.
  const rotateY = useTransform(dragX, [-300, 0, 300], [-45, 0, 45])
  const dragOpacity = useTransform(dragX, [-300, -80, 0, 80, 300], [0.3, 1, 1, 1, 0.3])

  const goTo = (next: number) => {
    setDirection(next > page ? 1 : -1)
    setPage(((next % total) + total) % total)
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setIsDragging(false)
    const { offset, velocity } = info
    const committedByDistance = Math.abs(offset.x) > FLIP_DISTANCE
    const committedByFlick = Math.abs(velocity.x) > FLIP_VELOCITY
    if (committedByDistance || committedByFlick) {
      // Dragging left (negative offset) turns to the next page, like flipping
      // a physical page from right to left.
      goTo(offset.x < 0 ? page + 1 : page - 1)
    }
    dragX.set(0)
  }

  const memory = memories[page]

  return (
    <section aria-label="Scrapbook" className="px-4 py-20 md:py-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10">
        <div className="text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.35em] text-primary">
            Scrapbook
          </p>
          <h2 className="text-balance font-serif text-3xl font-semibold md:text-5xl">
            A book of soft things
          </h2>
          <p className="mt-3 text-muted-foreground">
            Click and hold a page, then drag to flip it.
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative w-full max-w-2xl select-none"
          style={{ perspective: '1600px' }}
        >
          {/* Spiral binding */}
          <div
            aria-hidden="true"
            className="absolute -top-3 left-0 right-0 z-20 flex justify-around px-8"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <span
                key={i}
                className="h-6 w-2.5 rounded-full border-2 border-primary/50 bg-background shadow-sm"
              />
            ))}
          </div>

          <div className="glass overflow-hidden rounded-3xl pt-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                style={{ x: dragX, rotateY, opacity: dragOpacity, transformOrigin: 'center center' }}
                initial={{ rotateY: direction * 70, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: direction * -70, opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                whileTap={{ cursor: 'grabbing' }}
                className={`grid touch-pan-y gap-6 p-6 md:grid-cols-2 md:p-10 ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                <div className="relative">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border-4 border-popover shadow-lg">
                    <Image
                      src={memory.src || '/placeholder.svg'}
                      alt={memory.caption}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      draggable={false}
                      className="pointer-events-none object-cover"
                    />
                  </div>
                  <span
                    aria-hidden="true"
                    className="absolute -right-3 -top-3 rotate-12 text-3xl drop-shadow-md"
                  >
                    {stickers[page % stickers.length]}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-2 -left-2 -rotate-12 text-2xl drop-shadow-md"
                  >
                    {stickers[(page + 3) % stickers.length]}
                  </span>
                </div>

                <div className="flex flex-col justify-center gap-4">
                  <span className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
                    Page {page + 1} of {total}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold italic text-primary md:text-3xl">
                    {memory.caption}
                  </h3>
                  <p className="text-pretty font-serif text-lg italic leading-relaxed text-card-foreground">
                    {'\u201C'}
                    {memory.quote}
                    {'\u201D'}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            className="glass rounded-full px-5 py-2.5 text-sm font-medium transition-all hover:glow-soft hover:text-primary"
          >
            {'\u2190'} Previous
          </button>
          <div className="flex gap-2">
            {memories.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === page ? 'page' : undefined}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  i === page ? 'w-6 bg-primary' : 'bg-primary/30 hover:bg-primary/60'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => goTo(page + 1)}
            className="glass rounded-full px-5 py-2.5 text-sm font-medium transition-all hover:glow-soft hover:text-primary"
          >
            Next {'\u2192'}
          </button>
        </div>
      </div>
    </section>
  )
}
