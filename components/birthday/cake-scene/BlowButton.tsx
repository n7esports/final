"use client"
import { motion } from "framer-motion"

export default function BlowButton({ onBlow }: { onBlow: () => void }) {
  return (
    <motion.button
      onClick={onBlow}
      whileTap={{ scale: 0.9 }}
      className="mt-6 px-8 py-3 rounded-full text-white text-lg font-semibold"
      style={{
        background: "linear-gradient(135deg,#ff4ecd,#ff9a3c)",
        boxShadow: "0 0 20px rgba(255,78,205,0.8)",
      }}
    >
      Blow the Candles
    </motion.button>
  )
}
