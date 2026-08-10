"use client";
import { motion } from "framer-motion"

export default function Flame({ isOff }: { isOff: boolean }) {
  if (isOff) return null

  return (
    <motion.div
      className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-4 rounded-full bg-yellow-400"
      animate={{
        scale: [1, 1.2, 0.9, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        repeat: Infinity,
        duration: 0.6,
      }}
      style={{
        boxShadow: "0 0 12px rgba(255,200,0,0.9)",
      }}
    />
  )
}
