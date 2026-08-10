'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, animate, useTransform } from 'framer-motion'
import { memories } from '@/lib/birthday-data'

const stickers = ['\u{1F496}', '\u2B50', '\u{1F338}', '\u2728', '\u{1F49D}', '\u{1F337}']

const MAX_DRAG_PX = 260 // px of horizontal drag mapped to a full 0->180deg turn
const COMMIT_RATIO = 0.35 // release past this fraction of the turn -> commit the page change

type Dir = 1 | -1 // 1 = turning forward (next), -1 = turning backward (previous)

function PageContent({ index }: { index: number }) {
  const memory = memories[((index % memories.length) + memories.length) % memories.length]
  return (
    <div className="grid h-full touch-none gap-6 p-6 md:grid-cols-2 md:p-10">
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
        <span aria-hidden="true" className="absolute -right-3 -top-3 rotate-12 text-3xl drop-shadow-md">
          {stickers[index % stickers.length]}
        </span>
        <span aria-hidden="true" className="absolute -bottom-2 -left-2 -rotate-12 text-2xl drop-shadow-md">
          {stickers[(index + 3) % stickers.length]}
        </span>
      </div>

      <div className="flex flex-col justify-center gap-4">
        <span className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          Page {(((index % memories.length) + memories.length) % memories.length) + 1} of {memories.length}
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
    </div>
  )
}

export function Scrapbook() {
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState<Dir | null>(null)
  const [dragging, setDragging] = useState(false)
  const total = memories.length

  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const dirRef = useRef<Dir | null>(null)
  const pageRef = useRef(0)
  pageRef.current = page

  const rotateY = useMotionValue(0)

  const creaseShadow = useTransform(rotateY, (v) => {
    const angle = Math.abs(v)
    const t = Math.min(angle, 90) / 90
    return Math.sin(t * Math.PI) * 0.55
  })
  const liftShadow = useTransform(rotateY, (v) => {
    const angle = Math.abs(v)
    const t = Math.min(angle, 180) / 180
    return 0.15 + Math.sin(t * Math.PI) * 0.35
  })

  const settle = useCallback(
    (committed: boolean) => {
      const d = dirRef.current
      if (!d) return
      const target = committed ? (d === 1 ? -180 : 0) : d === 1 ? 0 : -180
      animate(rotateY, target, {
        type: 'spring',
        stiffness: 260,
        damping: 28,
        onComplete: () => {
          if (committed) {
            setPage((p) => (((p + d) % total) + total) % total)
          }
          dirRef.current = null
          setDir(null)
          rotateY.set(0)
        },
      })
    },
    [rotateY, total],
  )

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    startX.current = e.clientX
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const delta = e.clientX - startX.current

    if (dirRef.current === null) {
      if (Math.abs(delta) < 6) return
      const d: Dir = delta < 0 ? 1 : -1
      dirRef.current = d
      setDir(d)
      rotateY.set(d === 1 ? 0 : -180)
    }

    const d = dirRef.current
    const raw = Math.min(Math.abs(delta), MAX_DRAG_PX) / MAX_DRAG_PX
    rotateY.set(d === 1 ? -180 * raw : -180 * (1 - raw))
  }

  const endDrag = () => {
    if (!dragging) return
    setDragging(false)
    const d = dirRef.current
    if (!d) return
    const current = rotateY.get()
    const progress = d === 1 ? Math.abs(current) / 180 : 1 - Math.abs(current) / 180
    settle(progress > COMMIT_RATIO)
  }

  const flipTo = (target: Dir) => {
    if (dirRef.current) return
    dirRef.current = target
    setDir(target)
    rotateY.set(target === 1 ? 0 : -180)
    settle(true)
  }

  const goTo = (index: number) => {
    if (dirRef.current) return
    const d: Dir = index > page ? 1 : -1
    if (((index % total) + total) % total === page) return
    flipTo(d)
  }

  const flapIndex = dir === 1 ? page : dir === -1 ? page - 1 : page
  const underIndex = dir === 1 ? page + 1 : dir === -1 ? page : page

  return (
    <section aria-label="Scrapbook" className="px-4 py-20 md:py-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10">
        <div className="text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.35em] text-primary">Scrapbook</p>
          <h2 className="text-balance font-serif text-3xl font-semibold md:text-5xl">
            A book of soft things
          </h2>
          <p className="mt-3 text-muted-foreground">Grab a page and drag to flip it.</p>
        </div>

        <div
          ref={containerRef}
          className="relative w-full max-w-2xl select-none"
          style={{ perspective: '1800px' }}
        >
          <div aria-hidden="true" className="absolute -top-3 left-0 right-0 z-30 flex justify-around px-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="h-6 w-2.5 rounded-full border-2 border-primary/50 bg-background shadow-sm" />
            ))}
          </div>

          <div className="glass relative overflow-hidden rounded-3xl pt-6">
            <div className="relative" style={{ aspectRatio: '4 / 5' }}>
              <div className="absolute inset-0 h-full min-h-[420px]">
                <PageContent index={dir ? underIndex : page} />
              </div>

              {dir !== null && (
                <motion.div
                  className="absolute inset-0 z-20 h-full cursor-grab active:cursor-grabbing"
                  style={{
                    rotateY,
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    boxShadow: 'inset 0 0 60px rgba(0,0,0,0.15)',
                  }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                >
                  <div className="h-full bg-popover">
                    <PageContent index={flapIndex} />
                  </div>
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/40 to-transparent"
                    style={{ opacity: creaseShadow }}
                  />
                </motion.div>
              )}

              {dir !== null && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 bg-black"
                  style={{ opacity: useTransform(liftShadow, (v) => v * 0.25) }}
                />
              )}

              {dir === null && (
                <div
                  className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => flipTo(-1)}
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
            onClick={() => flipTo(1)}
            className="glass rounded-full px-5 py-2.5 text-sm font-medium transition-all hover:glow-soft hover:text-primary"
          >
            Next {'\u2192'}
          </button>
        </div>
      </div>
    </section>
  )
}
