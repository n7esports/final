'use client'

import dynamic from 'next/dynamic'

const GalaxyScene = dynamic(() => import('./galaxy-scene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#1a0f1e]">
      <p className="animate-pulse text-sm tracking-[0.3em] text-primary uppercase">
        Entering the galaxy...
      </p>
    </div>
  ),
})

export function GalaxyGallery() {
  return (
    <section aria-label="3D galaxy photo gallery" className="px-4 py-20 md:py-28">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10">
        <div className="text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.35em] text-primary">
            Galaxy Gallery
          </p>
          <h2 className="text-balance font-serif text-3xl font-semibold md:text-5xl">
            A universe where you are the center
          </h2>
          <p className="mt-3 text-muted-foreground">
            Drag to orbit through the stars.
          </p>
        </div>

        <div className="glow-soft h-[420px] w-full overflow-hidden rounded-3xl border border-border md:h-[560px]">
          <GalaxyScene />
        </div>
      </div>
    </section>
  )
}
