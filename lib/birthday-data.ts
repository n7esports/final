export type Memory = {
  src: string
  caption: string
  quote?: string
}

export const memories: Memory[] = [
  {
    src: '/images/memory-1.png',
    caption: 'Floating on air',
    quote: 'Some people make the world softer just by being in it.',
  },
  {
    src: '/images/memory-2.png',
    caption: 'Make a wish',
    quote: 'May every candle you blow out become a dream that comes true.',
  },
  {
    src: '/images/memory-3.png',
    caption: 'Bloom season',
    quote: 'You bloom in every season, even the hard ones.',
  },
  {
    src: '/images/memory-4.png',
    caption: 'Little joys',
    quote: 'The best gifts are the moments we get to keep.',
  },
  {
    src: '/images/memory-5.png',
    caption: 'Cotton candy skies',
    quote: 'The sky turned pink like it knew it was your day.',
  },
  {
    src: '/images/memory-6.png',
    caption: 'For you',
    quote: 'A bouquet of every reason you are loved.',
  },
]

/** Next occurrence of September 15, 12:00 AM local time. */
export function getTargetDate(now = new Date()): Date {
  const year = now.getFullYear()
  const target = new Date(year, 8, 15, 0, 0, 0) // month is 0-indexed: 8 = September
  if (now.getTime() >= target.getTime()) {
    return new Date(year + 1, 8, 15, 0, 0, 0)
  }
  return target
}
