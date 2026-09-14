'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Group, Mesh } from 'three';
import { brand } from '@/lib/brand';

function Rig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 0.45 - camera.position.x) * 0.05;
    camera.position.y += (0.35 + pointer.y * 0.2 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function FloatMesh({
  children,
  speed = 1,
  amp = 0.12,
}: {
  children: ReactNode;
  speed?: number;
  amp?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * speed) * amp;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.25 * speed) * 0.12;
  });
  return <group ref={ref}>{children}</group>;
}

function Book({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <mesh position={position} castShadow={false}>
      <boxGeometry args={[0.55, 0.08, 0.72]} />
      <meshStandardMaterial color={color} metalness={0.15} roughness={0.45} />
    </mesh>
  );
}

export function EducationScene() {
  const chart = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (chart.current) chart.current.scale.y = 0.7 + Math.sin(clock.elapsedTime) * 0.08;
  });
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} color={brand.keyLight} />
      <pointLight position={[-2, 1, 2]} intensity={0.5} color={brand.primaryLight} />
      <FloatMesh speed={0.8}>
        <Book position={[-1.1, 0.2, 0.2]} color={brand.primaryLight} />
      </FloatMesh>
      <FloatMesh speed={1.1} amp={0.08}>
        <Book position={[-1.05, 0.32, 0.15]} color={brand.primary} />
      </FloatMesh>
      <FloatMesh speed={0.7}>
        <mesh position={[1.05, 0.15, 0.1]}>
          <boxGeometry args={[0.9, 0.06, 0.62]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
        <mesh position={[1.05, 0.42, -0.05]} rotation={[-0.18, 0.2, 0]}>
          <boxGeometry args={[0.82, 0.52, 0.04]} />
          <meshStandardMaterial color={brand.primaryLight} emissive={brand.primary} emissiveIntensity={0.2} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={0.9}>
        <mesh position={[0.1, 0.85, -0.4]} rotation={[0, 0.4, 0]}>
          <coneGeometry args={[0.28, 0.16, 8]} />
          <meshStandardMaterial color={brand.secondary} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={1.2}>
        <mesh position={[-0.15, -0.05, 0.6]}>
          <boxGeometry args={[0.42, 0.28, 0.04]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
      </FloatMesh>
      <mesh ref={chart} position={[0.55, -0.35, 0.35]} scale={[1, 0.8, 1]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial color={brand.accent} />
      </mesh>
      <mesh position={[0.75, -0.42, 0.35]}>
        <boxGeometry args={[0.12, 0.32, 0.12]} />
        <meshStandardMaterial color={brand.primaryLight} />
      </mesh>
      <Rig />
    </>
  );
}

function SlowOrbit({
  children,
  radius,
  speed,
  y = 0.1,
  phase = 0,
}: {
  children: ReactNode;
  radius: number;
  speed: number;
  y?: number;
  phase?: number;
}) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed + phase;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = y + Math.sin(t * 0.8) * 0.05;
  });
  return <group ref={ref}>{children}</group>;
}

export function CareerScene() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[2, 3, 2]} intensity={1} color={brand.keyLight} />
      <pointLight position={[-2, 1, 1.5]} intensity={0.4} color={brand.primaryLight} />
      <FloatMesh speed={0.8} amp={0.08}>
        <mesh position={[-0.75, 0.08, 0]}>
          <boxGeometry args={[0.72, 0.05, 0.5]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
        <mesh position={[-0.75, 0.36, -0.08]} rotation={[-0.2, 0.15, 0]}>
          <boxGeometry args={[0.64, 0.42, 0.03]} />
          <meshStandardMaterial color={brand.primaryLight} emissive={brand.primary} emissiveIntensity={0.16} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={1} amp={0.07}>
        <mesh position={[0.78, 0.42, 0.12]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color={brand.secondary} metalness={0.35} roughness={0.3} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={0.65} amp={0.06}>
        <mesh position={[0.12, 0.88, -0.28]} rotation={[0, 0.3, 0]}>
          <coneGeometry args={[0.24, 0.14, 8]} />
          <meshStandardMaterial color={brand.secondary} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={0.9}>
        <Book position={[0.15, -0.18, 0.48]} color={brand.primaryLight} />
      </FloatMesh>
      <FloatMesh speed={1.1} amp={0.08}>
        <mesh position={[-0.2, -0.32, 0.35]}>
          <boxGeometry args={[0.32, 0.22, 0.08]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
      </FloatMesh>
      <mesh position={[0.42, -0.42, 0.18]}>
        <boxGeometry args={[0.1, 0.38, 0.1]} />
        <meshStandardMaterial color={brand.primaryLight} />
      </mesh>
      <mesh position={[0.56, -0.46, 0.18]}>
        <boxGeometry args={[0.1, 0.28, 0.1]} />
        <meshStandardMaterial color={brand.accent} />
      </mesh>
      <Rig />
    </>
  );
}

export function BlogScene() {
  return (
    <>
      <ambientLight intensity={0.74} />
      <directionalLight position={[3, 4, 2]} intensity={1} color={brand.keyLight} />
      <pointLight position={[-1.8, 1.4, 1.4]} intensity={0.4} color={brand.primaryLight} />
      <FloatMesh speed={0.75} amp={0.08}>
        <mesh position={[-0.2, 0.08, 0]} rotation={[0, 0, 0.38]}>
          <boxGeometry args={[0.58, 0.02, 0.78]} />
          <meshStandardMaterial color={brand.primaryLight} />
        </mesh>
        <mesh position={[0.22, 0.08, 0]} rotation={[0, 0, -0.38]}>
          <boxGeometry args={[0.58, 0.02, 0.78]} />
          <meshStandardMaterial color={brand.secondary} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={1} amp={0.1}>
        <mesh position={[0.7, 0.48, 0.18]} rotation={[0.15, -0.2, 0.1]}>
          <boxGeometry args={[0.42, 0.28, 0.03]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={0.65} amp={0.07}>
        <mesh position={[-0.72, 0.55, 0.1]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color={brand.secondary} emissive={brand.accent} emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[-0.72, 0.38, 0.1]}>
          <coneGeometry args={[0.08, 0.14, 8]} />
          <meshStandardMaterial color={brand.primaryLight} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={0.9} amp={0.06}>
        <mesh position={[0.15, -0.32, 0.5]} rotation={[0.4, 0.2, 0.3]}>
          <cylinderGeometry args={[0.025, 0.025, 0.55, 8]} />
          <meshStandardMaterial color={brand.accent} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={1.15} amp={0.09}>
        <mesh position={[-0.55, -0.18, 0.42]} rotation={[0.1, 0.3, -0.1]}>
          <boxGeometry args={[0.36, 0.24, 0.03]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
      </FloatMesh>
      <Rig />
    </>
  );
}

export function AboutScene() {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[3, 4, 2]} intensity={1} color={brand.keyLight} />
      <pointLight position={[0, 1.2, 1.4]} intensity={0.55} color={brand.primaryLight} />
      <FloatMesh speed={0.55} amp={0.06}>
        <mesh>
          <icosahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial color={brand.primaryLight} metalness={0.25} roughness={0.35} emissive={brand.primary} emissiveIntensity={0.18} />
        </mesh>
      </FloatMesh>
      <SlowOrbit radius={1.05} speed={0.18} y={0.28} phase={0}>
        <Book position={[0, 0, 0]} color={brand.primaryLight} />
      </SlowOrbit>
      <SlowOrbit radius={1.12} speed={0.14} y={-0.12} phase={1.6}>
        <mesh>
          <boxGeometry args={[0.38, 0.24, 0.03]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
      </SlowOrbit>
      <SlowOrbit radius={0.95} speed={0.16} y={0.42} phase={3.1}>
        <mesh>
          <coneGeometry args={[0.16, 0.1, 8]} />
          <meshStandardMaterial color={brand.secondary} />
        </mesh>
      </SlowOrbit>
      <SlowOrbit radius={1.08} speed={0.12} y={-0.28} phase={4.4}>
        <mesh>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color={brand.accent} metalness={0.3} roughness={0.35} />
        </mesh>
      </SlowOrbit>
      <Rig />
    </>
  );
}

export function TeachersScene() {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[3, 4, 2]} intensity={1} color={brand.keyLight} />
      <pointLight position={[-2.2, 1.2, 1.6]} intensity={0.45} color={brand.primaryLight} />
      <FloatMesh speed={0.75} amp={0.1}>
        <mesh position={[0, 0.55, -0.15]}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color={brand.primaryLight} metalness={0.2} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.18, -0.15]}>
          <coneGeometry args={[0.34, 0.42, 8]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={0.95}>
        <Book position={[-1.05, 0.15, 0.25]} color={brand.primaryLight} />
      </FloatMesh>
      <FloatMesh speed={1.15} amp={0.08}>
        <Book position={[-1, 0.28, 0.18]} color={brand.secondary} />
      </FloatMesh>
      <FloatMesh speed={0.7}>
        <mesh position={[1.05, 0.08, 0.12]}>
          <boxGeometry args={[0.78, 0.05, 0.52]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
        <mesh position={[1.05, 0.34, -0.02]} rotation={[-0.16, 0.18, 0]}>
          <boxGeometry args={[0.7, 0.44, 0.03]} />
          <meshStandardMaterial color={brand.primaryLight} emissive={brand.primary} emissiveIntensity={0.18} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={0.85}>
        <mesh position={[0.15, 0.95, -0.35]} rotation={[0, 0.35, 0]}>
          <coneGeometry args={[0.26, 0.14, 8]} />
          <meshStandardMaterial color={brand.secondary} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={1.05} amp={0.07}>
        <mesh position={[-0.35, -0.28, 0.55]}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial color={brand.accent} metalness={0.25} roughness={0.35} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={0.9} amp={0.06}>
        <mesh position={[0.55, -0.2, 0.45]} rotation={[0.2, -0.3, 0.1]}>
          <boxGeometry args={[0.46, 0.3, 0.03]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
      </FloatMesh>
      <Rig />
    </>
  );
}

export function BatchesScene() {
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[3, 4, 2]} intensity={1} color={brand.keyLight} />
      <pointLight position={[-2, 1.2, 1.6]} intensity={0.45} color={brand.primaryLight} />
      <FloatMesh speed={0.7} amp={0.08}>
        <mesh position={[0.95, 0.08, 0.1]}>
          <boxGeometry args={[0.78, 0.05, 0.52]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
        <mesh position={[0.95, 0.34, -0.04]} rotation={[-0.16, 0.18, 0]}>
          <boxGeometry args={[0.7, 0.44, 0.03]} />
          <meshStandardMaterial color={brand.primaryLight} emissive={brand.primary} emissiveIntensity={0.16} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={0.95}>
        <Book position={[-1.05, 0.12, 0.22]} color={brand.primaryLight} />
      </FloatMesh>
      <FloatMesh speed={1.15} amp={0.08}>
        <Book position={[-1, 0.24, 0.16]} color={brand.secondary} />
      </FloatMesh>
      <FloatMesh speed={0.85} amp={0.07}>
        <mesh position={[-0.15, 0.85, -0.3]} rotation={[0, 0.35, 0]}>
          <coneGeometry args={[0.24, 0.14, 8]} />
          <meshStandardMaterial color={brand.secondary} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={0.75} amp={0.06}>
        <mesh position={[-0.35, -0.22, 0.5]}>
          <boxGeometry args={[0.42, 0.02, 0.42]} />
          <meshStandardMaterial color={brand.primaryDark} />
        </mesh>
        <mesh position={[-0.43, -0.12, 0.42]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color={brand.primaryLight} />
        </mesh>
        <mesh position={[-0.27, -0.12, 0.42]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color={brand.secondary} />
        </mesh>
        <mesh position={[-0.43, -0.12, 0.58]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color={brand.secondary} />
        </mesh>
        <mesh position={[-0.27, -0.12, 0.58]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color={brand.primaryLight} />
        </mesh>
      </FloatMesh>
      <FloatMesh speed={1.05} amp={0.09}>
        <mesh position={[0.35, -0.18, 0.55]}>
          <cylinderGeometry args={[0.08, 0.1, 0.16, 8]} />
          <meshStandardMaterial color={brand.accent} metalness={0.3} roughness={0.35} />
        </mesh>
        <mesh position={[0.35, -0.02, 0.55]}>
          <coneGeometry args={[0.12, 0.1, 8]} />
          <meshStandardMaterial color={brand.secondary} />
        </mesh>
      </FloatMesh>
      <mesh position={[0.12, -0.42, 0.2]} scale={[1, 0.9, 1]}>
        <boxGeometry args={[0.1, 0.42, 0.1]} />
        <meshStandardMaterial color={brand.primaryLight} />
      </mesh>
      <mesh position={[0.28, -0.46, 0.2]}>
        <boxGeometry args={[0.1, 0.32, 0.1]} />
        <meshStandardMaterial color={brand.accent} />
      </mesh>
      <mesh position={[0.44, -0.5, 0.2]}>
        <boxGeometry args={[0.1, 0.22, 0.1]} />
        <meshStandardMaterial color={brand.secondary} />
      </mesh>
      <Rig />
    </>
  );
}

export function ThreeCanvasWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className={className}>
      <Canvas
        dpr={[1, 1.35]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.4, 3.2], fov: 42 }}
        frameloop={visible ? 'always' : 'never'}
      >
        {children}
      </Canvas>
    </div>
  );
}
