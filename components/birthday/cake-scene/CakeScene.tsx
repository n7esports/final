"use client"

import { useCandleState } from "./useCandleState"
import Cake from "./Cake"
import BlowButton from "./BlowButton"
import BalloonSystem from "./BalloonSystem"
import ConfettiSystem from "./ConfettiSystem"
import BackgroundDecor from "./BackgroundDecor"

export default function CakeScene() {
  const { blown, blowCandles } = useCandleState()

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden text-white">
      <BackgroundDecor />

      <Cake blown={blown} />

      <BlowButton onBlow={blowCandles} />

      <BalloonSystem show={blown} />
      <ConfettiSystem show={blown} />
    </div>
  )
}
