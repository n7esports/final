'use client'

import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import BalloonSystem from './BalloonSystem'
import ConfettiSystem from './ConfettiSystem'
import BackgroundDecor from './BackgroundDecor'
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Realistic Candle Component
function Candle3D({ position, isLit, delay }: { position: [number, number, number]; isLit: boolean; delay: number }) {
  const candleRef = useRef<THREE.Group>(null)
  const flameRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    if (candleRef.current) {
      candleRef.current.position.set(position[0], position[1], position[2])
    }
  }, [position])

  // Flame animation
  useEffect(() => {
    if (!isLit || !flameRef.current || !glowRef.current) return

    let time = 0
    const animateFlame = () => {
      if (!flameRef.current || !glowRef.current) return
      
      time += 0.05
      const flicker = Math.sin(time * 15) * 0.08 + Math.sin(time * 23) * 0.05
      const flicker2 = Math.sin(time * 18 + 1) * 0.06
      
      // Flame scale flicker
      flameRef.current.scale.x = 1 + flicker
      flameRef.current.scale.y = 1 + flicker2 * 0.5
      
      // Flame position wobble
      flameRef.current.position.x = Math.sin(time * 12) * 0.03
      flameRef.current.position.z = Math.cos(time * 14) * 0.03
      
      // Glow pulse
      glowRef.current.scale.x = 1 + Math.sin(time * 8) * 0.05
      glowRef.current.scale.y = 1 + Math.sin(time * 10) * 0.05
      
      requestAnimationFrame(animateFlame)
    }

    const timeout = setTimeout(animateFlame, delay * 1000)
    return () => clearTimeout(timeout)
  }, [isLit, delay])

  return (
    <group ref={candleRef}>
      {/* Candle Stick */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 1.2, 8]} />
        <meshStandardMaterial 
          color="#f5e6d3" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Candle Top (wax) */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.05, 8]} />
        <meshStandardMaterial 
          color="#f0d5c0" 
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Candle Stripes (decorative) */}
      {[0.2, 0.6, 1.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.09, 0.015, 6, 12]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? "#e8d5c4" : "#d4c4b4"} 
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* Wick */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.01, 0.015, 0.06, 4]} />
        <meshStandardMaterial color="#333" roughness={1} />
      </mesh>

      {/* Flame */}
      {isLit && (
        <>
          {/* Outer Flame (orange) */}
          <mesh 
            ref={flameRef}
            position={[0, 1.35, 0]}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial 
              color="#ff6b00" 
              emissive="#ff4400"
              emissiveIntensity={2}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Inner Flame (yellow) */}
          <mesh 
            position={[0, 1.38, 0]}
            scale={[0.6, 0.7, 0.6]}
          >
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial 
              color="#ffdd00" 
              emissive="#ffaa00"
              emissiveIntensity={3}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Core Flame (white) */}
          <mesh 
            position={[0, 1.42, 0]}
            scale={[0.3, 0.4, 0.3]}
          >
            <sphereGeometry args={[0.05, 6, 6]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff"
              emissiveIntensity={4}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Glow Light */}
          <mesh 
            ref={glowRef}
            position={[0, 1.3, 0]}
          >
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial 
              color="#ff6600" 
              emissive="#ff4400"
              emissiveIntensity={0.5}
              transparent
              opacity={0.15}
            />
          </mesh>

          {/* Point Light for realistic illumination */}
          <pointLight 
            position={[0, 1.4, 0]} 
            color="#ff6600" 
            intensity={0.5} 
            distance={2}
          />
        </>
      )}
    </group>
  )
}

// 3D Cake Component with Candles
function Cake3D({ blown, isDarkTheme }: { blown: boolean; isDarkTheme: boolean }) {
  const { scene } = useGLTF('/models/cake.glb')
  const groupRef = useRef<THREE.Group>(null)
  
  useEffect(() => {
    if (scene) {
      // Scale and position the model
      scene.scale.set(1.5, 1.5, 1.5)
      scene.position.set(0, -0.3, 0)
      
      // Make sure the model is visible
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [scene])

  // Candle positions on top of cake (circular arrangement)
  const candlePositions: [number, number, number][] = [
    [-0.6, 1.2, -0.4],
    [-0.4, 1.2, -0.7],
    [0, 1.2, -0.8],
    [0.4, 1.2, -0.7],
    [0.6, 1.2, -0.4],
    [0.5, 1.2, 0.3],
    [0, 1.2, 0.5],
    [-0.5, 1.2, 0.3],
  ]

  return (
    <group ref={groupRef}>
      {/* Cake Model */}
      <primitive object={scene} />
      
      {/* Candles on top */}
      {candlePositions.map((pos, index) => (
        <Candle3D 
          key={index}
          position={pos}
          isLit={!blown}
          delay={index * 0.1}
        />
      ))}
    </group>
  )
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
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} />
          <spotLight position={[0, 5, 0]} intensity={0.8} />
          <hemisphereLight groundColor="#443366" intensity={0.3} />
          
          {/* 3D Cake with Candles */}
          <Cake3D blown={blown} isDarkTheme={isDarkTheme} />
          
          {/* Orbit Controls - LIMITED ROTATION */}
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={false}  // Disabled - no 360 rotation
            minPolarAngle={0.5}
            maxPolarAngle={1.2}
            minAzimuthAngle={-0.8}  // Limit left rotation
            maxAzimuthAngle={0.8}   // Limit right rotation
            target={[0, 0.5, 0]}
            enableDamping={true}
            dampingFactor={0.05}
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
            <div className={`backdrop-blur-sm p-6 rounded-2xl text-center max-w-md ${
              isDarkTheme ? 'bg-black/50' : 'bg-white/50'
            }`}>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
                🎉 Happy Birthday! 🎉
              </h3>
              {wish && (
                <p className={`mt-2 italic ${isDarkTheme ? 'text-white/90' : 'text-gray-700'}`}>
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

      {/* Balloons and Confetti */}
      <BalloonSystem show={blown} isDarkTheme={isDarkTheme} />
      <ConfettiSystem show={blown} />
    </div>
  )
}
