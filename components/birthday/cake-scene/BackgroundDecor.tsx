'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

export default function BackgroundDecor({ isDarkTheme }: { isDarkTheme: boolean }) {
  // Memoize random values to prevent re-renders
  const stars = useMemo(() => 
    Array.from({ length: isDarkTheme ? 50 : 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: isDarkTheme ? 1 : 2 + Math.random() * 3,
      duration: isDarkTheme ? 3 + Math.random() * 2 : 4 + Math.random() * 3,
      delay: Math.random() * 2,
      opacity: isDarkTheme ? 0.3 + Math.random() * 0.7 : 0.3 + Math.random() * 0.3,
    })),
    [isDarkTheme]
  )

  const orbs = useMemo(() =>
    Array.from({ length: isDarkTheme ? 6 : 4 }).map((_, i) => ({
      id: i,
      size: isDarkTheme ? 400 : 300,
      colors: isDarkTheme 
        ? [
            'radial-gradient(circle, rgba(255,105,180,0.5) 0%, transparent 70%)',
            'radial-gradient(circle, rgba(138,43,226,0.5) 0%, transparent 70%)',
            'radial-gradient(circle, rgba(0,191,255,0.5) 0%, transparent 70%)',
            'radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%)',
            'radial-gradient(circle, rgba(255,69,0,0.5) 0%, transparent 70%)',
            'radial-gradient(circle, rgba(50,205,50,0.5) 0%, transparent 70%)',
          ]
        : [
            'radial-gradient(circle, rgba(255,182,193,0.6) 0%, transparent 70%)',
            'radial-gradient(circle, rgba(135,206,250,0.6) 0%, transparent 70%)',
            'radial-gradient(circle, rgba(255,218,185,0.6) 0%, transparent 70%)',
            'radial-gradient(circle, rgba(230,230,250,0.6) 0%, transparent 70%)',
          ],
      left: i * (isDarkTheme ? 15 : 25) - (isDarkTheme ? 10 : 0),
      top: i * (isDarkTheme ? 20 : 25) - (isDarkTheme ? 10 : 5),
      duration: isDarkTheme ? 15 + i * 2 : 8 + i * 2,
    })),
    [isDarkTheme]
  )

  if (isDarkTheme) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars in dark mode */}
        {stars.map((star) => (
          <motion.div
            key={`star-${star.id}`}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Floating orbs in dark mode */}
        {orbs.map((orb) => (
          <motion.div
            key={`orb-${orb.id}`}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background: orb.colors[orb.id],
              left: `${orb.left}%`,
              top: `${orb.top}%`,
              opacity: 0.3,
              filter: 'blur(60px)',
            }}
            animate={{
              x: [0, 60, -60, 0],
              y: [0, -60, 60, 0],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Light garlands effect */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 10% 20%, rgba(255,215,0,0.1) 0%, transparent 50%),
              radial-gradient(circle at 90% 80%, rgba(255,105,180,0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(138,43,226,0.05) 0%, transparent 70%)
            `,
            mixBlendMode: 'screen',
          }}
        />

        {/* Animated gradient lines */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(45deg, rgba(255,215,0,0.05) 0%, transparent 50%, rgba(138,43,226,0.05) 100%)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    )
  }

  // Light mode
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Soft particles in light mode */}
      {stars.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `rgba(135, 206, 235, ${particle.opacity})`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Floating orbs in light mode */}
      {orbs.map((orb) => (
        <motion.div
          key={`gradient-${orb.id}`}
          className="absolute rounded-full blur-3xl"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: orb.colors[orb.id],
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            opacity: 0.2,
            filter: 'blur(50px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255,182,193,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(135,206,250,0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 20%, rgba(255,218,185,0.05) 0%, transparent 40%)
          `,
        }}
      />

      {/* Gentle floating shapes */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute rounded-full border border-pink-200/20"
          style={{
            width: `${100 + i * 50}px`,
            height: `${100 + i * 50}px`,
            left: `${10 + i * 30}%`,
            top: `${20 + i * 20}%`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
