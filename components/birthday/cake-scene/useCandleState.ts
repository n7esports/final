"use client"
import { useState } from "react"

export const useCandleState = () => {
  const [blown, setBlown] = useState(false)

  const blowCandles = () => {
    setBlown(true)
  }

  return { blown, blowCandles }
}
