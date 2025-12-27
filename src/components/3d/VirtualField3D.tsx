import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface VirtualField3DProps {
  temperature: number;
  humidity: number;
  moisture: number;
}

// Realistic tomato plant with detailed geometry
const RealisticTomatoPlant: React.FC<{ position: [number, number, number]; growth: number; id: number }> = ({ position, growth, id }) => {
  const plantRef = useRef<THREE.Group>(null);
  const time = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (plantRef.current) {
      time.current += 0.01;
      plantRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + id) * 0.02;
    }
  });

  const stemHeight = growth * 1.8;
  const leafCount = Math.floor(growth * 8);
  const fruitCount = growth > 0.6 ? Math.floor((growth - 0.5) * 6) : 0;

  return (
    <group ref={plantRef} position={position}>
      {/* Main stem with segments */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`stem-${i}`} position={[0, (i * stemHeight) / 6, 0]}>
          <cylinderGeometry args={[0.04 - i * 0.005, 0.05 - i * 0.005, stemHeight / 6, 8]} />
          <meshStandardMaterial color="#2d5016" roughness={0.8} />
        </mesh>
      ))}

      {/* Compound leaves with multiple leaflets */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const angle = (i / leafCount) * Math.PI * 4 + id;
        const height = (i / leafCount) * stemHeight * 0.9 + 0.2;
        const leafSize = 0.15 + Math.sin(i * 0.5) * 0.05;
        
        return (
          <group key={`leaf-group-${i}`} position={[0, height, 0]} rotation={[0.3, angle, 0.2]}>
            {/* Main leaf */}
            <mesh position={[leafSize * 0.8, 0, 0]} rotation={[0, 0, -0.3]}>
              <sphereGeometry args={[leafSize, 8, 6]} />
              <meshStandardMaterial color="#3a7d1c" roughness={0.6} flatShading />
            </mesh>
            {/* Secondary leaflets */}
            {[1, -1].map((side) => (
              <mesh key={side} position={[leafSize * 0.4, 0, side * leafSize * 0.3]} rotation={[0, 0, -0.2]}>
                <sphereGeometry args={[leafSize * 0.6, 6, 4]} />
                <meshStandardMaterial color="#4a9428" roughness={0.6} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Yellow flowers */}
      {growth > 0.4 && growth < 0.8 && Array.from({ length: 3 }).map((_, i) => (
        <group key={`flower-${i}`} position={[0.15, stemHeight * 0.7 + i * 0.1, 0.1]} rotation={[0.5, i * 1.2, 0]}>
          {[0, 1, 2, 3, 4].map((p) => (
            <mesh key={p} position={[Math.cos(p * 1.26) * 0.04, 0, Math.sin(p * 1.26) * 0.04]}>
              <sphereGeometry args={[0.025, 6, 4]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.2} />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.02, 6, 4]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
        </group>
      ))}

      {/* Tomatoes at different stages */}
      {Array.from({ length: fruitCount }).map((_, i) => {
        const angle = i * 1.3 + id;
        const ripeness = Math.min(1, (growth - 0.6) * 2 + i * 0.1);
        const tomatoColor = ripeness > 0.7 ? '#e53e3e' : ripeness > 0.4 ? '#ed8936' : '#68d391';
        const size = 0.08 + ripeness * 0.06;
        
        return (
          <group key={`tomato-${i}`} position={[Math.cos(angle) * 0.2, stemHeight * 0.6 - i * 0.12, Math.sin(angle) * 0.2]}>
            <mesh>
              <sphereGeometry args={[size, 16, 12]} />
              <meshStandardMaterial color={tomatoColor} roughness={0.3} />
            </mesh>
            {/* Stem cap */}
            <mesh position={[0, size * 0.9, 0]}>
              <cylinderGeometry args={[0.02, 0.015, 0.03, 6]} />
              <meshStandardMaterial color="#2d5016" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Realistic lettuce plant
const RealisticLettucePlant: React.FC<{ position: [number, number, number]; growth: number; id: number }> = ({ position, growth, id }) => {
  const plantRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (plantRef.current) {
      plantRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + id) * 0.05;
    }
  });

  const leafCount = Math.floor(growth * 12) + 4;
  const size = growth * 0.4 + 0.1;

  return (
    <group ref={plantRef} position={position}>
      {/* Layered lettuce leaves */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const layer = Math.floor(i / 4);
        const angleOffset = (i % 4) * (Math.PI / 2) + layer * 0.4;
        const leafHeight = layer * 0.05;
        const leafScale = 1 - layer * 0.15;
        const curl = 0.2 + layer * 0.1;
        
        return (
          <mesh
            key={`leaf-${i}`}
            position={[
              Math.cos(angleOffset) * size * 0.3 * leafScale,
              leafHeight,
              Math.sin(angleOffset) * size * 0.3 * leafScale,
            ]}
            rotation={[curl, angleOffset, 0.1]}
          >
            <sphereGeometry args={[size * leafScale, 8, 6]} />
            <meshStandardMaterial 
              color={layer > 1 ? '#90EE90' : '#228B22'} 
              roughness={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      
      {/* Core */}
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[size * 0.2, 8, 6]} />
        <meshStandardMaterial color="#f0fff0" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Realistic pepper plant
const RealisticPepperPlant: React.FC<{ position: [number, number, number]; growth: number; id: number }> = ({ position, growth, id }) => {
  const plantRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (plantRef.current) {
      plantRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4 + id) * 0.02;
    }
  });

  const stemHeight = growth * 1.5;
  const pepperCount = growth > 0.5 ? Math.floor((growth - 0.4) * 5) : 0;

  return (
    <group ref={plantRef} position={position}>
      {/* Main stem */}
      <mesh position={[0, stemHeight / 2, 0]}>
        <cylinderGeometry args={[0.03, 0.05, stemHeight, 8]} />
        <meshStandardMaterial color="#3d6b1a" roughness={0.7} />
      </mesh>

      {/* Branch stems */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh 
            key={`branch-${i}`} 
            position={[Math.cos(angle) * 0.1, stemHeight * 0.6, Math.sin(angle) * 0.1]}
            rotation={[0.3, angle, 0.5]}
          >
            <cylinderGeometry args={[0.015, 0.02, 0.3, 6]} />
            <meshStandardMaterial color="#3d6b1a" />
          </mesh>
        );
      })}

      {/* Leaves */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2 + id;
        const height = 0.3 + (i / 8) * stemHeight * 0.7;
        
        return (
          <mesh 
            key={`leaf-${i}`} 
            position={[Math.cos(angle) * 0.2, height, Math.sin(angle) * 0.2]}
            rotation={[0.4, angle, 0.2]}
          >
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color="#2d6b2d" roughness={0.6} flatShading />
          </mesh>
        );
      })}

      {/* Peppers */}
      {Array.from({ length: pepperCount }).map((_, i) => {
        const angle = i * 1.8 + id;
        const pepperColors = ['#e53e3e', '#ed8936', '#48bb78', '#ecc94b'];
        
        return (
          <group key={`pepper-${i}`} position={[Math.cos(angle) * 0.15, stemHeight * 0.5 - i * 0.15, Math.sin(angle) * 0.15]} rotation={[0.3, 0, 0.2]}>
            <mesh>
              <capsuleGeometry args={[0.04, 0.12, 8, 12]} />
              <meshStandardMaterial color={pepperColors[i % pepperColors.length]} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.015, 0.01, 0.04, 6]} />
              <meshStandardMaterial color="#2d5016" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Realistic strawberry plant
const RealisticStrawberryPlant: React.FC<{ position: [number, number, number]; growth: number; id: number }> = ({ position, growth, id }) => {
  const plantRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (plantRef.current) {
      plantRef.current.children.forEach((child, i) => {
        if (child.name === 'leaf') {
          child.rotation.z = Math.sin(state.clock.elapsedTime + i) * 0.05;
        }
      });
    }
  });

  const berryCount = growth > 0.4 ? Math.floor((growth - 0.3) * 6) : 0;

  return (
    <group ref={plantRef} position={position}>
      {/* Trifoliate leaves */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        
        return (
          <group key={`leafset-${i}`} position={[0, 0.05, 0]} rotation={[0.6, angle, 0]} name="leaf">
            {/* Petiole */}
            <mesh position={[0.1, 0, 0]} rotation={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.01, 0.01, 0.2, 6]} />
              <meshStandardMaterial color="#4a7c2a" />
            </mesh>
            {/* Three leaflets */}
            {[-0.4, 0, 0.4].map((offset, j) => (
              <mesh key={j} position={[0.22, 0, offset * 0.15]} rotation={[0, offset * 0.3, 0]}>
                <sphereGeometry args={[0.08 * growth, 8, 6]} />
                <meshStandardMaterial color="#228b22" roughness={0.6} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Flowers */}
      {growth > 0.3 && growth < 0.7 && Array.from({ length: 2 }).map((_, i) => (
        <group key={`flower-${i}`} position={[0.15 * (i + 1), 0.1, 0.1 * i]}>
          {[0, 1, 2, 3, 4].map((p) => (
            <mesh key={p} position={[Math.cos(p * 1.26) * 0.03, 0, Math.sin(p * 1.26) * 0.03]}>
              <sphereGeometry args={[0.02, 6, 4]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.015, 6, 4]} />
            <meshStandardMaterial color="#ffd700" />
          </mesh>
        </group>
      ))}

      {/* Strawberries */}
      {Array.from({ length: berryCount }).map((_, i) => {
        const angle = i * 1.5 + id;
        const ripeness = Math.min(1, (growth - 0.4) * 2.5 + i * 0.15);
        const berryColor = ripeness > 0.6 ? '#dc2626' : ripeness > 0.3 ? '#f97316' : '#84cc16';
        
        return (
          <group key={`berry-${i}`} position={[Math.cos(angle) * 0.12, 0, Math.sin(angle) * 0.12]} rotation={[0.2, 0, 0.1]}>
            <mesh>
              <coneGeometry args={[0.04, 0.08, 8]} />
              <meshStandardMaterial color={berryColor} roughness={0.4} />
            </mesh>
            {/* Seeds */}
            {Array.from({ length: 6 }).map((_, s) => (
              <mesh key={s} position={[Math.cos(s) * 0.025, -0.02 + s * 0.01, Math.sin(s) * 0.025]}>
                <sphereGeometry args={[0.004, 4, 4]} />
                <meshStandardMaterial color="#ffd700" />
              </mesh>
            ))}
            {/* Calyx */}
            <mesh position={[0, 0.05, 0]}>
              <coneGeometry args={[0.025, 0.02, 5]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Enhanced environmental particles
const EnvironmentParticles: React.FC<{ type: 'rain' | 'mist'; intensity: number }> = ({ type, intensity }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = type === 'rain' ? Math.floor(intensity * 600) : Math.floor(intensity * 300);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = Math.random() * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.01;
      vel[i * 3 + 1] = type === 'rain' ? -0.15 : (Math.random() - 0.5) * 0.03;
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
        
        if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 8;
        if (positions[i * 3 + 1] > 8) positions[i * 3 + 1] = 0;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={type === 'rain' ? 0.04 : 0.08}
        color={type === 'rain' ? '#60a5fa' : '#e2e8f0'}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

// Realistic ground with texture-like appearance
const RealisticGround: React.FC<{ moisture: number }> = ({ moisture }) => {
  const groundColor = moisture > 70 ? '#1a3d0f' : moisture > 40 ? '#2d5a1a' : '#4a7c2a';
  
  return (
    <>
      {/* Main ground */}
      <mesh position={[0, -0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14, 32, 32]} />
        <meshStandardMaterial 
          color={groundColor} 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Raised garden beds */}
      {[[-2.5, -2.5], [-2.5, 2.5], [2.5, -2.5], [2.5, 2.5]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Bed frame */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[3, 0.25, 3]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[2.8, 0.1, 2.8]} />
            <meshStandardMaterial color={moisture > 60 ? '#3d2817' : '#5c4033'} roughness={0.95} />
          </mesh>
        </group>
      ))}
    </>
  );
};

// Temperature visualization with heat shimmer
const HeatShimmer: React.FC<{ temperature: number }> = ({ temperature }) => {
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    if (materialRef.current && temperature > 28) {
      materialRef.current.opacity = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.1;
    }
  });

  if (temperature < 28) return null;

  return (
    <mesh position={[0, 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12, 12]} />
      <meshBasicMaterial ref={materialRef} color="#ff6b35" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Live sensor display
const SensorDisplay: React.FC<{ temperature: number; humidity: number; moisture: number }> = ({ temperature, humidity, moisture }) => {
  return (
    <Html position={[6, 3, 0]} center>
      <div className="bg-card/95 backdrop-blur-md px-4 py-3 rounded-lg shadow-xl border border-border min-w-[160px]">
        <h4 className="text-xs font-semibold text-foreground mb-2">Live Sensors</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Temp:</span>
            <span className="text-temperature font-medium">{temperature.toFixed(1)}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Humidity:</span>
            <span className="text-humidity font-medium">{humidity.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Moisture:</span>
            <span className="text-moisture font-medium">{moisture.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </Html>
  );
};

// Main scene
const Scene: React.FC<VirtualField3DProps> = ({ temperature, humidity, moisture }) => {
  const growth = useMemo(() => Math.min(1, Math.max(0.3, (moisture / 100) * (temperature / 22))), [moisture, temperature]);

  const plantPositions = useMemo(() => {
    const positions: { type: string; pos: [number, number, number]; id: number }[] = [];
    let id = 0;
    
    // Bed 1: Tomatoes
    for (let x = 0; x < 3; x++) {
      for (let z = 0; z < 3; z++) {
        positions.push({ type: 'tomato', pos: [-2.5 + (x - 1) * 0.8, 0.25, -2.5 + (z - 1) * 0.8], id: id++ });
      }
    }
    
    // Bed 2: Lettuce
    for (let x = 0; x < 4; x++) {
      for (let z = 0; z < 4; z++) {
        positions.push({ type: 'lettuce', pos: [-2.5 + (x - 1.5) * 0.6, 0.25, 2.5 + (z - 1.5) * 0.6], id: id++ });
      }
    }
    
    // Bed 3: Peppers
    for (let x = 0; x < 3; x++) {
      for (let z = 0; z < 3; z++) {
        positions.push({ type: 'pepper', pos: [2.5 + (x - 1) * 0.8, 0.25, -2.5 + (z - 1) * 0.8], id: id++ });
      }
    }
    
    // Bed 4: Strawberries
    for (let x = 0; x < 4; x++) {
      for (let z = 0; z < 4; z++) {
        positions.push({ type: 'strawberry', pos: [2.5 + (x - 1.5) * 0.6, 0.25, 2.5 + (z - 1.5) * 0.6], id: id++ });
      }
    }
    
    return positions;
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[8, 12, 8]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-5, 8, -5]} intensity={0.4} />
      <hemisphereLight args={['#87ceeb', '#2d5a1a', 0.3]} />

      <RealisticGround moisture={moisture} />

      {/* Plants */}
      {plantPositions.map(({ type, pos, id }) => {
        const plantGrowth = growth * (0.85 + Math.sin(id * 0.7) * 0.15);
        switch (type) {
          case 'tomato':
            return <RealisticTomatoPlant key={id} position={pos} growth={plantGrowth} id={id} />;
          case 'lettuce':
            return <RealisticLettucePlant key={id} position={pos} growth={plantGrowth} id={id} />;
          case 'pepper':
            return <RealisticPepperPlant key={id} position={pos} growth={plantGrowth} id={id} />;
          case 'strawberry':
            return <RealisticStrawberryPlant key={id} position={pos} growth={plantGrowth} id={id} />;
          default:
            return null;
        }
      })}

      {/* Environmental effects */}
      {humidity > 65 && <EnvironmentParticles type="mist" intensity={(humidity - 65) / 35} />}
      {moisture > 75 && <EnvironmentParticles type="rain" intensity={(moisture - 75) / 25} />}
      <HeatShimmer temperature={temperature} />

      {/* Sensor display */}
      <SensorDisplay temperature={temperature} humidity={humidity} moisture={moisture} />

      <OrbitControls enablePan enableZoom enableRotate minDistance={4} maxDistance={18} maxPolarAngle={Math.PI / 2.1} />
      <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={45} />
    </>
  );
};

const LoadingFallback = () => (
  <Html center>
    <div className="text-primary animate-pulse font-medium">Loading 3D Field...</div>
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
