"use client";
import { motion } from "framer-motion"

export default function BalloonSystem({ show }: { show: boolean }) {
  if (!show) return null

  const balloons = new Array(10).fill(0)

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {balloons.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: -600, opacity: 1 }}
          transition={{
            duration: 6,
            delay: i * 0.3,
            repeat: Infinity,
          }}
          className="absolute bottom-0 w-10 h-14 bg-pink-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  )
}
