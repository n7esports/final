'use client'

import { motion } from 'framer-motion'
import { useMemo, useEffect, useState } from 'react'

export default function BalloonSystem({ show, isDarkTheme }: { show: boolean; isDarkTheme: boolean }) {
  const [windowHeight, setWindowHeight] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)

  // Get window dimensions for responsive balloons
  useEffect(() => {
    setWindowHeight(window.innerHeight)
    setWindowWidth(window.innerWidth)

    const handleResize = () => {
      setWindowHeight(window.innerHeight)
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Memoize balloon data to prevent re-renders
  const balloons = useMemo(() => {
    const colors = isDarkTheme 
      ? [
          { bg: 'from-red-600 to-red-700', border: 'border-red-500/30' },
          { bg: 'from-blue-600 to-blue-700', border: 'border-blue-500/30' },
          { bg: 'from-purple-600 to-purple-700', border: 'border-purple-500/30' },
          { bg: 'from-pink-600 to-pink-700', border: 'border-pink-500/30' },
          { bg: 'from-yellow-500 to-yellow-600', border: 'border-yellow-500/30' },
          { bg: 'from-green-600 to-green-700', border: 'border-green-500/30' },
          { bg: 'from-orange-600 to-orange-700', border: 'border-orange-500/30' },
          { bg: 'from-teal-600 to-teal-700', border: 'border-teal-500/30' },
        ]
      : [
          { bg: 'from-red-400 to-red-500', border: 'border-red-300/50' },
          { bg: 'from-blue-400 to-blue-500', border: 'border-blue-300/50' },
          { bg: 'from-purple-400 to-purple-500', border: 'border-purple-300/50' },
          { bg: 'from-pink-400 to-pink-500', border: 'border-pink-300/50' },
          { bg: 'from-yellow-300 to-yellow-400', border: 'border-yellow-300/50' },
          { bg: 'from-green-400 to-green-500', border: 'border-green-300/50' },
          { bg: 'from-orange-400 to-orange-500', border: 'border-orange-300/50' },
          { bg: 'from-teal-400 to-teal-500', border: 'border-teal-300/50' },
        ]

    return Array.from({ length: 25 }).map((_, i) => {
      const colorIndex = i % colors.length
      const randomX = (Math.random() - 0.5) * 300
      const randomRotation = (Math.random() - 0.5) * 720
      const duration = 6 + Math.random() * 4
      const delay = i * 0.15
      const size = 0.8 + Math.random() * 0.4
      const left = Math.random() * 90 + 5 // Keep balloons within viewport

      return {
        id: i,
        delay,
        left,
        color: colors[colorIndex],
        randomX,
        randomRotation,
        duration,
        size,
        wobbleSpeed: 1 + Math.random() * 2,
        wobbleAmount: 5 + Math.random() * 15,
      }
    })
  }, [isDarkTheme])

  if (!show || windowHeight === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {balloons.map((balloon) => (
        <motion.div
          key={balloon.id}
          className={`absolute rounded-full bg-gradient-to-br ${balloon.color.bg} shadow-xl`}
          style={{
            width: `${60 * balloon.size}px`,
            height: `${75 * balloon.size}px`,
            left: `${balloon.left}%`,
            bottom: '-150px',
            border: `2px solid ${isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'}`,
            boxShadow: isDarkTheme 
              ? '0 8px 32px rgba(0,0,0,0.4), inset 0 -4px 12px rgba(0,0,0,0.2)'
              : '0 8px 32px rgba(0,0,0,0.1), inset 0 -4px 12px rgba(0,0,0,0.05)',
          }}
          initial={{ 
            y: 0, 
            opacity: 0,
            scale: 0.5,
            rotate: 0 
          }}
          animate={{
            y: -windowHeight - 200,
            opacity: [0, 1, 1, 0.8, 0],
            scale: [0.5, 1, 1, 0.9, 0.8],
            x: [
              0,
              balloon.randomX * 0.3,
              balloon.randomX * 0.6,
              balloon.randomX * 0.3,
              balloon.randomX,
            ],
            rotate: [0, balloon.randomRotation * 0.3, balloon.randomRotation * 0.6, balloon.randomRotation * 0.3, balloon.randomRotation],
          }}
          transition={{
            duration: balloon.duration,
            delay: balloon.delay,
            ease: [0.25, 0.1, 0.25, 1], // Custom cubic bezier for smooth floating
          }}
        >
          {/* Balloon shine/highlight */}
          <div
            className="absolute top-2 left-3 rounded-full"
            style={{
              width: `${20 * balloon.size}px`,
              height: `${25 * balloon.size}px`,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 70%)',
            }}
          />

          {/* Balloon bottom knot */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: `${4 * balloon.size}px`,
              height: `${6 * balloon.size}px`,
              background: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
              borderRadius: '50%',
              transform: 'translateY(50%)',
            }}
          />

          {/* String */}
          <motion.div
            className="absolute"
            style={{
              width: '1.5px',
              height: `${80 * balloon.size}px`,
              left: '50%',
              top: '100%',
              transform: 'translateX(-50%)',
              background: isDarkTheme 
                ? 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.05))'
                : 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.05))',
            }}
            animate={{
              scaleX: [1, 0.8, 1.2, 0.8, 1],
              x: [-2, 2, -3, 3, -2],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* String shadow */}
            <div
              className="absolute inset-0"
              style={{
                transform: 'translateX(1px)',
                opacity: 0.3,
                background: isDarkTheme 
                  ? 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.05))'
                  : 'transparent',
              }}
            />
          </motion.div>

          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: isDarkTheme
                ? `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)`
                : `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)`,
              filter: 'blur(10px)',
            }}
          />
        </motion.div>
      ))}

      {/* Floating particles (extra sparkle) */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: isDarkTheme ? 'rgba(255,255,255,0.6)' : 'rgba(255,215,0,0.6)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              y: [0, -50, -100],
              x: [0, Math.random() * 20 - 10, Math.random() * 40 - 20],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}
