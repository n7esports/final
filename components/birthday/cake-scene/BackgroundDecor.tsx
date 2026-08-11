'use client'

import { motion } from 'framer-motion'

export default function BackgroundDecor({ isDarkTheme }: { isDarkTheme: boolean }) {
  return (
    <>
      {/* Animated Background Stars/Particles */}
      {isDarkTheme ? (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Stars in dark mode */}
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Floating orbs in dark mode */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full blur-3xl opacity-30"
              style={{
                width: '400px',
                height: '400px',
                background: [
                  'radial-gradient(circle, rgba(255,105,180,0.5) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(138,43,226,0.5) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(0,191,255,0.5) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(255,215,0,0.5) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(255,69,0,0.5) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(50,205,50,0.5) 0%, transparent 70%)',
                ][i],
                left: `${i * 15 - 10}%`,
                top: `${i * 20 - 10}%`,
              }}
              animate={{
                x: [0, 50, -50, 0],
                y: [0, -50, 50, 0],
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Light strings/garlands effect */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ opacity: 0.15, mixBlendMode: 'screen' }}
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="lights-dark"
                x="60"
                y="60"
                width="120"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="4" fill="rgba(255,215,0,0.8)" />
                <circle cx="60" cy="20" r="3" fill="rgba(255,105,180,0.8)" />
                <circle cx="100" cy="20" r="4" fill="rgba(138,43,226,0.8)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lights-dark)" />
          </svg>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Soft particles in light mode */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                background: `rgba(100, 150, 200, ${0.3 + Math.random() * 0.3})`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}

          {/* Soft gradient overlays in light mode */}
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={`gradient-${i}`}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                width: '300px',
                height: '300px',
                background: [
                  'radial-gradient(circle, rgba(255,182,193,0.6) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(135,206,250,0.6) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(255,218,185,0.6) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(230,230,250,0.6) 0%, transparent 70%)',
                ][i],
                left: `${i * 25}%`,
                top: `${i * 25 - 5}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Subtle pattern in light mode */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgba(255,182,193,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(135,206,250,0.1) 0%, transparent 50%)',
              opacity: 0.5,
            }}
          />
        </div>
      )}
    </>
  )
}
