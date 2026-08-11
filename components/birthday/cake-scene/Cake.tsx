"use client";

import Candle from "./Candle"
import { motion } from "framer-motion"

interface CakeProps {
  blown: boolean
  isDarkTheme?: boolean
}

export default function Cake({ blown, isDarkTheme = true }: CakeProps) {
  const candles = new Array(8).fill(0)

  return (
    <motion.div 
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Candles */}
      <div className="flex gap-2 md:gap-3 mb-2 z-10">
        {candles.map((_, i) => (
          <Candle key={i} isOff={blown} />
        ))}
      </div>

      {/* Cake Body */}
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Main Cake */}
        <div className="w-72 md:w-96 h-36 md:h-44 rounded-xl relative shadow-2xl">
          {/* Gradient layers */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-pink-400 via-pink-500 to-purple-700 overflow-hidden">
            {/* Top frosting layer */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-pink-300/80 to-pink-400/80 rounded-t-xl" />
            
            {/* Bottom layer shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-purple-900/50 to-transparent rounded-b-xl" />
          </div>

          {/* Cake details - icing drips */}
          <div className="absolute top-6 left-0 right-0 h-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`drip-${i}`}
                className="absolute w-3 h-4 bg-pink-300/60 rounded-full"
                style={{
                  left: `${i * 9 + 5}%`,
                  top: '0',
                  transform: 'rotate(5deg)',
                }}
              />
            ))}
          </div>

          {/* Decorative piping on top */}
          <div className="absolute top-6 left-0 right-0 h-2 flex justify-around">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={`pip-${i}`}
                className="w-1 h-3 bg-pink-200/50 rounded-full"
                style={{
                  transform: `rotate(${i % 2 === 0 ? '10deg' : '-10deg'})`,
                  marginTop: '-2px',
                }}
              />
            ))}
          </div>

          {/* Side decorations - sprinkles */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={`sprinkle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${2 + Math.random() * 4}px`,
                  height: `${2 + Math.random() * 4}px`,
                  background: [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
                    '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE'
                  ][i % 8],
                  left: `${Math.random() * 90 + 5}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  opacity: 0.7,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>

          {/* Dark overlay */}
          <div className="absolute inset-0 rounded-xl bg-black/5" />
          
          {/* Shadow */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-4 bg-black/30 blur-xl rounded-full" />
        </div>

        {/* Cake Plate */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[110%] h-3 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full shadow-lg" />
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[120%] h-2 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full opacity-50" />
      </motion.div>

      {/* Cake Message (when blown) */}
      {blown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent`}>
            🎂 Happy Birthday! 🎂
          </p>
          <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
            May your day be as sweet as this cake! ✨
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
