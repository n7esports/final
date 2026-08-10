'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

function Particles() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const container = ref.current
    const dots: {
      el: HTMLDivElement
      x: number
      y: number
      vx: number
      vy: number
    }[] = []
    const count = 40

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      el.className = 'particle'
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
      `
      container.appendChild(el)
      dots.push({
        el,
        x: parseFloat(el.style.left),
        y: parseFloat(el.style.top),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      })
    }

    // FIX: Store RAF frame ID properly, clean it up correctly
    let frameId: number | null = null
    const animate = () => {
      dots.forEach((d) => {
        d.x += d.vx * 0.2
        d.y += d.vy * 0.2
        if (d.x > 100) d.x = 0
        if (d.x < 0) d.x = 100
        if (d.y > 100) d.y = 0
        if (d.y < 0) d.y = 100
        d.el.style.left = d.x + '%'
        d.el.style.top = d.y + '%'
      })
      frameId = requestAnimationFrame(animate)
    }
    animate()
    
    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
      }
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
      {/* Base gradient background with glass effect */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: celebrate
            ? 'radial-gradient(circle at 30% 40%, rgba(255,100,170,0.2), rgba(200,80,200,0.1), rgba(20,10,30,0.95))'
            : 'radial-gradient(circle at 20% 30%, rgba(200,150,220,0.15), rgba(150,100,180,0.08), rgba(240,240,250,0.98))',
        }}
        transition={{ duration: 2.0, ease: 'easeInOut' }}
      />

      {/* Animated gradient overlay (Scene 2: Ambient loop) */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            'radial-gradient(ellipse at 60% 40%, rgba(255,100,170,0.15), transparent 60%)',
            'radial-gradient(ellipse at 30% 70%, rgba(200,150,220,0.2), transparent 60%)',
            'radial-gradient(ellipse at 70% 30%, rgba(180,100,220,0.12), transparent 60%)',
          ],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '300px 300px',
          }}
        />
      </div>

      {/* Floating particles (Scene 2: Ambient loop) */}
      <Particles />

      {/* Light ribbons (Scene 2 & 3: Ambient + tension) */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-[300px] h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent blur-2xl opacity-20"
        animate={{ x: [0, 60, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/5 w-[400px] h-[2px] rounded-full bg-gradient-to-r from-transparent via-secondary to-transparent blur-3xl opacity-15"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Central glow (Scene 3 & 4: Tension + final second) */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        animate={{
          background: celebrate
            ? 'radial-gradient(circle, rgba(255,100,170,0.4) 0%, rgba(200,80,200,0.15) 60%, transparent 100%)'
            : 'radial-gradient(circle, rgba(200,150,220,0.2) 0%, rgba(150,100,180,0.08) 50%, transparent 100%)',
          scale: celebrate ? [1, 1.3, 1.1] : [1, 1.05, 1],
          opacity: celebrate ? 0.8 : 0.4,
        }}
        transition={{ duration: 3, repeat: celebrate ? 0 : Infinity, ease: 'easeInOut' }}
      />
    </>
  )
}
