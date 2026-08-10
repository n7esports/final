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
    <div className={`grid h-full touch-none gap-3 p-3 md:grid-cols-2 md:gap-5 md:p-6 ${isFlipping ? 'pointer-events-none' : ''}`}>
      <div className="relative flex items-center justify-center">
        <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl">
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
          <div className="absolute top-4 right-4 text-yellow-300/30 text-2xl">✦</div>
          <div className="absolute bottom-4 left-4 text-yellow-300/20 text-xl">✦</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-300/10 text-6xl">✦</div>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-2 px-1 md:gap-3 md:px-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary md:px-3 md:py-1 md:text-xs">
            Page {safeIndex + 1} of {memories.length}
          </span>
          <div className="flex-1 border-t border-primary/10" />
        </div>
        <h3 className="font-serif text-base font-semibold italic leading-tight text-primary md:text-2xl md:leading-snug">
          {memory.caption}
        </h3>
        <div className="relative">
          <span className="absolute -left-1 -top-3 text-2xl text-primary/20 md:-left-3 md:text-4xl">"</span>
          <p className="font-serif text-sm italic leading-relaxed text-card-foreground/90 md:text-base md:leading-relaxed">
            {memory.quote}
          </p>
          <span className="absolute -bottom-4 right-0 text-2xl text-primary/20 md:-bottom-6 md:text-4xl">"</span>
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
  const targetPageRef = useRef<number | null>(null)
  
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

  const flipToPage = useCallback((targetPage: number, direction: Dir) => {
    if (isFlipping) return
    
    // If already on target page, do nothing
    if (targetPage === page) return
    
    setIsFlipping(true)
    dirRef.current = direction
    setDir(direction)
    
    // Set initial rotation based on direction
    rotateY.set(direction === 1 ? 0 : -180)
    
    // Animate to complete flip
    const targetRotation = direction === 1 ? -180 : 0
    
    if (animationRef.current) {
      animationRef.current.stop()
    }
    
    animationRef.current = animate(rotateY, targetRotation, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      onComplete: () => {
        setPage(targetPage)
        dirRef.current = null
        setDir(null)
        rotateY.set(0)
        setIsFlipping(false)
        animationRef.current = null
        targetPageRef.current = null
      },
    })
  }, [isFlipping, page, rotateY])

  const settle = useCallback((committed: boolean) => {
    const d = dirRef.current
    if (!d) return
    
    const currentPage = page
    const targetPage = committed ? currentPage + d : currentPage
    
    // Ensure target is within bounds
    const wrappedTarget = ((targetPage % total) + total) % total
    
    if (committed) {
      // Complete the flip
      const targetRotation = d === 1 ? -180 : 0
      
      if (animationRef.current) {
        animationRef.current.stop()
      }
      
      setIsFlipping(true)
      animationRef.current = animate(rotateY, targetRotation, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        onComplete: () => {
          setPage(wrappedTarget)
          dirRef.current = null
          setDir(null)
          rotateY.set(0)
          setIsFlipping(false)
          animationRef.current = null
        },
      })
    } else {
      // Cancel the flip - go back to start
      const startRotation = d === 1 ? 0 : -180
      
      if (animationRef.current) {
        animationRef.current.stop()
      }
      
      setIsFlipping(true)
      animationRef.current = animate(rotateY, startRotation, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        onComplete: () => {
          dirRef.current = null
          setDir(null)
          rotateY.set(0)
          setIsFlipping(false)
          animationRef.current = null
        },
      })
    }
  }, [page, rotateY, total])

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

  const goToPage = useCallback((targetIndex: number) => {
    if (isFlipping) return
    
    const safeTarget = ((targetIndex % total) + total) % total
    if (safeTarget === page) return
    
    const direction: Dir = safeTarget > page ? 1 : -1
    flipToPage(safeTarget, direction)
  }, [isFlipping, page, total, flipToPage])

  // Handle multiple page flips for dot navigation
  const goToPageWithMultipleFlips = useCallback((targetIndex: number) => {
    if (isFlipping) return
    
    const safeTarget = ((targetIndex % total) + total) % total
    if (safeTarget === page) return
    
    // Calculate the shortest path
    let diff = safeTarget - page
    if (Math.abs(diff) > total / 2) {
      diff = diff > 0 ? diff - total : diff + total
    }
    
    const direction: Dir = diff > 0 ? 1 : -1
    const steps = Math.abs(diff)
    
    // If it's just one step, flip normally
    if (steps === 1) {
      flipToPage(safeTarget, direction)
      return
    }
    
    // For multiple steps, we need to flip through intermediate pages
    // This creates a smooth multi-page flip animation
    let currentStep = 0
    const flipInterval = setInterval(() => {
      currentStep++
      const nextPage = ((page + (direction * currentStep)) % total + total) % total
      
      if (currentStep === steps) {
        clearInterval(flipInterval)
        // Final flip to target
        flipToPage(safeTarget, direction)
      } else {
        // Intermediate flip - fast and without animation
        setPage(nextPage)
      }
    }, 150) // Speed of multi-page flips
  }, [isFlipping, page, total, flipToPage])

  const flapIndex = dir === 1 ? page : dir === -1 ? page - 1 : page
  const underIndex = dir === 1 ? page + 1 : dir === -1 ? page : page

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isFlipping) {
        e.preventDefault()
        const nextPage = ((page + 1) % total + total) % total
        flipToPage(nextPage, 1)
      } else if (e.key === 'ArrowLeft' && !isFlipping) {
        e.preventDefault()
        const prevPage = ((page - 1) % total + total) % total
        flipToPage(prevPage, -1)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flipToPage, isFlipping, page, total])

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 px-3 py-8 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 md:px-4 md:py-16">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-pink-200/20 blur-3xl dark:bg-pink-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-200/10 blur-3xl dark:bg-purple-500/5" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 md:gap-10">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-1 inline-block rounded-full bg-white/50 px-4 py-1 text-xs font-medium uppercase tracking-[0.35em] text-primary backdrop-blur-sm dark:bg-white/10 md:px-6 md:py-2 md:text-sm"
          >
            ✨ Scrapbook
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-balance font-serif text-2xl font-semibold md:text-4xl lg:text-5xl"
          >
            A book of soft things
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-1 text-xs text-muted-foreground md:mt-2 md:text-sm"
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
          {/* Page tabs */}
          <div className="absolute -top-3 left-0 right-0 z-30 flex justify-around px-4 md:-top-4 md:px-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-1.5 rounded-full border border-primary/30 bg-white/80 shadow-sm backdrop-blur-sm dark:bg-gray-800/80 md:h-5 md:w-2"
                style={{ 
                  transform: `rotate(${i % 2 === 0 ? '2deg' : '-2deg'})`,
                }}
              />
            ))}
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white/40 shadow-2xl backdrop-blur-sm dark:bg-gray-800/40 md:rounded-3xl">
            <div className="relative" style={{ aspectRatio: '4 / 5' }}>
              {/* Background page */}
              <div className="absolute inset-0 h-full min-h-[350px] md:min-h-[420px]">
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
                  <div className="h-full rounded-r-2xl bg-white/90 dark:bg-gray-800/90 md:rounded-r-3xl">
                    <PageContent index={flapIndex} isFlipping={true} />
                  </div>
                  
                  {/* Crease shadow */}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/30 to-transparent md:w-24"
                    style={{ opacity: creaseShadow }}
                  />
                </motion.div>
              )}

              {/* Shadow overlay for lift effect */}
              {dir !== null && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-black md:rounded-3xl"
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

        {/* Navigation dots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2"
        >
          {memories.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToPageWithMultipleFlips(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === page ? 'page' : undefined}
              className={`group relative h-2 w-2 rounded-full transition-all duration-300 md:h-2.5 md:w-2.5 ${
                i === page 
                  ? 'w-6 bg-primary shadow-lg shadow-primary/30 md:w-8' 
                  : 'bg-primary/30 hover:bg-primary/60 hover:scale-110'
              }`}
              disabled={isFlipping}
            >
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 scale-0 rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100 md:-top-8 md:px-2 md:py-0.5 md:text-xs">
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
          className="text-center text-xs text-muted-foreground md:text-sm"
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
