import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface GreenhouseSceneProps {
  growthWeek: number;
}

// Glass Material for greenhouse walls
const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.3,
  roughness: 0.1,
  metalness: 0,
  side: THREE.DoubleSide,
});

// Ground/Soil component
const Soil: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={[8, 0.3, 6]} />
      <meshStandardMaterial color="#3d2817" roughness={0.9} />
    </mesh>
  );
};

// Plant component that grows based on week
const Plant: React.FC<{ 
  position: [number, number, number]; 
  type: 'tomato' | 'lettuce' | 'pepper';
  growthWeek: number;
}> = ({ position, type, growthWeek }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  const scale = useMemo(() => {
    const baseScale = growthWeek / 16;
    return Math.min(1, baseScale * 1.2);
  }, [growthWeek]);

  const stemHeight = scale * 1.5;
  const leafSize = scale * 0.5;
  const fruitSize = growthWeek > 10 ? (growthWeek - 10) / 6 * 0.3 : 0;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.05;
    }
  });

  const getColor = () => {
    switch (type) {
      case 'tomato': return { stem: '#2d5016', fruit: '#dc2626' };
      case 'lettuce': return { stem: '#4ade80', fruit: '#22c55e' };
      case 'pepper': return { stem: '#365314', fruit: '#f59e0b' };
    }
  };

  const colors = getColor();

  return (
    <group ref={meshRef} position={position}>
      {/* Stem */}
      <mesh position={[0, stemHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.03 * scale, 0.05 * scale, stemHeight, 8]} />
        <meshStandardMaterial color={colors.stem} />
      </mesh>

      {/* Leaves */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * Math.PI / 2) * leafSize * 0.5,
            stemHeight * 0.6,
            Math.sin(i * Math.PI / 2) * leafSize * 0.5,
          ]}
          rotation={[0.3, i * Math.PI / 2, 0]}
          castShadow
        >
          <sphereGeometry args={[leafSize, 8, 8]} />
          <meshStandardMaterial color={colors.stem} />
        </mesh>
      ))}

      {/* Fruit (only if mature enough) */}
      {fruitSize > 0 && (
        <mesh position={[0.1, stemHeight * 0.8, 0.1]} castShadow>
          <sphereGeometry args={[fruitSize, 16, 16]} />
          <meshStandardMaterial color={colors.fruit} />
        </mesh>
      )}
    </group>
  );
};

// Greenhouse structure
const GreenhouseStructure: React.FC = () => {
  return (
    <group>
      {/* Frame posts */}
      {[[-4, 0, -3], [-4, 0, 3], [4, 0, -3], [4, 0, 3]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 2.5, pos[2]]} castShadow>
          <boxGeometry args={[0.15, 5, 0.15]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Roof frame */}
      <mesh position={[0, 5.5, 0]}>
        <boxGeometry args={[8.3, 0.1, 6.3]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glass walls */}
      {/* Front */}
      <mesh position={[0, 2.5, 3]} material={glassMaterial}>
        <planeGeometry args={[8, 5]} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 2.5, -3]} material={glassMaterial} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[8, 5]} />
      </mesh>
      {/* Left */}
      <mesh position={[-4, 2.5, 0]} material={glassMaterial} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 5]} />
      </mesh>
      {/* Right */}
      <mesh position={[4, 2.5, 0]} material={glassMaterial} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6, 5]} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 5.2, 0]} material={glassMaterial} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 6]} />
      </mesh>
    </group>
  );
};

// Irrigation pipes
const IrrigationSystem: React.FC = () => {
  return (
    <group position={[0, 0.5, 0]}>
      {[-2, 0, 2].map((z, i) => (
        <mesh key={i} position={[0, 0.1, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 7, 8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      ))}
    </group>
  );
};

// LED grow lights
const GrowLights: React.FC = () => {
  return (
    <group position={[0, 4.5, 0]}>
      {[-2, 0, 2].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.05, 5]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <pointLight position={[0, -0.5, 0]} color="#ff6b9d" intensity={0.5} distance={5} />
        </group>
      ))}
    </group>
  );
};

// Sensors
const Sensor: React.FC<{ position: [number, number, number]; type: string }> = ({ position, type }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.15, 0.15, 0.05]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

// Main scene component
const Scene: React.FC<GreenhouseSceneProps> = ({ growthWeek }) => {
  const plantPositions: { pos: [number, number, number]; type: 'tomato' | 'lettuce' | 'pepper' }[] = [
    // Row 1 - Tomatoes
    { pos: [-2.5, 0.15, -2], type: 'tomato' },
    { pos: [-1.5, 0.15, -2], type: 'tomato' },
    { pos: [-0.5, 0.15, -2], type: 'tomato' },
    { pos: [0.5, 0.15, -2], type: 'tomato' },
    { pos: [1.5, 0.15, -2], type: 'tomato' },
    { pos: [2.5, 0.15, -2], type: 'tomato' },
    // Row 2 - Lettuce
    { pos: [-2.5, 0.15, 0], type: 'lettuce' },
    { pos: [-1.5, 0.15, 0], type: 'lettuce' },
    { pos: [-0.5, 0.15, 0], type: 'lettuce' },
    { pos: [0.5, 0.15, 0], type: 'lettuce' },
    { pos: [1.5, 0.15, 0], type: 'lettuce' },
    { pos: [2.5, 0.15, 0], type: 'lettuce' },
    // Row 3 - Peppers
    { pos: [-2.5, 0.15, 2], type: 'pepper' },
    { pos: [-1.5, 0.15, 2], type: 'pepper' },
    { pos: [-0.5, 0.15, 2], type: 'pepper' },
    { pos: [0.5, 0.15, 2], type: 'pepper' },
    { pos: [1.5, 0.15, 2], type: 'pepper' },
    { pos: [2.5, 0.15, 2], type: 'pepper' },
  ];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <GreenhouseStructure />
      <Soil position={[0, 0, 0]} />
      <IrrigationSystem />
      <GrowLights />

      {plantPositions.map((plant, i) => (
        <Plant
          key={i}
          position={plant.pos}
          type={plant.type}
          growthWeek={growthWeek}
        />
      ))}

      {/* Sensors */}
      <Sensor position={[-3.8, 1, 0]} type="temperature" />
      <Sensor position={[3.8, 1, 0]} type="humidity" />
      <Sensor position={[0, 0.3, -2.8]} type="moisture" />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2}
      />
      <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />
    </>
  );
};

// Loading fallback
const LoadingFallback = () => (
  <Html center>
    <div className="text-primary animate-pulse">Loading 3D Scene...</div>
  </Html>
);

// Error boundary fallback
const ErrorFallback: React.FC<{ message?: string }> = ({ message }) => (
  <div className="w-full h-full flex items-center justify-center bg-card rounded-xl">
    <div className="text-center p-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-3xl">🌱</span>
      </div>
      <h3 className="text-lg font-semibold mb-2">3D View</h3>
      <p className="text-muted-foreground text-sm">
        {message || 'Interactive 3D greenhouse visualization'}
      </p>
    </div>
  </div>
);

// Main exported component
export const Greenhouse3D: React.FC<GreenhouseSceneProps> = ({ growthWeek }) => {
  return (
    <div className="three-canvas" style={{ height: '100%', minHeight: '400px' }}>
      <Canvas shadows>
        <Suspense fallback={<LoadingFallback />}>
          <Scene growthWeek={growthWeek} />
        </Suspense>
      </Canvas>
    </div>
  );
};
