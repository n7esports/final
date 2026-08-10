'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  OrbitControls,
  Text,
  Sphere,
  Cylinder,
  Environment,
  Float,
  Sparkles,
  Stars,
  MeshDistortMaterial,
} from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

// --- Random Color Generator ---
const randomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#FF9FF3', '#F368E0',
    '#FF4757', '#2ED573', '#1E90FF', '#FF6348'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// --- 3D Balloon Letter ---
function BalloonLetter({ char, position, color, index }: { char: string, position: [number, number, number], color: string, index: number }) {
  return (
    <Float
      speed={0.8 + Math.random() * 0.4}
      rotationIntensity={0.2}
      floatIntensity={0.3}
      position={position}
    >
      <Text
        fontSize={0.7}
        color={color}
        anchorX="center"
        anchorY="middle"
        font="/fonts/helvetiker_regular.typeface.json"
        outlineWidth={0.02}
        outlineColor="#ffffff"
        bevelEnabled
        bevelThickness={0.05}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={4}
        material-toneMapped={false}
        emissive={color}
        emissiveIntensity={0.2}
      >
        {char}
      </Text>
    </Float>
  )
}

// --- Birthday Text with Balloon Letters ---
function BirthdayBalloonText({ visible }: { visible: boolean }) {
  const text = "Happy Birthday!"
  const letters = text.split('')
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FF9FF3', '#FF4757', '#2ED573', '#1E90FF', '#FF6348', '#DDA0DD', '#F368E0', '#FF6B6B']
  
  const positions: { [key: string]: [number, number, number] } = {
    'H': [-4.5, 2.8, 0],
    'a': [-3.8, 2.8, 0],
    'p': [-3.1, 2.8, 0],
    'p': [-2.4, 2.8, 0],
    'y': [-1.7, 2.8, 0],
    ' ': [-0.9, 2.8, 0],
    'B': [-0.1, 2.8, 0],
    'i': [0.6, 2.8, 0],
    'r': [1.2, 2.8, 0],
    't': [1.8, 2.8, 0],
    'h': [2.4, 2.8, 0],
    'd': [3.1, 2.8, 0],
    'a': [3.8, 2.8, 0],
    'y': [4.5, 2.8, 0],
    '!': [5.2, 2.8, 0],
  }

  if (!visible) return null

  return (
    <group position={[0, 0.5, -3]}>
      {letters.map((char, i) => {
        const pos = positions[char] || [i * 0.5 - 3.5, 2.8, 0]
        const color = colors[i % colors.length]
        return (
          <BalloonLetter 
            key={i} 
            char={char} 
            position={pos} 
            color={color}
            index={i}
          />
        )
      })}
    </group>
  )
}

// --- Realistic Flame ---
function Flame({ position, isLit, blowProgress }: { position: [number, number, number], isLit: boolean, blowProgress: number }) {
  const flameRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [seed] = useState(() => Math.random() * 100)
  
  useFrame((state) => {
    if (!flameRef.current || !glowRef.current) return
    
    const time = state.clock.elapsedTime + seed
    
    if (isLit && blowProgress < 1) {
      // Realistic flame flicker
      const flicker = 0.85 + Math.sin(time * 12) * 0.08 + Math.sin(time * 8 + 1) * 0.05
      const swayX = Math.sin(time * 3 + position[0]) * 0.02
      const swayZ = Math.cos(time * 2.5 + position[2]) * 0.02
      
      flameRef.current.scale.set(
        flicker * 1.2,
        0.8 + Math.sin(time * 10) * 0.1,
        flicker * 1.2
      )
      flameRef.current.position.x = position[0] + swayX
      flameRef.current.position.z = position[2] + swayZ
      
      // Glow pulse
      glowRef.current.scale.set(
        1 + Math.sin(time * 5) * 0.1,
        1 + Math.sin(time * 4 + 1) * 0.1,
        1 + Math.sin(time * 5) * 0.1
      )
    } else {
      // Extinguish animation
      const progress = Math.min(blowProgress, 1)
      const shrink = 1 - progress
      
      flameRef.current.scale.set(
        1.2 * shrink * 0.3,
        0.8 * shrink * 0.5,
        1.2 * shrink * 0.3
      )
      flameRef.current.position.y = position[1] + progress * 0.3
      
      glowRef.current.scale.set(
        (1 + Math.sin(time * 5) * 0.1) * (1 - progress * 0.8),
        (1 + Math.sin(time * 4 + 1) * 0.1) * (1 - progress * 0.8),
        (1 + Math.sin(time * 5) * 0.1) * (1 - progress * 0.8)
      )
    }
  })

  if (!isLit && blowProgress >= 1) return null

  return (
    <group position={position}>
      {/* Flame inner core */}
      <mesh ref={flameRef} position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          color={isLit ? '#FF8C00' : '#FF6B00'}
          emissive={isLit ? '#FF4500' : '#FF6B00'}
          emissiveIntensity={isLit ? 2 : 0.5 * (1 - blowProgress)}
          transparent
          opacity={isLit ? 1 : 1 - blowProgress * 0.9}
        />
      </mesh>
      
      {/* Flame outer glow */}
      <mesh ref={glowRef} position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial
          color="#FF8C00"
          transparent
          opacity={isLit ? 0.3 : 0.3 * (1 - blowProgress)}
        />
      </mesh>
      
      {/* Point light for realistic illumination */}
      <pointLight
        intensity={isLit ? 0.5 : 0.5 * (1 - blowProgress)}
        distance={1.5}
        color="#FF8C00"
        position={[0, 0.2, 0]}
      />
    </group>
  )
}

// --- Realistic Cake ---
function RealisticCake({ candlesLit, blowProgress }: { candlesLit: boolean, blowProgress: number }) {
  return (
    <group position={[0, -1.5, 0]}>
      {/* Cake Stand */}
      <Cylinder args={[2.2, 2.0, 0.15, 32]} position={[0, -0.3, 0]}>
        <meshStandardMaterial color="#D4A574" roughness={0.5} metalness={0.3} />
      </Cylinder>
      <Cylinder args={[1.5, 1.8, 0.15, 32]} position={[0, -0.15, 0]}>
        <meshStandardMaterial color="#C4956A" roughness={0.5} metalness={0.3} />
      </Cylinder>
      
      {/* Bottom Layer */}
      <Cylinder args={[1.8, 2.0, 0.5, 32]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#F5D7B3" roughness={0.8} />
      </Cylinder>
      
      {/* Bottom Frosting */}
      <Cylinder args={[1.9, 1.8, 0.1, 32]} position={[0, 0.5, 0]}>
        <MeshDistortMaterial
          color="#FFF8F0"
          roughness={0.3}
          metalness={0.1}
          distort={0.3}
          speed={0.5}
        />
      </Cylinder>
      
      {/* Decorative piping bottom */}
      <Cylinder args={[1.85, 1.95, 0.08, 32]} position={[0, 0.45, 0]}>
        <meshStandardMaterial color="#FFE4D6" roughness={0.6} />
      </Cylinder>
      
      {/* Middle Layer */}
      <Cylinder args={[1.6, 1.8, 0.5, 32]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#E8C9A0" roughness={0.7} />
      </Cylinder>
      
      {/* Middle Frosting */}
      <Cylinder args={[1.7, 1.6, 0.1, 32]} position={[0, 1.0, 0]}>
        <MeshDistortMaterial
          color="#FFF8F0"
          roughness={0.3}
          metalness={0.1}
          distort={0.3}
          speed={0.5}
        />
      </Cylinder>
      
      {/* Top Layer */}
      <Cylinder args={[1.4, 1.6, 0.5, 32]} position={[0, 1.25, 0]}>
        <meshStandardMaterial color="#D4A574" roughness={0.7} />
      </Cylinder>
      
      {/* Top Frosting */}
      <Cylinder args={[1.5, 1.4, 0.12, 32]} position={[0, 1.5, 0]}>
        <MeshDistortMaterial
          color="#FFF8F0"
          roughness={0.3}
          metalness={0.1}
          distort={0.4}
          speed={0.6}
        />
      </Cylinder>
      
      {/* Top Piping */}
      <Cylinder args={[1.45, 1.55, 0.08, 32]} position={[0, 1.45, 0]}>
        <meshStandardMaterial color="#FFE4D6" roughness={0.6} />
      </Cylinder>
      
      {/* Decorative dots on sides */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const x = Math.cos(angle) * 1.75
        const z = Math.sin(angle) * 1.75
        return (
          <Sphere key={`dot-${i}`} args={[0.05, 8, 8]} position={[x, 0.25, z]}>
            <meshStandardMaterial color="#FF6B6B" emissive="#FF6B6B" emissiveIntensity={0.2} />
          </Sphere>
        )
      })}
      
      {/* Roses on top */}
      {[[-0.6, 1.62, -0.6], [0.6, 1.62, -0.6], [0, 1.62, 0.7]].map((pos, i) => (
        <group key={`rose-${i}`} position={[pos[0], pos[1], pos[2]]}>
          <Sphere args={[0.08, 8, 8]}>
            <meshStandardMaterial color="#FF6B6B" roughness={0.4} />
          </Sphere>
          <Sphere args={[0.06, 8, 8]} position={[0.05, 0.03, 0]}>
            <meshStandardMaterial color="#FF4757" roughness={0.4} />
          </Sphere>
          <Sphere args={[0.06, 8, 8]} position={[-0.04, 0.03, 0]}>
            <meshStandardMaterial color="#FF4757" roughness={0.4} />
          </Sphere>
        </group>
      ))}
      
      {/* Candles */}
      {[
        [-0.5, 1.7, -0.3],
        [0.5, 1.7, -0.3],
        [0, 1.7, 0.4],
        [-0.4, 1.7, 0.3],
        [0.4, 1.7, 0.3],
      ].map((pos, i) => (
        <group key={`candle-${i}`} position={[pos[0], pos[1], pos[2]]}>
          {/* Candle body */}
          <Cylinder args={[0.04, 0.05, 0.35, 8]}>
            <meshStandardMaterial 
              color={['#FF6B6B', '#4ECDC4', '#FFEAA7', '#FF9FF3', '#45B7D1'][i]} 
              emissive={['#FF6B6B', '#4ECDC4', '#FFEAA7', '#FF9FF3', '#45B7D1'][i]}
              emissiveIntensity={0.1}
              roughness={0.3}
            />
          </Cylinder>
          
          {/* Candle stripe */}
          <Cylinder args={[0.045, 0.055, 0.03, 8]} position={[0, 0.1, 0]}>
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </Cylinder>
          <Cylinder args={[0.045, 0.055, 0.03, 8]} position={[0, 0.22, 0]}>
            <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
          </Cylinder>
          
          {/* Flame */}
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

// --- Floating Balloon ---
function FloatingBalloon({ index, delay }: { index: number, delay: number }) {
  const ref = useRef<THREE.Group>(null)
  const color = randomColor()
  const startX = (Math.random() - 0.5) * 12
  const startZ = (Math.random() - 0.5) * 12
  const speed = 0.2 + Math.random() * 0.3
  const swingSpeed = 0.3 + Math.random() * 0.4
  const swingAmount = 0.5 + Math.random() * 0.5
  const startY = -5 - Math.random() * 3
  const size = 0.3 + Math.random() * 0.2
  
  useFrame((state) => {
    if (!ref.current) return
    const elapsed = state.clock.elapsedTime - delay
    if (elapsed < 0) return
    
    ref.current.position.y = startY + elapsed * speed
    ref.current.position.x = startX + Math.sin(elapsed * swingSpeed) * swingAmount
    ref.current.position.z = startZ + Math.cos(elapsed * swingSpeed * 0.7) * swingAmount * 0.5
    ref.current.rotation.z = Math.sin(elapsed * swingSpeed * 0.5) * 0.1
    ref.current.rotation.x = Math.sin(elapsed * swingSpeed * 0.3) * 0.1
  })

  return (
    <group ref={ref} position={[startX, startY, startZ]}>
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
        {/* Balloon body */}
        <Sphere args={[size, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color={color} 
            roughness={0.2} 
            metalness={0.1} 
            emissive={color} 
            emissiveIntensity={0.1}
            transparent
            opacity={0.9}
          />
        </Sphere>
        {/* Balloon highlight */}
        <Sphere args={[size * 0.3, 8, 8]} position={[size * 0.3, size * 0.3, size * 0.3]}>
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
        </Sphere>
        {/* Knot */}
        <mesh position={[0, -size * 0.9, 0]}>
          <coneGeometry args={[size * 0.2, size * 0.3, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* String */}
        <mesh position={[0, -size * 1.2, 0]}>
          <cylinderGeometry args={[0.005, 0.005, size * 0.8, 4]} />
          <meshStandardMaterial color="#999" transparent opacity={0.5} />
        </mesh>
      </Float>
    </group>
  )
}

// --- Confetti Particle ---
function ConfettiParticle({ delay }: { delay: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const color = randomColor()
  const startX = (Math.random() - 0.5) * 15
  const startY = -3 + Math.random() * 2
  const startZ = (Math.random() - 0.5) * 15
  const vx = (Math.random() - 0.5) * 3
  const vy = 1 + Math.random() * 4
  const vz = (Math.random() - 0.5) * 3
  const rotSpeed = new THREE.Euler(
    (Math.random() - 0.5) * 15,
    (Math.random() - 0.5) * 15,
    (Math.random() - 0.5) * 15
  )
  const size = 0.03 + Math.random() * 0.05
  
  useFrame((state) => {
    if (!ref.current) return
    const elapsed = state.clock.elapsedTime - delay
    if (elapsed < 0) return
    
    const t = elapsed
    ref.current.position.x = startX + vx * t
    ref.current.position.y = startY + vy * t - 0.5 * 9.8 * t * t
    ref.current.position.z = startZ + vz * t
    
    ref.current.rotation.x += rotSpeed.x * 0.02
    ref.current.rotation.y += rotSpeed.y * 0.02
    ref.current.rotation.z += rotSpeed.z * 0.02
  })

  return (
    <mesh ref={ref}>
      <planeGeometry args={[size, size * 0.5]} />
      <meshStandardMaterial color={color} side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.1} />
    </mesh>
  )
}

// --- Main Scene ---
function BirthdaySceneContent() {
  const [candlesLit, setCandlesLit] = useState(true)
  const [blowProgress, setBlowProgress] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const [balloonsActive, setBalloonsActive] = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  
  const blowAnimRef = useRef<NodeJS.Timeout | null>(null)

  const handleBlow = () => {
    if (!candlesLit || blowProgress > 0) return
    
    let progress = 0
    const interval = setInterval(() => {
      progress += 0.015
      setBlowProgress(Math.min(progress, 1))
      
      if (progress >= 1) {
        clearInterval(interval)
        setCandlesLit(false)
        
        setTimeout(() => {
          setCelebrating(true)
          setBalloonsActive(true)
          setConfettiActive(true)
          setTextVisible(true)
        }, 400)
      }
    }, 25)
    blowAnimRef.current = interval
  }

  useEffect(() => {
    return () => {
      if (blowAnimRef.current) clearInterval(blowAnimRef.current)
    }
  }, [])

  // Expose handleBlow to parent
  useEffect(() => {
    (window as any).blowCandles = handleBlow
    return () => {
      delete (window).blowCandles
    }
  }, [handleBlow])

  return (
    <>
      {/* Background gradient */}
      <color attach="background" args={['#0a0a1a']} />
      
      {/* Environment and Lighting */}
      <Environment preset="night" background={false} />
      
      <ambientLight intensity={0.3} color="#404060" />
      <directionalLight position={[5, 10, 5]} intensity={1} color="#ffd700" />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#4466ff" />
      <pointLight position={[0, 5, 2]} intensity={0.5} color="#ff6b6b" />
      
      {/* Stars background */}
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
      
      {/* Cake */}
      <RealisticCake candlesLit={candlesLit} blowProgress={blowProgress} />
      
      {/* Balloons */}
      {balloonsActive && (
        <>
          {Array.from({ length: 25 }).map((_, i) => (
            <FloatingBalloon key={`balloon-${i}`} index={i} delay={i * 0.15} />
          ))}
        </>
      )}
      
      {/* Confetti */}
      {confettiActive && (
        <>
          {Array.from({ length: 150 }).map((_, i) => (
            <ConfettiParticle key={`confetti-${i}`} delay={i * 0.03} />
          ))}
        </>
      )}
      
      {/* Birthday Text */}
      <BirthdayBalloonText visible={textVisible} />
      
      {/* Sparkles */}
      {celebrating && (
        <Sparkles 
          count={150} 
          scale={15} 
          size={0.1} 
          speed={0.3} 
          color="#ffd700"
          noise={0.2}
        />
      )}
      
      {/* Controls */}
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        autoRotate={!celebrating}
        autoRotateSpeed={0.8}
        target={[0, 0.5, 0]}
      />
    </>
  )
}

// --- Wrapper Component ---
export function BirthdayScene() {
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [isBlown, setIsBlown] = useState(false)

  const handleBlowClick = () => {
    if (isBlown) return
    setIsBlown(true)
    // Trigger the blow function in the scene
    if (typeof window !== 'undefined' && (window as any).blowCandles) {
      ;(window as any).blowCandles()
    }
    setTimeout(() => {
      setIsCelebrating(true)
    }, 1500)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0a1a]">
      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 1.5, 6], fov: 45 }}
        gl={{ 
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <BirthdaySceneContent />
        </Suspense>
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBlowClick}
          className={`rounded-full px-10 py-4 text-lg font-bold text-white shadow-2xl transition-all ${
            isBlown
              ? 'bg-gradient-to-r from-green-400 to-blue-500 cursor-default'
              : 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:shadow-xl'
          }`}
          disabled={isBlown}
        >
          {isBlown ? '🎉 Happy Birthday! 🎉' : '🎂 Blow the Candles! 🎂'}
        </motion.button>
        
        {!isBlown && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.7, y: 0 }}
            className="text-sm text-white/50"
          >
            Click to make a wish and blow out the candles
          </motion.p>
        )}
        
        {isCelebrating && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="text-4xl"
          >
            🎊 ✨ 🎉
          </motion.div>
        )}
      </div>
      
      {/* Floating particles before celebration */}
      {!isCelebrating && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl opacity-20"
              initial={{ 
                x: Math.random() * 100 + '%',
                y: Math.random() * 100 + '%',
                scale: 0
              }}
              animate={{ 
                y: ['100%', '-10%'],
                x: [
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%'
                ],
                rotate: [0, 360],
                scale: [0, 1, 0]
              }}
              transition={{ 
                duration: 10 + Math.random() * 15,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: 'linear'
              }}
            >
              {['✨', '⭐', '🌟', '💫'][i % 4]}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BirthdayScene
