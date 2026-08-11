'use client'

import { useState, useEffect } from 'react'
import { useCandleState } from './useCandleState'
import Cake from './Cake'
import BalloonSystem from './BalloonSystem'
import ConfettiSystem from './ConfettiSystem'
import BackgroundDecor from './BackgroundDecor'
import { Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CakeScene() {
  const { blown, blowCandles } = useCandleState()
  const [showWishModal, setShowWishModal] = useState(false)
  const [wish, setWish] = useState('')
  const [wishMade, setWishMade] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  // Initialize happy birthday audio
  useEffect(() => {
    const audioElement = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==')
    
    // Use a proper happy birthday song from a CDN
    const birthdaySong = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
    birthdaySong.volume = 0.3
    
    setAudio(birthdaySong)

    return () => {
      if (birthdaySong) {
        birthdaySong.pause()
      }
    }
  }, [])

  // Auto-play music when candles are blown
  useEffect(() => {
    if (blown && audio && !isMusicPlaying) {
      audio.currentTime = 0
      audio.play().catch(() => {
        console.log('Audio playback failed - user may need to interact first')
      })
      setIsMusicPlaying(true)
    }
  }, [blown, audio, isMusicPlaying])

  const handleMakeWish = () => {
    setShowWishModal(true)
  }

  const handleConfirmWish = () => {
    setWishMade(true)
    setShowWishModal(false)
    // Auto-blow candles after wish is made
    setTimeout(() => {
      blowCandles()
    }, 500)
  }

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme)
  }

  const toggleMusic = () => {
    if (audio) {
      if (isMusicPlaying) {
        audio.pause()
        setIsMusicPlaying(false)
      } else {
        audio.play()
        setIsMusicPlaying(true)
      }
    }
  }

  return (
    <div
      className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden transition-colors duration-300 ${
        isDarkTheme
          ? 'bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white'
          : 'bg-gradient-to-b from-blue-50 via-pink-50 to-blue-50 text-slate-900'
      }`}
    >
      <BackgroundDecor isDarkTheme={isDarkTheme} />

      {/* Theme Toggle Button */}
      <motion.button
        onClick={toggleTheme}
        className={`absolute top-6 right-20 p-3 rounded-full transition-colors ${
          isDarkTheme
            ? 'bg-white/10 hover:bg-white/20 text-yellow-300'
            : 'bg-slate-900/10 hover:bg-slate-900/20 text-slate-900'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isDarkTheme ? <Sun size={24} /> : <Moon size={24} />}
      </motion.button>

      {/* Music Toggle Button */}
      <motion.button
        onClick={toggleMusic}
        className={`absolute top-6 right-6 p-3 rounded-full transition-colors ${
          isDarkTheme
            ? 'bg-white/10 hover:bg-white/20 text-pink-400'
            : 'bg-slate-900/10 hover:bg-slate-900/20 text-pink-500'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMusicPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.828 2.828a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.414-1.414A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" />
            </svg>
        )}
      </motion.button>

      {/* 3D Embedded Cake from Sketchfab */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl h-96 rounded-xl overflow-hidden shadow-2xl mb-8"
      >
        <iframe
          title="Chocolate Shaved Buttercream Cake"
          frameBorder="0"
          allowFullScreen
          mozAllowFullScreen={true}
          webkitAllowFullScreen={true}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          xr-spatial-tracking="true"
          src="https://sketchfab.com/models/6862f1f170b94eff935dde5f1d4c3bef/embed"
          style={{
            width: '100%',
            height: '100%',
            border: isDarkTheme ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(0,0,0,0.1)',
          }}
        />
      </motion.div>

      {/* Main Cake Display */}
      <Cake blown={blown} isDarkTheme={isDarkTheme} />

      {/* Wish Modal */}
      <AnimatePresence>
        {showWishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowWishModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl p-8 shadow-2xl max-w-md w-full ${
                isDarkTheme
                  ? 'bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30'
                  : 'bg-gradient-to-br from-white to-pink-50 border border-pink-200'
              }`}
            >
              <h2
                className={`text-3xl font-bold mb-6 text-center ${
                  isDarkTheme ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400' : 'text-purple-600'
                }`}
              >
                ✨ Make a Wish ✨
              </h2>

              <textarea
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="Close your eyes and make a wish... 🙏"
                className={`w-full p-4 rounded-lg mb-6 resize-none focus:outline-none focus:ring-2 ${
                  isDarkTheme
                    ? 'bg-slate-800 border-purple-500 focus:ring-purple-500 text-white placeholder-gray-400'
                    : 'bg-white border-pink-300 focus:ring-pink-400 text-slate-900 placeholder-gray-500'
                }`}
                rows={4}
              />

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowWishModal(false)}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                    isDarkTheme
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-slate-900'
                  }`}
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleConfirmWish}
                  className="flex-1 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-all shadow-lg"
                >
                  🎂 Make Wish & Blow
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 flex-wrap justify-center">
        {!wishMade && !blown && (
          <motion.button
            onClick={handleMakeWish}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg ${
              isDarkTheme
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                : 'bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white'
            }`}
          >
            🙏 Make a Wish
          </motion.button>
        )}

        {wishMade && !blown && (
          <motion.button
            onClick={blowCandles}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg ${
              isDarkTheme
                ? 'bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 hover:from-pink-500 hover:via-red-500 hover:to-orange-500'
            } text-white`}
          >
            💨 Blow the Candles!
          </motion.button>
        )}
      </div>

      {/* Celebration Message */}
      {blown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-8 text-2xl font-bold text-center ${
            isDarkTheme
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500'
          }`}
        >
          🎉 Happy Birthday! 🎉
          <p className={`text-lg mt-2 ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
            {wish ? `Your wish: "${wish}"` : 'Your wish has been made!'}
          </p>
        </motion.div>
      )}

      {/* Balloons and Confetti */}
      <BalloonSystem show={blown} isDarkTheme={isDarkTheme} />
      <ConfettiSystem show={blown} />
    </div>
  )
}
