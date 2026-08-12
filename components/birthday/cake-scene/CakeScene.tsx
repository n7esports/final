'use client'

import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import BalloonSystem from './BalloonSystem'
import ConfettiSystem from './ConfettiSystem'
import BackgroundDecor from './BackgroundDecor'
import { Moon, Sun, Volume2, VolumeX, Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Realistic Candle Component (Smaller, Properly Sized)
function Candle3D({ 
  position, 
  isLit, 
  delay,
  onBlow 
}: { 
  position: [number, number, number]; 
  isLit: boolean; 
  delay: number;
  onBlow?: () => void;
}) {
  const flameRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const smokeRef = useRef<THREE.Group>(null)
  const [isBlown, setIsBlown] = useState(false)

  // Smoke particles when blown
  useEffect(() => {
    if (!isLit && smokeRef.current) {
      setIsBlown(true)
      // Trigger smoke animation
      const particles = smokeRef.current.children
      particles.forEach((particle, i) => {
        const mesh = particle as THREE.Mesh
        const startY = mesh.position.y
        const startX = mesh.position.x
        const delay2 = i * 0.1
        
        setTimeout(() => {
          // Animate smoke rising
          const animateSmoke = () => {
            if (mesh.position.y > startY + 3) return
            mesh.position.y += 0.02
            mesh.position.x += (Math.random() - 0.5) * 0.01
            mesh.position.z += (Math.random() - 0.5) * 0.01
            mesh.scale.x += 0.002
            mesh.scale.y += 0.002
            const opacity = 1 - (mesh.position.y - startY) / 3
            if (mesh.material) {
              (mesh.material as THREE.MeshStandardMaterial).opacity = opacity * 0.6
            }
            requestAnimationFrame(animateSmoke)
          }
          animateSmoke()
        }, delay2 * 1000)
      })
    }
  }, [isLit])

  // Flame animation
  useEffect(() => {
    if (!isLit || !flameRef.current || !glowRef.current) return

    let time = 0
    const animateFlame = () => {
      if (!flameRef.current || !glowRef.current) return
      
      time += 0.05
      const flicker = Math.sin(time * 15) * 0.08 + Math.sin(time * 23) * 0.05
      const flicker2 = Math.sin(time * 18 + 1) * 0.06
      
      flameRef.current.scale.x = 1 + flicker
      flameRef.current.scale.y = 1 + flicker2 * 0.5
      flameRef.current.position.x = Math.sin(time * 12) * 0.02
      flameRef.current.position.z = Math.cos(time * 14) * 0.02
      
      glowRef.current.scale.x = 1 + Math.sin(time * 8) * 0.05
      glowRef.current.scale.y = 1 + Math.sin(time * 10) * 0.05
      
      requestAnimationFrame(animateFlame)
    }

    const timeout = setTimeout(animateFlame, delay * 1000)
    return () => clearTimeout(timeout)
  }, [isLit, delay])

  return (
    <group position={position}>
      {/* Candle Stick - Thinner and smaller */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
        <meshStandardMaterial 
          color="#f5e6d3" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Candle Top (wax) */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.04, 0.03, 8]} />
        <meshStandardMaterial 
          color="#f0d5c0" 
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Wick */}
      <mesh position={[0, 0.63, 0]}>
        <cylinderGeometry args={[0.005, 0.008, 0.04, 4]} />
        <meshStandardMaterial color="#333" roughness={1} />
      </mesh>

      {/* Flame - Smaller */}
      {isLit && (
        <>
          {/* Outer Flame */}
          <mesh 
            ref={flameRef}
            position={[0, 0.7, 0]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color="#ff6b00" 
              emissive="#ff4400"
              emissiveIntensity={2}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Inner Flame */}
          <mesh 
            position={[0, 0.72, 0]}
            scale={[0.6, 0.7, 0.6]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial 
              color="#ffdd00" 
              emissive="#ffaa00"
              emissiveIntensity={3}
              transparent
              opacity={0.9}
            />
          </mesh>

          {/* Core Flame */}
          <mesh 
            position={[0, 0.74, 0]}
            scale={[0.3, 0.4, 0.3]}
          >
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#ffffff"
              emissiveIntensity={4}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Glow */}
          <mesh 
            ref={glowRef}
            position={[0, 0.65, 0]}
          >
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial 
              color="#ff6600" 
              emissive="#ff4400"
              emissiveIntensity={0.3}
              transparent
              opacity={0.1}
            />
          </mesh>

          <pointLight 
            position={[0, 0.7, 0]} 
            color="#ff6600" 
            intensity={0.3} 
            distance={1.5}
          />
        </>
      )}

      {/* Smoke Particles */}
      <group ref={smokeRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh 
            key={i}
            position={[
              (Math.random() - 0.5) * 0.1,
              0.7 + Math.random() * 0.1,
              (Math.random() - 0.5) * 0.1
            ]}
          >
            <sphereGeometry args={[0.02 + Math.random() * 0.02, 4, 4]} />
            <meshStandardMaterial 
              color="#cccccc" 
              transparent 
              opacity={0}
              roughness={1}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// 3D Cake Component with Candles
function Cake3D({ blown, isDarkTheme, onCandleBlow }: { 
  blown: boolean; 
  isDarkTheme: boolean;
  onCandleBlow?: () => void;
}) {
  const { scene } = useGLTF('/models/cake.glb')
  const groupRef = useRef<THREE.Group>(null)
  
  useEffect(() => {
    if (scene) {
      // Scale up the cake (2x larger)
      scene.scale.set(2.5, 2.5, 2.5)
      scene.position.set(0, -0.5, 0)
      
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [scene])

  // Candle positions - ON TOP of the cake (adjusted y to sit on cake surface)
  const candlePositions: [number, number, number][] = [
    [-0.5, 1.0, -0.3],
    [-0.3, 1.0, -0.5],
    [0, 1.0, -0.6],
    [0.3, 1.0, -0.5],
    [0.5, 1.0, -0.3],
    [0.4, 1.0, 0.2],
    [0, 1.0, 0.4],
    [-0.4, 1.0, 0.2],
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
          onBlow={onCandleBlow}
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
  const [isListening, setIsListening] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

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

  // Voice Recognition for "Blow"
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')
          .toLowerCase()
        
        if (transcript.includes('blow') || transcript.includes('blow out') || transcript.includes('candle')) {
          if (wishMade && !blown) {
            handleBlowCandles()
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [wishMade, blown])

  // Microphone audio level detection
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyserRef.current = analyser

      setIsListening(true)

      // Monitor audio levels for blow detection
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const checkLevel = () => {
        if (!isListening || !analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setAudioLevel(average)
        
        // If loud sound detected (blowing), trigger blow
        if (average > 100 && wishMade && !blown) {
          handleBlowCandles()
        }
        
        requestAnimationFrame(checkLevel)
      }
      checkLevel()

      // Start voice recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

    } catch (error) {
      console.log('Microphone access denied:', error)
    }
  }

  const stopListening = () => {
    setIsListening(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (analyserRef.current) {
      analyserRef.current = null
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleMakeWish = () => {
    setShowWishModal(true)
  }

  const handleConfirmWish = () => {
    if (wish.trim()) {
      setWishMade(true)
      setShowWishModal(false)
      // Start listening for blow after wish is made
      if (!isListening) {
        startListening()
      }
    }
  }

  const handleBlowCandles = () => {
    if (!blown) {
      setBlown(true)
      stopListening()
      // Show celebration message
      setTimeout(() => {
        setShowCelebration(true)
      }, 500)
    }
  }

  const handleMouseBlow = () => {
    if (wishMade && !blown) {
      handleBlowCandles()
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

  return (
    <div
      className={`relative min-h-[700px] flex flex-col items-center justify-center overflow-hidden transition-colors duration-300 p-4 ${
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
      <div className="w-full max-w-4xl h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl mb-4 relative">
        <Canvas
          camera={{ position: [2, 3, 6], fov: 40 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-5, 5, 5]} intensity={0.5} />
          <spotLight position={[0, 5, 0]} intensity={0.8} />
          <hemisphereLight groundColor="#443366" intensity={0.3} />
          
          <Cake3D blown={blown} isDarkTheme={isDarkTheme} onCandleBlow={handleBlowCandles} />
          
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate={false}
            minPolarAngle={0.3}
            maxPolarAngle={1.0}
            minAzimuthAngle={-0.5}
            maxAzimuthAngle={0.5}
            target={[0, 0.5, 0]}
            enableDamping={true}
            dampingFactor={0.05}
          />
          
          <Environment preset="studio" />
        </Canvas>

        {/* Click to Blow overlay */}
        {wishMade && !blown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/30 backdrop-blur-sm p-4 rounded-2xl text-center max-w-sm pointer-events-auto cursor-pointer"
              onClick={handleMouseBlow}
            >
              <p className="text-white text-lg font-semibold">
                💨 Click here or say "Blow" to blow the candles!
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-white/70 text-sm">
                  {isListening ? 'Listening...' : 'Microphone off'}
                </span>
                {audioLevel > 50 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-1 bg-green-400 rounded-full"
                        style={{ 
                          height: `${Math.min(audioLevel / 20, 20)}px`,
                          opacity: audioLevel > 50 + i * 10 ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Celebration overlay */}
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
            🕯️ Blow the candles! (Click on screen or use microphone)
          </p>
        )}
        {blown && (
          <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
            🎶 Happy Birthday! Enjoy the celebration! 🎶
          </p>
        )}
      </div>

      {/* Microphone Toggle Button */}
      {wishMade && !blown && (
        <motion.button
          onClick={toggleListening}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`mb-4 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg flex items-center gap-2 ${
            isListening
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
        >
          {isListening ? <Mic size={16} /> : <MicOff size={16} />}
          {isListening ? 'Listening for "Blow"' : 'Enable Microphone'}
        </motion.button>
      )}

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
      </div>

      {/* Balloons and Confetti */}
      <BalloonSystem show={blown} isDarkTheme={isDarkTheme} />
      <ConfettiSystem show={blown} />
    </div>
  )
}
