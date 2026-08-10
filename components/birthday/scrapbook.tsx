'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, animate, useTransform } from 'framer-motion'
import { memories } from '@/lib/birthday-data'

const MAX_DRAG_PX = 260
const COMMIT_RATIO = 0.35

type Dir = 1 | -1

function PageContent({ index, isFlipping = false }: { index: number; isFlipping?: boolean }) {
  const safeIndex = ((index % memories.length) + memories.length) % memories.length
  const memory = memories[safeIndex]
  
  return (
    <div className={`grid h-full touch-none gap-2 p-2 md:grid-cols-2 md:gap-3 md:p-4 ${isFlipping ? 'pointer-events-none' : ''}`}>
      <div className="relative flex items-center justify-center">
        <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-xl border border-white/20 shadow-lg md:max-w-sm md:rounded-2xl">
          <Image
            src={memory.src || '/placeholder.svg'}
            alt={memory.caption}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            draggable={false}
            className="pointer-events-none object-cover"
            priority
          />
          {/* Star overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(255,215,0,0.1) 0%, transparent 50%)'
          }} />
          
          {/* Decorative stars on image */}
          <div className="absolute top-2 right-2 text-yellow-300/30 text-xl md:top-3 md:right-3 md:text-2xl">✦</div>
          <div className="absolute bottom-2 left-2 text-yellow-300/20 text-base md:bottom-3 md:left-3 md:text-xl">✦</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-300/10 text-4xl md:text-5xl">✦</div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-1 px-1 md:gap-2 md:px-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-medium uppercase tracking-wider text-primary md:px-2.5 md:py-0.5 md:text-[10px]">
            Page {safeIndex + 1} of {memories.length}
          </span>
          <div className="flex-1 border-t border-primary/10" />
        </div>
        <h3 className="font-serif text-sm font-semibold italic leading-tight text-primary md:text-xl md:leading-snug">
          {memory.caption}
        </h3>
        <div className="relative">
          <span className="absolute -left-1 -top-2 text-xl text-primary/20 md:-left-2 md:-top-3 md:text-3xl">"</span>
          <p className="font-serif text-xs italic leading-relaxed text-card-foreground/90 md:text-sm md:leading-relaxed">
            {memory.quote}
          </p>
          <span className="absolute -bottom-3 right-0 text-xl text-primary/20 md:-bottom-4 md:text-3xl">"</span>
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
  const animationRef = useRef<any>(null)
  
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

  const completeFlip = useCallback((direction: Dir, targetPage: number) => {
    // Stop any ongoing animation
    if (animationRef.current) {
      animationRef.current.stop()
      animationRef.current = null
    }

    setIsFlipping(true)
    
    const targetRotation = direction === 1 ? -180 : 0
    
    animationRef.current = animate(rotateY, targetRotation, {
      type: 'spring',
      stiffness: 350,
      damping: 32,
      onComplete: () => {
        setPage(targetPage)
        dirRef.current = null
        setDir(null)
        rotateY.set(0)
        setIsFlipping(false)
        animationRef.current = null
      },
    })
  }, [rotateY])

  const settle = useCallback((committed: boolean) => {
    const d = dirRef.current
    if (!d) return
    
    const currentPage = page
    const targetPage = committed ? currentPage + d : currentPage
    const wrappedTarget = ((targetPage % total) + total) % total
    
    if (committed) {
      completeFlip(d, wrappedTarget)
    } else {
      // Cancel the flip - go back
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
      
      setIsFlipping(true)
      const startRotation = d === 1 ? 0 : -180
      
      animationRef.current = animate(rotateY, startRotation, {
        type: 'spring',
        stiffness: 350,
        damping: 32,
        onComplete: () => {
          dirRef.current = null
          setDir(null)
          rotateY.set(0)
          setIsFlipping(false)
          animationRef.current = null
        },
      })
    }
  }, [page, rotateY, total, completeFlip])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isFlipping) return
    
    // Reset any stuck state
    if (dirRef.current) {
      dirRef.current = null
      setDir(null)
      rotateY.set(0)
    }
    
    const target = e.target as HTMLElement
    target.setPointerCapture(e.pointerId)
    startX.current = e.clientX
    setDragging(true)
  }, [isFlipping, rotateY])

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
    const newRotation = d === 1 ? -180 * raw : -180 * (1 - raw)
    rotateY.set(newRotation)
  }, [dragging, isFlipping, rotateY])

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    setDragging(false)
    
    const target = e.target as HTMLElement
    if (target.releasePointerCapture) {
      target.releasePointerCapture(e.pointerId)
    }
    
    const d = dirRef.current
    if (!d) {
      // Reset if no direction
      rotateY.set(0)
      return
    }
    
    const current = rotateY.get()
    const progress = d === 1 ? Math.abs(current) / 180 : 1 - Math.abs(current) / 180
    settle(progress > COMMIT_RATIO)
  }, [dragging, rotateY, settle])

  const goToPage = useCallback((targetIndex: number) => {
    if (isFlipping || dirRef.current) return
    
    const safeTarget = ((targetIndex % total) + total) % total
    if (safeTarget === page) return
    
    const direction: Dir = safeTarget > page ? 1 : -1
    completeFlip(direction, safeTarget)
  }, [isFlipping, page, total, completeFlip])

  const flapIndex = dir === 1 ? page : dir === -1 ? page - 1 : page
  const underIndex = dir === 1 ? page + 1 : dir === -1 ? page : page

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isFlipping && !dirRef.current) {
        e.preventDefault()
        const nextPage = ((page + 1) % total + total) % total
        completeFlip(1, nextPage)
      } else if (e.key === 'ArrowLeft' && !isFlipping && !dirRef.current) {
        e.preventDefault()
        const prevPage = ((page - 1) % total + total) % total
        completeFlip(-1, prevPage)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [completeFlip, isFlipping, page, total])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop()
        animationRef.current = null
      }
    }
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-2 py-4 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 md:px-3 md:py-8">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-pink-200/20 blur-3xl dark:bg-pink-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-200/10 blur-3xl dark:bg-purple-500/5" />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-3 md:gap-5">
        {/* Header - Reduced size */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-0.5 inline-block rounded-full bg-white/50 px-3 py-0.5 text-[10px] font-medium uppercase tracking-[0.3em] text-primary backdrop-blur-sm dark:bg-white/10 md:px-4 md:py-1 md:text-xs"
          >
            ✨ Scrapbook
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-balance font-serif text-xl font-semibold md:text-3xl lg:text-4xl"
          >
            A book of soft things
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-0.5 text-[10px] text-muted-foreground md:mt-1 md:text-xs"
          >
            {isFlipping ? '📖 Turning page...' : '👆 Drag to flip or use arrow keys'}
          </motion.p>
        </div>

        {/* Book - Reduced top/bottom space */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          ref={containerRef}
          className="relative w-full max-w-2xl select-none"
          style={{ perspective: '1800px' }}
        >
          {/* Page tabs - Smaller */}
          <div className="absolute -top-2 left-0 right-0 z-30 flex justify-around px-3 md:-top-3 md:px-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-3 w-1 rounded-full border border-primary/30 bg-white/80 shadow-sm backdrop-blur-sm dark:bg-gray-800/80 md:h-4 md:w-1.5"
                style={{ 
                  transform: `rotate(${i % 2 === 0 ? '2deg' : '-2deg'})`,
                }}
              />
            ))}
          </div>

          <div className="relative overflow-hidden rounded-xl bg-white/40 shadow-2xl backdrop-blur-sm dark:bg-gray-800/40 md:rounded-2xl">
            <div className="relative" style={{ aspectRatio: '4 / 5' }}>
              {/* Background page */}
              <div className="absolute inset-0 h-full min-h-[300px] md:min-h-[380px]">
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
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.06)',
                  }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                >
                  <div className="h-full rounded-r-xl bg-white/90 dark:bg-gray-800/90 md:rounded-r-2xl">
                    <PageContent index={flapIndex} isFlipping={true} />
                  </div>
                  
                  {/* Crease shadow */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/30 to-transparent md:w-16"
                    style={{ opacity: creaseShadow }}
                  />
                </motion.div>
              )}

              {/* Shadow overlay for lift effect */}
              {dir !== null && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-black md:rounded-2xl"
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
        </motion.div>

        {/* Navigation dots - Smaller and tighter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-1 md:gap-1.5"
        >
          {memories.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === page ? 'page' : undefined}
              className={`group relative h-1.5 w-1.5 rounded-full transition-all duration-300 md:h-2 md:w-2 ${
                i === page 
                  ? 'w-4 bg-primary shadow-lg shadow-primary/30 md:w-6' 
                  : 'bg-primary/30 hover:bg-primary/60 hover:scale-110'
              }`}
              disabled={isFlipping}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 scale-0 rounded bg-black/80 px-1 py-0.5 text-[8px] text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 md:-top-6 md:px-1.5 md:py-0.5 md:text-[10px]">
                {i + 1}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Page indicator - Smaller */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-[10px] text-muted-foreground md:text-xs"
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
