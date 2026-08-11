'use client'

import { useState, useEffect, useRef } from 'react'
import { useCandleState } from './useCandleState'
import Cake from './Cake'
import BalloonSystem from './BalloonSystem'
import ConfettiSystem from './ConfettiSystem'
import BackgroundDecor from './BackgroundDecor'
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CakeScene() {
  const { blown, blowCandles } = useCandleState()
  const [showWishModal, setShowWishModal] = useState(false)
  const [wish, setWish] = useState('')
  const [wishMade, setWishMade] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [modelError, setModelError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Initialize audio on component mount
  useEffect(() => {
    const audioElement = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
    audioElement.volume = 0.3
    audioElement.loop = true
    audioRef.current = audioElement

    // Set loading timeout
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      clearTimeout(timer)
    }
  }, [])

  // Auto-play music when candles are blown
  useEffect(() => {
    if (blown && audioRef.current && !isMusicPlaying) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        console.log('Audio playback failed:', error)
      })
      setIsMusicPlaying(true)
    }
  }, [blown, isMusicPlaying])

  const handleMakeWish = () => {
    setShowWishModal(true)
  }

  const handleConfirmWish = () => {
    if (wish.trim()) {
      setWishMade(true)
      setShowWishModal(false)
      setTimeout(() => {
        blowCandles()
      }, 500)
    }
  }

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme)
  }

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause()
        setIsMusicPlaying(false)
      } else {
        audioRef.current.play()
          .then(() => setIsMusicPlaying(true))
          .catch((error) => {
            console.log('Music playback failed:', error)
          })
      }
    }
  }

  const handleIframeError = () => {
    setModelError(true)
    setIsLoading(false)
  }

  return (
    <div
      className={`relative min-h-[600px] flex flex-col items-center justify-center overflow-hidden transition-colors duration-300 p-4 ${
        isDarkTheme
          ? 'bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white'
          : 'bg-gradient-to-b from-blue-50 via-pink-50 to-blue-50 text-slate-900'
      }`}
    >
      <BackgroundDecor isDarkTheme={isDarkTheme} />

      {/* Theme Toggle Button */}
      <motion.button
        onClick={toggleTheme}
        className={`absolute top-4 right-20 p-3 rounded-full transition-colors z-20 ${
          isDarkTheme
            ? 'bg-white/10 hover:bg-white/20 text-yellow-300'
            : 'bg-slate-900/10 hover:bg-slate-900/20 text-slate-900'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      {/* Music Toggle Button */}
      <motion.button
        onClick={toggleMusic}
        className={`absolute top-4 right-4 p-3 rounded-full transition-colors z-20 ${
          isDarkTheme
            ? 'bg-white/10 hover:bg-white/20 text-pink-400'
            : 'bg-slate-900/10 hover:bg-slate-900/20 text-pink-500'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle music"
      >
        {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </motion.button>

      {/* 3D Embedded Cake - With Error Handling */}
      <div className="w-full max-w-3xl h-80 md:h-[450px] rounded-xl overflow-hidden shadow-2xl mb-6 relative">
        {isLoading && (
          <div className={`absolute inset-0 flex items-center justify-center z-10 ${
            isDarkTheme ? 'bg-slate-800/80' : 'bg-gray-100/80'
          }`}>
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                Loading 3D Cake...
              </p>
            </div>
          </div>
        )}

        {!modelError ? (
          <iframe
            ref={iframeRef}
            title="Birthday Cake 3D Model"
            frameBorder="0"
            allowFullScreen
            mozAllowFullScreen={true}
            webkitAllowFullScreen={true}
            allow="autoplay; fullscreen; xr-spatial-tracking"
            xr-spatial-tracking="true"
            src="https://sketchfab.com/models/68b2ac53d5e142d190e2470f51f0b73f/embed?autostart=1&transparent=1&ui_theme=dark&preload=1"
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
            }}
            onLoad={() => setIsLoading(false)}
            onError={handleIframeError}
          />
        ) : (
          // Fallback: Static cake image or 2D cake
          <div className={`w-full h-full flex items-center justify-center ${
            isDarkTheme ? 'bg-slate-800' : 'bg-pink-50'
          }`}>
            <div className="text-center p-4">
              <div className="text-8xl mb-4">🎂</div>
              <h3 className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                Happy Birthday!
              </h3>
              <p className={`text-sm mt-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                🎉 Make a wish and celebrate! 🎉
              </p>
              {/* Show 2D cake as fallback */}
              <div className="mt-4">
                <Cake blown={blown} isDarkTheme={isDarkTheme} />
              </div>
            </div>
          </div>
        )}

        {/* Subtle gradient overlay */}
        <div 
          className={`absolute inset-0 pointer-events-none ${
            isDarkTheme 
              ? 'bg-gradient-to-t from-slate-900/30 via-transparent to-slate-900/20'
              : 'bg-gradient-to-t from-blue-50/30 via-transparent to-pink-50/20'
          }`}
        />
      </div>

      {/* Only show 2D cake if 3D model loads successfully, otherwise it's already shown as fallback */}
      {!modelError && <Cake blown={blown} isDarkTheme={isDarkTheme} />}

      {/* Wish Modal */}
      <AnimatePresence>
        {showWishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
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
                  : 'bg-white border border-pink-200'
              }`}
            >
              <h2
                className={`text-2xl md:text-3xl font-bold mb-4 text-center ${
                  isDarkTheme ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400' : 'text-purple-600'
                }`}
              >
                ✨ Make a Wish ✨
              </h2>

              <p className={`text-sm text-center mb-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                Close your eyes and make a wish from the heart...
              </p>

              <textarea
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="Type your wish here... 🙏"
                className={`w-full p-4 rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 ${
                  isDarkTheme
                    ? 'bg-slate-800 border-purple-500 focus:ring-purple-500 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-pink-300 focus:ring-pink-400 text-slate-900 placeholder-gray-500'
                }`}
                rows={4}
                autoFocus
              />

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmWish}
                  disabled={!wish.trim()}
                  className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all shadow-lg ${
                    wish.trim()
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  🎂 Make Wish
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6 flex-wrap justify-center">
        {!wishMade && !blown && (
          <motion.button
            onClick={handleMakeWish}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all shadow-lg ${
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
            className={`px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all shadow-lg text-white ${
              isDarkTheme
                ? 'bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600'
                : 'bg-gradient-to-r from-pink-400 via-red-400 to-orange-400 hover:from-pink-500 hover:via-red-500 hover:to-orange-500'
            }`}
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
          className="mt-6 text-center"
        >
          <h3
            className={`text-xl md:text-2xl font-bold ${
              isDarkTheme
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-500'
            }`}
          >
            🎉 Happy Birthday, Arfa! 🎉
          </h3>
          {wish && (
            <p className={`text-sm md:text-base mt-2 italic ${isDarkTheme ? 'text-gray-300' : 'text-slate-600'}`}>
              💫 {wish}
            </p>
          )}
        </motion.div>
      )}

      {/* Balloons and Confetti */}
      <BalloonSystem show={blown} isDarkTheme={isDarkTheme} />
      <ConfettiSystem show={blown} />
    </div>
  )
}
