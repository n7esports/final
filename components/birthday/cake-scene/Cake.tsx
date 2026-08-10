"use client"
import Candle from "./Candle"

export default function Cake({ blown }: { blown: boolean }) {
  const candles = new Array(8).fill(0)

  return (
    <div className="relative flex flex-col items-center">
      {/* Candles */}
      <div className="flex gap-2 mb-2">
        {candles.map((_, i) => (
          <Candle key={i} isOff={blown} />
        ))}
      </div>

      {/* Cake */}
      <div className="w-72 h-40 rounded-xl bg-gradient-to-b from-pink-500 to-purple-700 shadow-2xl relative">
        <div className="absolute inset-0 rounded-xl bg-black/20" />
      </div>
    </div>
  )
}
