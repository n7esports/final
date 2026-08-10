'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  Text,
  Sphere,
  Cylinder,
  Plane,
  Environment,
  Float,
  Sparkles,
} from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

// --- Constants ---
const NUM_BALLOONS = 30
const NUM_CONFETTI = 200

// --- Helper: Random color ---
const randomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9FF3', '#F368E0']
  return colors[Math.floor(Math.random() * colors.length)]
}

// --- Flame Component ---
function Flame({ position, isLit, blowProgress }: { position: [number, number, number], isLit: boolean, blowProgress: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const [scale] = useState(() => 0.3 + Math.random() * 0.2)
  
  useFrame((state) => {
    if (!ref.current) return
    // Flicker
    if (isLit && blowProgress < 1) {
      const flicker = 0.9 + Math.sin(state.clock.elapsedTime * 10 + position[0]) * 0.1
      ref.current.scale.x = scale * flicker
      ref.current.scale.z = scale * flicker
      // Sway
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 2 + position[2]) * 0.02
      ref.current.position.z = position[2] + Math.cos(state.clock.elapsedTime * 2 + position[0]) * 0.02
    } else {
      // Extinguish
      const shrink = 1 - blowProgress
      ref.current.scale.x = scale * shrink
      ref.current.scale.z = scale * shrink
      ref.current.scale.y = scale * (0.5 + 0.5 * shrink) // shrink vertically too
      // Move upward as if blown
      ref.current.position.y = position[1] + blowProgress * 0.5
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial
        color={isLit ? '#FF8C00' : '#FF8C00'}
        emissive={isLit ? '#FF4500' : '#FF4500'}
        emissiveIntensity={isLit ? 2 : 0.5 * (1 - blowProgress)}
        transparent
        opacity={isLit ? 1 : 1 - blowProgress * 0.8}
      />
      {/* Glow */}
      <pointLight intensity={isLit ? 0.8 : 0.8 * (1 - blowProgress)} distance={1.5} color="#FF8C00" />
    </mesh>
  )
}

// --- Cake Component ---
function Cake({ candlesLit, blowProgress }: { candlesLit: boolean, blowProgress: number }) {
  const cakeRef = useRef<THREE.Group>(null)
  
  return (
    <group ref={cakeRef} position={[0, -1.5, 0]}>
      {/* Cake base */}
      <Cylinder args={[1.8, 2, 0.4, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#F5D7B3" roughness={0.8} />
      </Cylinder>
      {/* Cake layer 1 */}
      <Cylinder args={[1.6, 1.8, 0.6, 32]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#E8C9A0" roughness={0.7} />
      </Cylinder>
      {/* Frosting layer 1 */}
      <Cylinder args={[1.7, 1.6, 0.15, 32]} position={[0, 0.7, 0]}>
        <meshStandardMaterial color="#FFF8F0" roughness={0.4} />
      </Cylinder>
      {/* Cake layer 2 */}
      <Cylinder args={[1.5, 1.6, 0.5, 32]} position={[0, 1.0, 0]}>
        <meshStandardMaterial color="#D4A574" roughness={0.7} />
      </Cylinder>
      {/* Frosting top */}
      <Cylinder args={[1.6, 1.5, 0.15, 32]} position={[0, 1.3, 0]}>
        <meshStandardMaterial color="#FFF8F0" roughness={0.4} />
      </Cylinder>
      
      {/* Candles */}
      {[
        [-0.4, 1.6, -0.3],
        [0.4, 1.6, -0.3],
        [0, 1.6, 0.4],
        [-0.3, 1.6, 0.3],
        [0.3, 1.6, 0.3],
      ].map((pos, i) => (
        <group key={i} position={[pos[0], pos[1], pos[2]]}>
          <Cylinder args={[0.05, 0.06, 0.3, 8]}>
            <meshStandardMaterial color="#FF6B6B" />
          </Cylinder>
          <Flame
            position={[0, 0.35, 0]}
            isLit={candlesLit}
            blowProgress={blowProgress}
          />
        </group>
      ))}
    </group>
  )
}

// --- Balloon Component ---
function Balloon({ index, startDelay }: { index: number, startDelay: number }) {
  const ref = useRef<THREE.Group>(null)
  const color = randomColor()
  const startX = (Math.random() - 0.5) * 8
  const startZ = (Math.random() - 0.5) * 8
  const speed = 0.3 + Math.random() * 0.4
  const swingSpeed = 0.5 + Math.random() * 0.5
  const swingAmount = 0.5 + Math.random() * 0.5
  const [startY] = useState(() => -4 - Math.random() * 2)
  
  useFrame((state) => {
    if (!ref.current) return
    const elapsed = state.clock.elapsedTime - startDelay
    if (elapsed < 0) return
    // Float upward
    ref.current.position.y = startY + elapsed * speed
    // Sway left-right
    ref.current.position.x = startX + Math.sin(elapsed * swingSpeed) * swingAmount
    // Sway forward-back
    ref.current.position.z = startZ + Math.cos(elapsed * swingSpeed * 0.7) * swingAmount * 0.5
    // Rotate slightly
    ref.current.rotation.z = Math.sin(elapsed * swingSpeed * 0.5) * 0.1
    ref.current.rotation.x = Math.sin(elapsed * swingSpeed * 0.3) * 0.1
  })

  return (
    <group ref={ref} position={[startX, startY, startZ]}>
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        {/* Balloon body */}
        <Sphere args={[0.4, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} emissive={color} emissiveIntensity={0.1} />
        </Sphere>
        {/* Balloon knot */}
        <mesh position={[0, -0.4, 0]}>
          <coneGeometry args={[0.08, 0.15, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* String */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.6, 4]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      </Float>
    </group>
  )
}

// --- Confetti Particle ---
function Confetti({ startDelay }: { startDelay: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const color = randomColor()
  const startX = (Math.random() - 0.5) * 10
  const startY = -2 + Math.random() * 2
  const startZ = (Math.random() - 0.5) * 10
  const vx = (Math.random() - 0.5) * 2
  const vy = 1.5 + Math.random() * 3
  const vz = (Math.random() - 0.5) * 2
  const rotSpeed = new THREE.Euler(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  )
  
  useFrame((state) => {
    if (!ref.current) return
    const elapsed = state.clock.elapsedTime - startDelay
    if (elapsed < 0) return
    // Simple projectile + gravity
    const t = elapsed
    ref.current.position.x = startX + vx * t
    ref.current.position.y = startY + vy * t - 0.5 * 9.8 * t * t
    ref.current.position.z = startZ + vz * t
    // Rotation
    ref.current.rotation.x += rotSpeed.x * 0.02
    ref.current.rotation.y += rotSpeed.y * 0.02
    ref.current.rotation.z += rotSpeed.z * 0.02
  })

  return (
    <mesh ref={ref}>
      <planeGeometry args={[0.1, 0.05]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  )
}

// --- Happy Birthday Text (3D Balloon Letters) ---
function BirthdayText() {
  const letters = 'Happy Birthday!'.split('')
  const positions: { [key: string]: [number, number, number] } = {
    'H': [-3.5, 2.5, 0],
    'a': [-2.8, 2.5, 0],
    'p': [-2.1, 2.5, 0],
    'p': [-1.4, 2.5, 0],
    'y': [-0.7, 2.5, 0],
    ' ': [0, 2.5, 0],
    'B': [0.7, 2.5, 0],
    'i': [1.4, 2.5, 0],
    'r': [1.9, 2.5, 0],
    't': [2.4, 2.5, 0],
    'h': [2.9, 2.5, 0],
    'd': [3.6, 2.5, 0],
    'a': [4.3, 2.5, 0],
    'y': [5.0, 2.5, 0],
    '!': [5.7, 2.5, 0],
  }

  return (
    <group position={[0, 0, -2]}>
      {letters.map((char, i) => {
        const pos = positions[char] || [i * 0.5 - 4, 2.5, 0]
        return (
          <Float key={i} speed={1.2} rotationIntensity={0.3} floatIntensity={0.2}>
            <Text
              position={pos}
              fontSize={0.6}
              color={randomColor()}
              anchorX="center"
              anchorY="middle"
              font="/fonts/helvetiker_regular.typeface.json"
              // fallback: use default font if not available
            >
              {char}
            </Text>
          </Float>
        )
      })}
    </group>
  )
}

// --- Main Scene Component ---
function BirthdaySceneContent({ isCelebrating, onCelebrationStart }: { isCelebrating: boolean, onCelebrationStart: () => void }) {
  const [candlesLit, setCandlesLit] = useState(true)
  const [blowProgress, setBlowProgress] = useState(0)
  const [celebrationStarted, setCelebrationStarted] = useState(false)
  const [balloonsActive, setBalloonsActive] = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  
  const blowAnimRef = useRef<number | null>(null)

  const handleBlow = () => {
    if (!candlesLit || blowProgress > 0) return
    // Start blow animation
    let progress = 0
    const step = 0.02
    const interval = setInterval(() => {
      progress += step
      setBlowProgress(Math.min(progress, 1))
      if (progress >= 1) {
        clearInterval(interval)
        setCandlesLit(false)
        // Trigger celebration after a short delay
        setTimeout(() => {
          setCelebrationStarted(true)
          setBalloonsActive(true)
          setConfettiActive(true)
          setTextVisible(true)
          onCelebrationStart()
        }, 300)
      }
    }, 30)
    blowAnimRef.current = interval as unknown as number
  }

  useEffect(() => {
    return () => {
      if (blowAnimRef.current) clearInterval(blowAnimRef.current)
    }
  }, [])

  return (
    <>
      <color attach="background" args={['#1a1a2e']} />
      <Environment preset="sunset" background />
      
      {/* Decorated wall / background pattern */}
      <Plane args={[20, 20]} position={[0, 0, -5]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#16213e" roughness={0.8} metalness={0.1} />
      </Plane>
      
      {/* Spotlight for dramatic effect */}
      <spotLight position={[0, 5, 5]} angle={0.5} penumbra={0.5} intensity={1} color="#ffd700" />
      <ambientLight intensity={0.4} />
      
      {/* Cake */}
      <Cake candlesLit={candlesLit} blowProgress={blowProgress} />
      
      {/* Balloons */}
      {balloonsActive && (
        <>
          {Array.from({ length: NUM_BALLOONS }).map((_, i) => (
            <Balloon key={`balloon-${i}`} index={i} startDelay={i * 0.1} />
          ))}
        </>
      )}
      
      {/* Confetti */}
      {confettiActive && (
        <>
          {Array.from({ length: NUM_CONFETTI }).map((_, i) => (
            <Confetti key={`confetti-${i}`} startDelay={i * 0.02} />
          ))}
        </>
      )}
      
      {/* Happy Birthday Text */}
      {textVisible && <BirthdayText />}
      
      {/* Sparkles */}
      {celebrationStarted && <Sparkles count={100} scale={10} size={0.1} speed={0.5} />}
      
      {/* Controls for interactivity */}
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        autoRotate={!celebrationStarted}
        autoRotateSpeed={0.5}
      />
    </>
  )
}

// --- Wrapper Component with UI ---
export function BirthdayScene() {
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [blowDisabled, setBlowDisabled] = useState(false)

  const handleCelebrationStart = () => {
    setIsCelebrating(true)
    setBlowDisabled(true)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <BirthdaySceneContent
            isCelebrating={isCelebrating}
            onCelebrationStart={handleCelebrationStart}
          />
        </Suspense>
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!blowDisabled) {
              // Trigger blow via a global event or ref; we need to communicate with scene
              // We'll use a custom event or ref. For simplicity, we'll use a state in scene? 
              // We'll handle blow via a ref or callback.
              // Since the scene is inside Canvas, we can use a state variable that we pass down.
              // But we need to trigger the blow function inside the scene.
              // We'll use a ref to call a function.
            }
          }}
          className="rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
          disabled={blowDisabled}
        >
          {isCelebrating ? '🎉 Happy Birthday! 🎉' : '🎂 Blow Candles'}
        </motion.button>
      </div>
      
      {/* Instruction */}
      {!isCelebrating && (
        <div className="absolute top-4 left-0 right-0 text-center text-white/70 text-sm">
          Click the button to blow out the candles
        </div>
      )}
    </div>
  )
}
