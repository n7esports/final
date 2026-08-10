# 🎉 15 September Birthday Experience

A cinematic, interactive birthday countdown and celebration website built with Next.js 16, React 19, Tailwind CSS v4, and Framer Motion.

## 🚀 Features

- **Live Countdown** — Counts down to September 15 at midnight
- **Cinematic Timeline** — 7-scene animation sequence (GSAP-style)
- **Glass Morphism UI** — Modern frosted glass effects
- **Dark/Light Theme** — Automatic theme switching with next-themes
- **Interactive Experiences** — Draggable polaroid board, page-flip scrapbook, 3D galaxy gallery
- **Confetti & Fireworks** — Celebration effects on countdown complete
- **Developer Mode** — Skip button for testing (remove before deploy)
- **Responsive Design** — Mobile-first, optimized for all devices

## 🛠 Tech Stack

- **Framework:** Next.js 16.3.0
- **Styling:** Tailwind CSS 4.3.3
- **Animation:** Framer Motion 13.0.0
- **3D Graphics:** Three.js + React Three Fiber
- **Effects:** canvas-confetti
- **UI Components:** shadcn/ui, Base UI
- **Theme:** next-themes
- **Deployment:** Vercel

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/n7esports/15-September.git
cd 15-September

# Install dependencies (using pnpm)
pnpm install

# Run dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the countdown.

## 🎯 Configuration

### Change the Birthday Date

Edit `app/page.tsx` line 25:

```tsx
const BIRTHDAY_DATE = new Date(2024, 8, 15, 0, 0, 0) // September 15, 2024
```

Update the year/month/day as needed. The countdown automatically rolls to next year if the date has passed.

### Remove Developer Skip Button

When ready for production, delete these lines from `components/birthday/countdown.tsx` (around line 259–266):

```tsx
{/* Developer Skip Button (remove after testing/deployment) */}
<motion.button
  onClick={skipToExperience}
  // ... rest of button
</motion.button>
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com/new)
3. Vercel auto-detects Next.js and configures build settings
4. Click **Deploy**

No additional config needed — `vercel.json` and `tailwind.config.ts` handle everything.

### Environment Variables

None required for basic deployment. Optional:

```env
NEXT_TELEMETRY_DISABLED=1
```

## 📁 Project Structure

```
├── app/
│   ├── page.tsx          # Main page with phase state machine
│   ├── layout.tsx        # Root layout, fonts, ThemeProvider
│   └── globals.css       # Tailwind styles + CSS variables
├── components/birthday/
│   ├── countdown.tsx     # Countdown timer (GSAP-style scenes)
│   ├── celebration.tsx   # Birthday message + confetti
│   ├── BackgroundEffects.tsx    # Animated gradients + particles
│   ├── CelebrationEffects.tsx   # Fireworks + confetti
│   ├── hero.tsx          # Hero section with ribbon carousel
│   ├── polaroid-board.tsx       # Draggable memory cards
│   ├── scrapbook.tsx    # Page-flip photo scrapbook
│   ├── galaxy-gallery.tsx       # 3D rotating photo gallery
│   ├── floating-hearts.tsx      # Ambient floating animation
│   └── theme-toggle.tsx  # Dark/light mode switcher
├── lib/
│   ├── birthday-data.ts  # Memory data (6 photos + captions)
│   └── utils.ts          # Helper functions
├── public/
│   ├── images/           # 6 memory photos (1.5–2.5 MB each)
│   ├── icon.svg          # Favicon
│   └── standalone.html   # Self-contained HTML version
├── tailwind.config.ts    # Tailwind configuration
├── postcss.config.mjs    # PostCSS for Tailwind
├── next.config.mjs       # Next.js configuration
└── vercel.json          # Vercel deployment config
```

## 🎬 Animation Timeline

**Scene 1 (0s → 1s):** Hero text fades up, countdown card scales in
**Scene 2 (1s → ∞):** Ambient particles float, gradients shift, card breathes
**Scene 3 (Last 10s):** Countdown pulses, scale builds tension
**Scene 4 (0s Hit):** Flash + radial glow burst
**Scene 5 (Celebration):** Confetti falls, fireworks expand
**Scene 6 (+2.8s):** Birthday message fades in
**Scene 7 (+4s):** Idle sparkle loop, text glow shimmer

## 🐛 Troubleshooting

### Build Error: "Cannot apply unknown utility class `bg-background`"

✅ **Fixed** — `tailwind.config.ts` now properly maps CSS variables to Tailwind classes.

### Countdown auto-skips to 00:00:00

✅ **Fixed** — Timer now correctly computes time until Sept 15 (not hardcoded).

### Theme not persisting

✅ **Fixed** — `next-themes` with localStorage integration handles dark/light mode.

### RAF memory leak (particles not cleaning up)

✅ **Fixed** — `BackgroundEffects.tsx` now properly cancels animation frames on unmount.

## 📝 License

Open source. Use freely for birthdays, celebrations, or as a template.

## 🙌 Credits

Built with love using Next.js, Tailwind, Framer Motion, and a whole lotta confetti.

---

**Ready to celebrate? Deploy to Vercel and share the link!** 🎉
