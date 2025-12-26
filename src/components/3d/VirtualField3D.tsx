import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';

interface VirtualField3DProps {
  temperature: number;
  humidity: number;
  moisture: number;
}

// Animated particles for environmental effects
const EnvironmentParticles: React.FC<{ type: 'rain' | 'mist' | 'sun' }> = ({ type }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = type === 'rain' ? 500 : 200;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = type === 'rain' ? -0.1 : (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return [pos, vel];
  }, [count, type]);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];
        
        // Reset particles
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 8;
        }
        if (positions[i * 3 + 1] > 8) {
          positions[i * 3 + 1] = 0;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const color = type === 'rain' ? '#3b82f6' : type === 'mist' ? '#94a3b8' : '#fbbf24';

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={type === 'rain' ? 0.05 : 0.1}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Soil cross-section visualization
const SoilCrossSection: React.FC<{ moisture: number }> = ({ moisture }) => {
  const layers = [
    { y: -0.5, color: '#1a1a1a', name: 'Bedrock' },
    { y: -0.3, color: '#3d3d3d', name: 'Subsoil' },
    { y: -0.1, color: '#5c4033', name: 'Topsoil' },
    { y: 0.1, color: moisture > 60 ? '#3d2817' : '#6b4423', name: 'Growing Medium' },
  ];

  return (
    <group position={[-4, 0, 0]}>
      {layers.map((layer, i) => (
        <mesh key={i} position={[0, layer.y, 0]}>
          <boxGeometry args={[1.5, 0.2, 6]} />
          <meshStandardMaterial color={layer.color} />
        </mesh>
      ))}
      
      {/* Moisture indicator */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.5, 0.05, 6 * (moisture / 100)]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// Growing plant with root system
const PlantWithRoots: React.FC<{ position: [number, number, number]; growth: number }> = ({ position, growth }) => {
  const plantRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (plantRef.current) {
      plantRef.current.rotation.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  const stemHeight = growth * 1.2;
  const rootDepth = growth * 0.5;

  return (
    <group ref={plantRef} position={position}>
      {/* Roots (underground) */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * Math.PI * 0.7) * 0.2,
            -rootDepth * 0.5,
            Math.cos(i * Math.PI * 0.7) * 0.2,
          ]}
          rotation={[Math.sin(i) * 0.3, 0, Math.cos(i) * 0.3]}
        >
          <cylinderGeometry args={[0.02, 0.01, rootDepth, 4]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      ))}

      {/* Stem */}
      <mesh position={[0, stemHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, stemHeight, 8]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>

      {/* Leaves */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * Math.PI * 0.4) * growth * 0.3,
            stemHeight * (0.4 + i * 0.12),
            Math.sin(i * Math.PI * 0.4) * growth * 0.3,
          ]}
          rotation={[0.2, i * Math.PI * 0.4, 0.3]}
          castShadow
        >
          <sphereGeometry args={[growth * 0.2, 8, 8]} />
          <meshStandardMaterial color="#32cd32" />
        </mesh>
      ))}

      {/* Fruit (if mature) */}
      {growth > 0.7 && (
        <mesh position={[0.1, stemHeight * 0.7, 0.1]} castShadow>
          <sphereGeometry args={[growth * 0.15, 16, 16]} />
          <meshStandardMaterial color="#ff6347" />
        </mesh>
      )}
    </group>
  );
};

// Temperature visualization (heat waves)
const HeatVisualization: React.FC<{ temperature: number }> = ({ temperature }) => {
  const wavesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (wavesRef.current) {
      wavesRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.3 + 3;
        child.scale.setScalar(1 + Math.sin(state.clock.elapsedTime + i) * 0.1);
      });
    }
  });

  if (temperature < 25) return null;

  const intensity = (temperature - 25) / 15;

  return (
    <group ref={wavesRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 2 - 2, 3, 0]}>
          <torusGeometry args={[0.5, 0.02, 8, 32]} />
          <meshStandardMaterial
            color="#ff4500"
            transparent
            opacity={intensity * 0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// Main scene
const Scene: React.FC<VirtualField3DProps> = ({ temperature, humidity, moisture }) => {
  const growth = useMemo(() => Math.min(1, Math.max(0.2, (moisture / 100) * (temperature / 25))), [moisture, temperature]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

      {/* Ground */}
      <mesh position={[0, -0.1, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#2d4a1c" />
      </mesh>

      {/* Soil cross-section */}
      <SoilCrossSection moisture={moisture} />

      {/* Plants */}
      {[-2, -1, 0, 1, 2].map((x) =>
        [-2, -1, 0, 1, 2].map((z) => (
          <PlantWithRoots
            key={`${x}-${z}`}
            position={[x * 0.8 + 2, 0, z * 0.8]}
            growth={growth * (0.8 + Math.random() * 0.4)}
          />
        ))
      )}

      {/* Environmental effects */}
      {humidity > 70 && <EnvironmentParticles type="mist" />}
      {moisture > 80 && <EnvironmentParticles type="rain" />}
      <HeatVisualization temperature={temperature} />

      {/* Info labels */}
      <Html position={[-4, 1, 3]} center>
        <div className="bg-card/90 backdrop-blur-sm px-3 py-1 rounded text-xs">
          <span className="text-moisture">Moisture: {moisture.toFixed(0)}%</span>
        </div>
      </Html>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
      />
      <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={50} />
    </>
  );
};

// Loading fallback
const LoadingFallback = () => (
  <Html center>
    <div className="text-primary animate-pulse">Loading 3D Field...</div>
  </Html>
);

export const VirtualField3D: React.FC<VirtualField3DProps> = (props) => {
  return (
    <div className="three-canvas" style={{ height: '100%', minHeight: '400px' }}>
      <Canvas shadows>
        <Suspense fallback={<LoadingFallback />}>
          <Scene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};
