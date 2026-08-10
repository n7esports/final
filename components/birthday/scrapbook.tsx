'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, animate, useTransform } from 'framer-motion'
import { memories } from '@/lib/birthday-data'

const stickers = ['💖', '⭐', '🌸', '✨', '💝', '🌷']

const MAX_DRAG_PX = 260
const COMMIT_RATIO = 0.35

type Dir = 1 | -1

function PageContent({ index }: { index: number }) {
  const safeIndex = ((index % memories.length) + memories.length) % memories.length
  const memory = memories[safeIndex]
  const stickerIndex = ((index % stickers.length) + stickers.length) % stickers.length
  
  return (
    <div className="grid h-full touch-none gap-4 p-4 md:grid-cols-2 md:gap-6 md:p-8">
      <div className="relative flex items-center justify-center">
        <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl">
          <Image
            src={memory.src || '/placeholder.svg'}
            alt={memory.caption}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            draggable={false}
            className="pointer-events-none object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
        <span 
          aria-hidden="true" 
          className="absolute -right-2 -top-2 rotate-12 text-4xl drop-shadow-lg md:-right-4 md:-top-4 md:text-5xl"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
        >
          {stickers[stickerIndex]}
        </span>
        <span 
          aria-hidden="true" 
          className="absolute -bottom-2 -left-2 -rotate-12 text-3xl drop-shadow-lg md:-bottom-4 md:-left-4 md:text-4xl"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
        >
          {stickers[(stickerIndex + 3) % stickers.length]}
        </span>
      </div>

      <div className="flex flex-col justify-center gap-3 px-2 md:gap-4 md:px-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary md:px-4 md:text-sm">
            Page {safeIndex + 1} of {memories.length}
          </span>
          <div className="flex-1 border-t border-primary/10" />
        </div>
        <h3 className="font-serif text-xl font-semibold italic leading-tight text-primary md:text-3xl md:leading-snug">
          {memory.caption}
        </h3>
        <div className="relative">
          <span className="absolute -left-2 -top-4 text-4xl text-primary/20 md:-left-4 md:text-6xl">"</span>
          <p className="font-serif text-base italic leading-relaxed text-card-foreground/90 md:text-lg md:leading-relaxed">
            {memory.quote}
          </p>
          <span className="absolute -bottom-6 right-0 text-4xl text-primary/20 md:-bottom-8 md:text-6xl">"</span>
        </div>
      </div>
    </div>
  )
}

export function Scrapbook() {
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState<Dir | null>(null)
  const [dragging, setDragging] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const total = memories.length

  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const dirRef = useRef<Dir | null>(null)
  const pageRef = useRef(0)
  const animationRef = useRef<any>(null)
  
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

  const liftShadowOpacity = useTransform(liftShadow, (v) => v * 0.25)

  const settle = useCallback(
    (committed: boolean) => {
      const d = dirRef.current
      if (!d) return
      
      const target = committed ? (d === 1 ? -180 : 0) : d === 1 ? 0 : -180
      
      if (animationRef.current) {
        animationRef.current.stop()
      }
      
      setIsFlipping(true)
      animationRef.current = animate(rotateY, target, {
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
          setIsFlipping(false)
          animationRef.current = null
        },
      })
    },
    [rotateY, total],
  )

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isFlipping) return
    const target = e.target as HTMLElement
    target.setPointerCapture(e.pointerId)
    startX.current = e.clientX
    setDragging(true)
  }, [isFlipping])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || isFlipping) return
    
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
  }, [dragging, isFlipping, rotateY])

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    setDragging(false)
    
    const target = e.target as HTMLElement
    if (target.releasePointerCapture) {
      target.releasePointerCapture(e.pointerId)
    }
    
    const d = dirRef.current
    if (!d) return
    
    const current = rotateY.get()
    const progress = d === 1 ? Math.abs(current) / 180 : 1 - Math.abs(current) / 180
    settle(progress > COMMIT_RATIO)
  }, [dragging, rotateY, settle])

  const goToPage = useCallback((index: number) => {
    if (isFlipping || dirRef.current) return
    
    const targetIndex = ((index % total) + total) % total
    if (targetIndex === page) return
    
    const d: Dir = targetIndex > page ? 1 : -1
    dirRef.current = d
    setDir(d)
    rotateY.set(d === 1 ? 0 : -180)
    settle(true)
  }, [isFlipping, page, rotateY, settle, total])

  const flapIndex = dir === 1 ? page : dir === -1 ? page - 1 : page
  const underIndex = dir === 1 ? page + 1 : dir === -1 ? page : page

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToPage(page + 1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPage(page - 1)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPage, page])

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-4 py-12 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 md:py-20">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-pink-200/20 blur-3xl dark:bg-pink-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-200/10 blur-3xl dark:bg-purple-500/5" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 md:gap-12">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-2 inline-block rounded-full bg-white/50 px-6 py-2 text-sm font-medium uppercase tracking-[0.35em] text-primary backdrop-blur-sm dark:bg-white/10"
          >
            ✨ Scrapbook
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-balance font-serif text-3xl font-semibold md:text-5xl lg:text-6xl"
          >
            A book of soft things
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-2 text-sm text-muted-foreground md:mt-3 md:text-base"
          >
            {isFlipping ? '📖 Turning page...' : '👆 Drag to flip or use arrow keys'}
          </motion.p>
        </div>

        {/* Book */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          ref={containerRef}
          className="relative w-full max-w-3xl select-none"
          style={{ perspective: '1800px' }}
        >
          {/* Book spine decoration */}
          <div className="absolute -left-4 top-0 bottom-0 z-30 w-1 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 rounded-full md:-left-6" />
          
          {/* Page tabs */}
          <div className="absolute -top-4 left-0 right-0 z-30 flex justify-around px-6 md:-top-6 md:px-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-5 w-2 rounded-full border-2 border-primary/30 bg-white/80 shadow-sm backdrop-blur-sm dark:bg-gray-800/80 md:h-6 md:w-2.5"
                style={{ 
                  transform: `rotate(${i % 2 === 0 ? '2deg' : '-2deg'})`,
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-white/40 shadow-2xl backdrop-blur-sm dark:bg-gray-800/40">
            <div className="relative" style={{ aspectRatio: '4 / 5' }}>
              {/* Background page */}
              <div className="absolute inset-0 h-full min-h-[400px]">
                <PageContent index={dir ? underIndex : page} />
              </div>

              {/* Flipping page */}
              {dir !== null && (
                <motion.div
                  className="absolute inset-0 z-20 h-full cursor-grab active:cursor-grabbing"
                  style={{
                    rotateY,
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    boxShadow: 'inset 0 0 60px rgba(0,0,0,0.08)',
                  }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                >
                  <div className="h-full rounded-r-3xl bg-white/90 dark:bg-gray-800/90">
                    <PageContent index={flapIndex} />
                  </div>
                  
                  {/* Crease shadow */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/30 to-transparent"
                    style={{ opacity: creaseShadow }}
                  />
                  
                  {/* Page curl effect */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 bg-gradient-to-tl from-transparent via-white/20 to-transparent"
                    style={{ 
                      opacity: creaseShadow,
                      transform: 'rotate(45deg)',
                      transformOrigin: 'bottom right'
                    }}
                  />
                </motion.div>
              )}

              {/* Shadow overlay for lift effect */}
              {dir !== null && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-black"
                  style={{ opacity: liftShadowOpacity }}
                />
              )}

              {/* Drag overlay when not flipping */}
              {dir === null && !isFlipping && (
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

          {/* Decorative corner elements */}
          <div className="pointer-events-none absolute -top-2 -right-2 h-8 w-8 border-r-2 border-t-2 border-primary/20 rounded-tr-2xl md:-top-4 md:-right-4 md:h-12 md:w-12" />
          <div className="pointer-events-none absolute -bottom-2 -left-2 h-8 w-8 border-b-2 border-l-2 border-primary/20 rounded-bl-2xl md:-bottom-4 md:-left-4 md:h-12 md:w-12" />
        </motion.div>

        {/* Navigation dots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
        >
          {memories.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === page ? 'page' : undefined}
              className={`group relative h-3 w-3 rounded-full transition-all duration-300 md:h-3.5 md:w-3.5 ${
                i === page 
                  ? 'w-8 bg-primary shadow-lg shadow-primary/30 md:w-10' 
                  : 'bg-primary/30 hover:bg-primary/60 hover:scale-110'
              }`}
            >
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-black/80 px-2 py-0.5 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                {i + 1}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Page indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground"
        >
          <span className="font-medium text-primary">
            {((page % total) + total) % total + 1}
          </span>
          {' / '}
          {total}
        </motion.div>
      </div>
    </section>
  )
}
