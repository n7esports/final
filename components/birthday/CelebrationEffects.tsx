'use client'

import { motion } from 'framer-motion'

interface CelebrationEffectsProps {
  fireworks: { id: number; x: number; y: number; delay: number; size: number }[]
  confettiItems: { id: number; x: number; delay: number; color: string; size: number; rotate: number }[]
}

export function CelebrationEffects({ fireworks, confettiItems }: CelebrationEffectsProps) {
  return (
    <>
      {/* SCENE 4 & 5: Fireworks burst (radial expansion + glow) */}
      {fireworks.map((fw) => (
        <motion.div
          key={`firework-${fw.id}`}
          className="absolute rounded-full pointer-events-none z-20"
          style={{
            left: fw.x + '%',
            top: fw.y + '%',
            width: fw.size,
            height: fw.size,
            background: 'radial-gradient(circle, rgba(255,180,220,0.8) 0%, transparent 80%)',
            filter: 'blur(12px)',
            boxShadow: '0 0 30px rgba(255,100,170,0.6)',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: [0, 0.9, 0] }}
          transition={{ duration: 2.2, delay: fw.delay, ease: 'easeOut' }}
        />
      ))}

      {/* SCENE 5: Confetti fall (spin + drift) */}
      {confettiItems.map((c) => (
        <motion.div
          key={`confetti-${c.id}`}
          className="absolute z-20 pointer-events-none"
          style={{
            left: c.x + '%',
            top: '-20px',
            width: c.size,
            height: c.size * 0.6,
            background: c.color,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            rotate: c.rotate,
            boxShadow: `0 0 10px ${c.color}`,
          }}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ 
            y: ['0vh', '100vh'], 
            opacity: [0.9, 0.1], 
            rotate: [0, 1080],
            x: [0, Math.sin(c.rotate * Math.PI / 180) * 100]
          }}
          transition={{ 
            duration: 3.0 + Math.random() * 1.5, 
            delay: c.delay, 
            ease: 'easeOut' 
          }}
        />
      ))}
    </>
  )
}
