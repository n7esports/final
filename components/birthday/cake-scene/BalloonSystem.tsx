'use client'

import { motion } from 'framer-motion'

export default function BalloonSystem({ show, isDarkTheme }: { show: boolean; isDarkTheme: boolean }) {
  if (!show) return null

  const balloons = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    delay: i * 0.1,
    left: `${Math.random() * 100}%`,
    color: [
      isDarkTheme ? 'from-red-500 to-red-600' : 'from-red-400 to-red-500',
      isDarkTheme ? 'from-blue-500 to-blue-600' : 'from-blue-400 to-blue-500',
      isDarkTheme ? 'from-purple-500 to-purple-600' : 'from-purple-400 to-purple-500',
      isDarkTheme ? 'from-pink-500 to-pink-600' : 'from-pink-400 to-pink-500',
      isDarkTheme ? 'from-yellow-400 to-yellow-500' : 'from-yellow-300 to-yellow-400',
      isDarkTheme ? 'from-green-500 to-green-600' : 'from-green-400 to-green-500',
    ][i % 6],
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {balloons.map((balloon) => (
        <motion.div
          key={balloon.id}
          className={`absolute w-16 h-20 rounded-full bg-gradient-to-br ${balloon.color} shadow-lg`}
          style={{
            left: balloon.left,
            bottom: '-100px',
          }}
          initial={{ y: 0, opacity: 1, scale: 0.8 }}
          animate={{
            y: window.innerHeight + 200,
            opacity: [1, 1, 0.5],
            x: Math.sin((balloon.id % 5) * 72 * (Math.PI / 180)) * 200,
            rotate: [0, 360 + Math.random() * 360],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            delay: balloon.delay,
            ease: 'easeInOut',
          }}
        >
          {/* Balloon shine effect */}
          <div
            className="absolute top-2 left-2 w-6 h-6 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 70%)',
            }}
          />

          {/* String */}
          <motion.div
            className={`absolute top-20 left-1/2 w-0.5 h-24 ${
              isDarkTheme ? 'bg-gray-400' : 'bg-gray-500'
            }`}
            style={{
              transform: 'translateX(-50%)',
            }}
            animate={{
              scaleY: [1, 0.95, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
