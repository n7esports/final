'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Image as DreiImage, OrbitControls, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { memories } from '@/lib/birthday-data'

function GalaxyDust() {
  const points = useRef<THREE.Points>(null)

  const { positions, colors } = useMemo(() => {
    const count = 1200
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const pink = new THREE.Color('#FF69B4')
    const purple = new THREE.Color('#9B6DD6')
    const white = new THREE.Color('#FFF0F5')

    for (let i = 0; i < count; i++) {
      const radius = 6 + Math.random() * 18
      const spinAngle = radius * 0.35
      const branchAngle = ((i % 4) / 4) * Math.PI * 2
      const rand = () => (Math.random() - 0.5) * 2.5

      positions[i * 3] = Math.cos(branchAngle + spinAngle) * radius + rand()
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * radius + rand()

      const mixed = pink
        .clone()
        .lerp(purple, Math.random())
        .lerp(white, Math.random() * 0.4)
      colors[i * 3] = mixed.r
      colors[i * 3 + 1] = mixed.g
      colors[i * 3 + 2] = mixed.b
    }
    return { positions, colors }
  }, [])

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.02
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

function FloatingFrame({
  url,
  position,
  rotationY,
}: {
  url: string
  position: [number, number, number]
  rotationY: number
}) {
  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.9}>
      <group position={position} rotation={[0, rotationY, 0]}>
        {/* Glowing frame backing */}
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[2.5, 3.1]} />
          <meshBasicMaterial
            color="#FF69B4"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
        <DreiImage url={url} scale={[2.3, 2.9]} side={THREE.DoubleSide} />
      </group>
    </Float>
  )
}

function Frames() {
  const group = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.04
  })

  return (
    <group ref={group}>
      {memories.map((memory, i) => {
        const angle = (i / memories.length) * Math.PI * 2
        const radius = 5.5
        return (
          <FloatingFrame
            key={memory.src}
            url={memory.src}
            position={[
              Math.cos(angle) * radius,
              Math.sin(i * 2.1) * 1.2,
              Math.sin(angle) * radius,
            ]}
            rotationY={-angle + Math.PI / 2}
          />
        )
      })}
    </group>
  )
}

export default function GalaxyScene() {
  return (
    <Canvas
      camera={{ position: [0, 2, 11], fov: 55 }}
      dpr={1}
      gl={{ antialias: false, powerPreference: 'default' }}
      onCreated={({ gl }) => {
        // Recover gracefully if the WebGL context is lost (e.g. software rendering)
        gl.domElement.addEventListener(
          'webglcontextlost',
          (event) => event.preventDefault(),
          false,
        )
      }}
    >
      <color attach="background" args={['#1a0f1e']} />
      <fog attach="fog" args={['#1a0f1e', 14, 30]} />
      <ambientLight intensity={1.2} />
      <GalaxyDust />
      <Sparkles count={60} scale={16} size={2.5} speed={0.35} color="#FFB6C1" />
      <Frames />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.4}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(Math.PI * 2) / 3}
      />
    </Canvas>
  )
}
