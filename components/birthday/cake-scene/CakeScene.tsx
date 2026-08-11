'use client'

import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei'
import BalloonSystem from './BalloonSystem'
import ConfettiSystem from './ConfettiSystem'
import BackgroundDecor from './BackgroundDecor'
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// 3D Cake Component
function Cake3D({ blown, isDarkTheme }: { blown: boolean; isDarkTheme: boolean }) {
  const { scene } = useGLTF('/models/cake.glb')
  
  useEffect(() => {
    // Scale and position the model
    scene.scale.set(1.5, 1.5, 1.5)
    scene.position.set(0, -0.5, 0)
  }, [scene])

  return <primitive object={scene} />
}

export default function CakeScene() {
  const [blown, setBlown] = useState(false)
  const [showWishModal, setShowWishModal] = useState(false)
  const [wish, setWish] = useState('')
  const [wishMade, setWishMade] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio
  useEffect(() => {
    const audioElement = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3')
    audioElement.volume = 0.3
    audioElement.loop = true
    audioRef.current = audioElement

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Play music when candles are blown
  useEffect(() => {
    if (blown && audioRef.current && !isMusicPlaying) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
        .then(() => {
          setIsMusicPlaying(true)
          setShowCelebration(true)
        })
        .catch((error) => {
          console.log('Audio playback failed:', error)
        })
    }
  }, [blown, isMusicPlaying])

  const handleMakeWish = () => {
    setShowWishModal(true)
  }

  const handleConfirmWish = () => {
    if (wish.trim()) {
      setWishMade(true)
      setShowWishModal(false)
    }
  }

  const handleBlowCandles = () => {
    setBlown(true)
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

      {/* 3D Cake Canvas */}
      <div className="w-full max-w-4xl h-80 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-4 relative">
        <Canvas
          camera={{ position: [0, 2, 5], fov: 45 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} />
          <spotLight position={[0, 5, 0]} intensity={0.8} />
          
          <Cake3D blown={blown} isDarkTheme={isDarkTheme} />
          
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={!blown}
            autoRotateSpeed={2}
            minPolarAngle={0.3}
            maxPolarAngle={1.5}
          />
          
          <Environment preset="studio" />
        </Canvas>

        {/* Overlay message when blown */}
        {blown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/50 backdrop-blur-sm p-6 rounded-2xl text-center max-w-md">
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
                🎉 Happy Birthday! 🎉
              </h3>
              {wish && (
                <p className="text-white/90 mt-2 italic">
                  💫 {wish}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center mb-4">
        {!wishMade && !blown && (
          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            ✨ Make a wish to start the celebration!
          </p>
        )}
        {wishMade && !blown && (
          <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            🕯️ Now blow the candles!
          </p>
        )}
        {blown && (
          <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            🎶 Happy Birthday! Enjoy the celebration! 🎶
          </p>
        )}
      </div>

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
      <div className="flex gap-4 mt-2 flex-wrap justify-center">
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
            onClick={handleBlowCandles}
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

      {/* Balloons and Confetti (shown when blown) */}
      <BalloonSystem show={blown} isDarkTheme={isDarkTheme} />
      <ConfettiSystem show={blown} />
    </div>
  )
}
