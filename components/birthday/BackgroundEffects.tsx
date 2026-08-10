'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function Particles() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const container = ref.current
    // Fewer particles, and skip entirely if the user/device prefers less motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const count = prefersReducedMotion ? 0 : 18 // was 40

    const dots: { el: HTMLDivElement; x: number; y: number; vx: number; vy: number }[] = []

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      const size = 2 + Math.random() * 6
      el.style.cssText = `
        position: absolute;
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle at 30% 30%, rgba(255,150,200,0.6), rgba(200,100,255,0.1));
        filter: blur(1px);
        pointer-events: none;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        will-change: transform;
        transform: translate3d(0,0,0);
      `
      container.appendChild(el)
      dots.push({ el, x: Math.random() * 100, y: Math.random() * 100, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 })
    }

    let frameId: number | null = null
    let lastTime = 0
    const animate = (time: number) => {
      // Throttle to ~30fps instead of 60fps — halves the work, invisible for slow drifting dots
      if (time - lastTime > 33) {
        lastTime = time
        dots.forEach((d) => {
          d.x += d.vx * 0.2
          d.y += d.vy * 0.2
          if (d.x > 100) d.x = 0
          if (d.x < 0) d.x = 100
          if (d.y > 100) d.y = 0
          if (d.y < 0) d.y = 100
          // translate3d is compositor-only — cheap. left/top forces layout — expensive.
          d.el.style.transform = `translate3d(${d.x - parseFloat(d.el.style.left)}vw, ${d.y - parseFloat(d.el.style.top)}vh, 0)`
        })
      }
      frameId = requestAnimationFrame(animate)
    }
    if (count > 0) frameId = requestAnimationFrame(animate)

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      container.innerHTML = ''
    }
  }, [])

  return <div ref={ref} className="absolute inset-0 pointer-events-none overflow-hidden" />
}

interface BackgroundEffectsProps {
  celebrate: boolean
}

export function BackgroundEffects({ celebrate }: BackgroundEffectsProps) {
  return (
    <>
      {/* Base gradient — animate opacity crossfade between two static layers instead of animating `background` itself */}
      <div
        className="absolute inset-0 -z-10 transition-opacity duration-[2000ms]"
        style={{
          background:
            'radial-gradient(circle at 20% 30%, rgba(200,150,220,0.15), rgba(150,100,180,0.08), rgba(240,240,250,0.98))',
          opacity: celebrate ? 0 : 1,
        }}
      />
      <div
        className="absolute inset-0 -z-10 transition-opacity duration-[2000ms]"
        style={{
          background:
            'radial-gradient(circle at 30% 40%, rgba(255,100,170,0.2), rgba(200,80,200,0.1), rgba(20,10,30,0.95))',
          opacity: celebrate ? 1 : 0,
        }}
      />

      {/* Removed the always-on Infinity-repeat animated-gradient overlay — it was one of the two
          `background`-array animations forcing full-screen repaints every frame. */}

      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '300px 300px',
          }}
        />
      </div>

      <Particles />

      {/* Ribbons: animate transform only (cheap), unchanged otherwise */}
      <motion.div
        className="absolute top-1/3 left-1/4 h-[2px] w-[300px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-20 blur-2xl"
        animate={{ x: [0, 60, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/5 h-[2px] w-[400px] rounded-full bg-gradient-to-r from-transparent via-secondary to-transparent opacity-15 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Central glow: smaller blur radius (60px not 120px), animate only transform/opacity */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
        style={{
          background: celebrate
            ? 'radial-gradient(circle, rgba(255,100,170,0.4) 0%, rgba(200,80,200,0.15) 60%, transparent 100%)'
            : 'radial-gradient(circle, rgba(200,150,220,0.2) 0%, rgba(150,100,180,0.08) 50%, transparent 100%)',
        }}
        animate={{
          scale: celebrate ? [1, 1.3, 1.1] : [1, 1.05, 1],
          opacity: celebrate ? 0.8 : 0.4,
        }}
        transition={{ duration: 3, repeat: celebrate ? 0 : Infinity, ease: 'easeInOut' }}
      />
    </>
  )
}
