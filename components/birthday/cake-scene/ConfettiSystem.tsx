"use client"
import { motion } from "framer-motion"

export default function ConfettiSystem({ show }: { show: boolean }) {
  if (!show) return null

  const confetti = new Array(40).fill(0)

  return (
    <div className="absolute inset-0 pointer-events-none">
      {confetti.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -50, x: 0, opacity: 1 }}
          animate={{
            y: 500,
            x: Math.random() * 200 - 100,
            opacity: 0,
          }}
          transition={{
            duration: 3,
            delay: i * 0.05,
          }}
          className="absolute w-2 h-2 bg-yellow-400"
          style={{
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  )
}
