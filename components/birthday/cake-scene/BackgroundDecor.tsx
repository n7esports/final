"use client"

export default function BackgroundDecor() {
  return (
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-purple-900 to-pink-900">
      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,150,0.3),transparent)]" />

      {/* Text */}
      <div className="absolute top-10 w-full text-center text-4xl font-bold text-pink-300">
        HAPPY BIRTHDAY
      </div>
    </div>
  )
}
