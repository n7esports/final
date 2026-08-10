'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
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
function BalloonLetter({ char, position, color }: any) {
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
        outlineWidth={0.02}
        outlineColor="#ffffff"
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
function BirthdayBalloonText({ visible }: any) {
  const text = "Happy Birthday!"
  const letters = text.split('')
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FF9FF3', '#FF4757', '#2ED573', '#1E90FF', '#FF6348', '#DDA0DD', '#F368E0', '#FF6B6B']
  
  const positions: any = {
    'H': [-4.5, 2.8, 0],
    'a': [-3.8, 2.8, 0],
    'p': [-3.1, 2.8, 0],
    'y': [-1.7, 2.8, 0],
    ' ': [-0.9, 2.8, 0],
    'B': [-0.1, 2.8, 0],
    'i': [0.6, 2.8, 0],
    'r': [1.2, 2.8, 0],
    't': [1.8, 2.8, 0],
    'h': [2.4, 2.8, 0],
    'd': [3.1, 2.8, 0],
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
          />
        )
      })}
    </group>
  )
}

// --- Realistic Flame ---
function Flame({ position, isLit, blowProgress }: any) {
  const flameRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [seed] = useState(() => Math.random() * 100)
  
  useFrame((state) => {
    if (!flameRef.current || !glowRef.current) return
    
    const time = state.clock.elapsedTime + seed
    
    if (isLit && blowProgress < 1) {
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
      
      glowRef.current.scale.set(
        1 + Math.sin(time * 5) * 0.1,
        1 + Math.sin(time * 4 + 1) * 0.1,
        1 + Math.sin(time * 5) * 0.1
      )
    } else {
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
      
      <mesh ref={glowRef} position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial
          color="#FF8C00"
          transparent
          opacity={isLit ? 0.3 : 0.3 * (1 - blowProgress)}
        />
      </mesh>
      
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
function RealisticCake({ candlesLit, blowProgress }: any) {
  return (
    <group position={[0, -1.5, 0]}>
      {/* 1. Cake Stand: Dark/Metallic base as seen in the image */}
      <Cylinder args={[2.4, 2.4, 0.1, 64]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </Cylinder>
      <Cylinder args={[2.5, 2.5, 0.05, 64]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#0d0d0d" roughness={0.4} metalness={0.2} />
      </Cylinder>
      
      {/* 2. Main Chocolate Cake Body */}
      <Cylinder args={[2.0, 2.05, 1.3, 64]} position={[0, 0.5, 0]}>
        <meshStandardMaterial 
          color="#1b110b" 
          roughness={0.9} 
          metalness={0.1} 
        />
      </Cylinder>
      
      {/* 3. The Glossy Magenta Drip Frosting */}
      <Cylinder args={[2.02, 2.02, 0.3, 64]} position={[0, 1.05, 0]}>
        <MeshDistortMaterial
          color="#aa0055" 
          roughness={0.15}
          metalness={0.1}
          distort={0.25}
          speed={0} 
        />
      </Cylinder>
      
      {/* Top smooth icing cap */}
      <Cylinder args={[2.01, 2.01, 0.05, 64]} position={[0, 1.16, 0]}>
        <meshStandardMaterial color="#880044" roughness={0.2} />
      </Cylinder>
      
      {/* 4. Swirl Piping / Frosting Dollops on Top */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 1.6
        const z = Math.sin(angle) * 1.6
        return (
          <group key={`piping-${i}`} position={[x, 1.18, z]}>
            <Sphere args={[0.12, 16, 16]}>
              <MeshDistortMaterial color="#bd006a" roughness={0.2} distort={0.3} speed={0} />
            </Sphere>
          </group>
        )
      })}
      
      {/* 5. The 8 Striped Birthday Candles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 1.6
        const z = Math.sin(angle) * 1.6
        return (
          <group key={`candle-${i}`} position={[x, 1.25, z]} rotation={[0, -angle, 0]}>
            <Cylinder args={[0.04, 0.04, 0.6, 16]}>
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#ff3377" : "#e0a000"} 
                roughness={0.3} 
              />
            </Cylinder>
            
            <Cylinder args={[0.005, 0.005, 0.08, 8]} position={[0, 0.33, 0]}>
              <meshStandardMaterial color="#222" />
            </Cylinder>
            
            <Flame
              position={[0, 0.36, 0]}
              isLit={candlesLit}
              blowProgress={blowProgress}
            />
          </group>
        )
      })}
    </group>
  )
}

// --- Floating Balloon ---
function FloatingBalloon({ delay }: any) {
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
        <Sphere args={[size * 0.3, 8, 8]} position={[size * 0.3, size * 0.3, size * 0.3]}>
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
        </Sphere>
        <mesh position={[0, -size * 0.9, 0]}>
          <coneGeometry args={[size * 0.2, size * 0.3, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, -size * 1.2, 0]}>
          <cylinderGeometry args={[0.005, 0.005, size * 0.8, 4]} />
          <meshStandardMaterial color="#999" transparent opacity={0.5} />
        </mesh>
      </Float>
    </group>
  )
}

// --- Confetti Particle ---
function ConfettiParticle({ delay }: any) {
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
function ScrapbookSceneContent() {
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

  useEffect(() => {
    (window as any).blowCandles = handleBlow
    return () => {
      delete (window as any).blowCandles
    }
  }, [handleBlow])

  return (
    <>
      <color attach="background" args={['#0a0a1a']} />
      
      <Environment preset="night" background={false} />
      
      {/* Deep, rich cinematic lighting setup */}
      <ambientLight intensity={0.05} color="#101020" />
      <directionalLight position={[2, 5, 4]} intensity={2.5} color="#ffaa44" />
      <directionalLight position={[-3, 4, -4]} intensity={3.0} color="#ff0088" />
      
      <Stars radius={40} depth={30} count={4000} factor={6} saturation={0.5} fade speed={0.3} />
      
      <RealisticCake candlesLit={candlesLit} blowProgress={blowProgress} />
      
      {balloonsActive && (
        <>
          {Array.from({ length: 25 }).map((_, i) => (
            <FloatingBalloon key={`balloon-${i}`} delay={i * 0.15} />
          ))}
        </>
      )}
      
      {confettiActive && (
        <>
          {Array.from({ length: 150 }).map((_, i) => (
            <ConfettiParticle key={`confetti-${i}`} delay={i * 0.03} />
          ))}
        </>
      )}
      
      <BirthdayBalloonText visible={textVisible} />
      
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

// --- Main Export ---
export function Scrapbook() {
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [isBlown, setIsBlown] = useState(false)

  const handleBlowClick = () => {
    if (isBlown) return
    setIsBlown(true)
    if (typeof window !== 'undefined' && (window as any).blowCandles) {
      ;(window as any).blowCandles()
    }
    setTimeout(() => {
      setIsCelebrating(true)
    }, 1500)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#0a0a1a]">
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
          <ScrapbookSceneContent />
        </Suspense>
      </Canvas>
      
      {/* Overlay UI featuring the Neon Magenta interactive button layout */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBlowClick}
          className={`rounded-full px-12 py-4 text-xl font-extrabold uppercase tracking-wider text-white transition-all duration-300 ${
            isBlown
              ? 'bg-neutral-800 border border-neutral-700 opacity-50 cursor-default'
              : 'bg-transparent border-2 border-[#ff00aa] shadow-[0_0_20px_#ff00aa,inset_0_0_10px_#ff00aa] hover:shadow-[0_0_35px_#ff00aa,inset_0_0_15px_#ff00aa]'
          }`}
          disabled={isBlown}
        >
          {isBlown ? '🎉 Celebrations 🎉' : 'Blow the Candles'}
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

export default Scrapbook
