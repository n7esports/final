"use client"
import Flame from "./Flame"

export default function Candle({ isOff }: { isOff: boolean }) {
  return (
    <div className="relative w-2 h-10 bg-white rounded">
      <Flame isOff={isOff} />
    </div>
  )
}
