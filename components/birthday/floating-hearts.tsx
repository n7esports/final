'use client'

import { useMemo } from 'react'

type Heart = {
  left: number
  duration: number
  delay: number
  scale: number
  opacity: number
  drift: number
  rotate: number
  char: string
}

const chars = ['\u{1F496}', '\u{1F338}', '\u2728', '\u{1F49C}']

export function FloatingHearts({ count = 14 }: { count?: number }) {
  const hearts = useMemo<Heart[]>(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: (i * 97) % 100,
        duration: 14 + ((i * 37) % 12),
        delay: (i * 53) % 14,
        scale: 0.5 + ((i * 29) % 10) / 12,
        opacity: 0.18 + ((i * 41) % 10) / 45,
        drift: ((i * 61) % 80) - 40,
        rotate: ((i * 43) % 40) - 20,
        char: chars[i % chars.length],
      })),
    [count],
  )

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {hearts.map((heart, i) => (
       <span
  key={i}
  className="absolute bottom-0 text-2xl will-change-transform"
  style={
    {
      left: `${heart.left}%`,
      opacity: 0, // stay invisible until the animation's own fade-in takes over
      animation: `float-up ${heart.duration}s linear ${heart.delay}s infinite`,
      animationFillMode: 'backwards', // apply the 0% keyframe during the delay too
      '--s': heart.scale,
      '--o': heart.opacity,
      '--d': `${heart.drift}px`,
      '--r': `${heart.rotate}deg`,
    } as React.CSSProperties
  }
>
          {heart.char}
        </span>
      ))}
    </div>
  )
}
