import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface GreenhouseSceneProps {
  growthWeek: number;
}

// Realistic Tomato Plant
const RealisticTomato: React.FC<{ position: [number, number, number]; week: number }> = ({ position, week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 12, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + i * 0.5) * 0.02;
        }
      });
    }
  });

  const stemHeight = 0.4 + progress * 1.6;
  const leafLayers = Math.floor(2 + progress * 5);
  const hasFruit = week >= 8;
  
  return (
    <group ref={groupRef} position={position}>
      {/* Main stem with realistic curve */}
      <mesh position={[0, stemHeight / 2, 0]}>
        <cylinderGeometry args={[0.02 + progress * 0.015, 0.035 + progress * 0.02, stemHeight, 12]} />
        <meshStandardMaterial color="#2d5a1e" roughness={0.8} />
      </mesh>

      {/* Compound leaves with realistic shape */}
      {Array.from({ length: leafLayers }).map((_, layer) => {
        const layerHeight = 0.15 + (layer / leafLayers) * stemHeight * 0.85;
        const leafCount = 3 + Math.floor(progress * 2);
        
        return Array.from({ length: leafCount }).map((_, i) => {
          const angle = (i / leafCount) * Math.PI * 2 + layer * 0.5;
          const leafLength = 0.15 + progress * 0.12;
          const droop = 0.2 + layer * 0.08;
          
          return (
            <group key={`${layer}-${i}`} position={[0, layerHeight, 0]} rotation={[droop, angle, 0]}>
              {/* Leaf petiole */}
              <mesh position={[leafLength * 0.3, 0, 0]} rotation={[0, 0, -0.2]}>
                <cylinderGeometry args={[0.008, 0.01, leafLength * 0.6, 6]} />
                <meshStandardMaterial color="#3a6b24" />
              </mesh>
              {/* Main leaflet */}
              <mesh position={[leafLength * 0.7, 0, 0]} rotation={[0, 0, 0.1]} scale={[1.8, 0.4, 1]}>
                <sphereGeometry args={[leafLength * 0.35, 12, 8]} />
                <meshStandardMaterial color="#4a8b34" roughness={0.6} side={THREE.DoubleSide} />
              </mesh>
              {/* Side leaflets */}
              <mesh position={[leafLength * 0.4, 0, 0.04]} scale={[1.2, 0.3, 0.8]}>
                <sphereGeometry args={[leafLength * 0.2, 8, 6]} />
                <meshStandardMaterial color="#52993c" roughness={0.6} />
              </mesh>
              <mesh position={[leafLength * 0.4, 0, -0.04]} scale={[1.2, 0.3, 0.8]}>
                <sphereGeometry args={[leafLength * 0.2, 8, 6]} />
                <meshStandardMaterial color="#52993c" roughness={0.6} />
              </mesh>
            </group>
          );
        });
      })}

      {/* Flower clusters */}
      {week >= 6 && week < 10 && Array.from({ length: 4 }).map((_, i) => (
        <group key={`flower-${i}`} position={[
          Math.cos(i * 1.5) * 0.12,
          stemHeight * (0.6 + i * 0.08),
          Math.sin(i * 1.5) * 0.12
        ]}>
          {[0, 1, 2, 3, 4].map((p) => (
            <mesh key={p} position={[Math.cos(p * 1.25) * 0.02, 0, Math.sin(p * 1.25) * 0.02]}>
              <sphereGeometry args={[0.012, 6, 6]} />
              <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.2} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Realistic tomatoes */}
      {hasFruit && Array.from({ length: Math.min(6, week - 7) }).map((_, i) => {
        const ripeness = Math.min(1, (week - 8 - i * 0.3) / 4);
        const tomatoColor = new THREE.Color().lerpColors(
          new THREE.Color('#4a9c3a'),
          new THREE.Color('#e53e3e'),
          ripeness
        );
        const size = 0.06 + ripeness * 0.08;
        
        return (
          <group key={`tomato-${i}`} position={[
            Math.cos(i * 1.2) * 0.15,
            stemHeight * (0.45 + i * 0.07),
            Math.sin(i * 1.2) * 0.15
          ]}>
            {/* Tomato body */}
            <mesh scale={[1, 0.85, 1]}>
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial color={tomatoColor} roughness={0.3} metalness={0.1} />
            </mesh>
            {/* Calyx (green top) */}
            <mesh position={[0, size * 0.75, 0]}>
              <coneGeometry args={[size * 0.4, size * 0.3, 5]} />
              <meshStandardMaterial color="#2d5a1e" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Realistic Lettuce
const RealisticLettuce: React.FC<{ position: [number, number, number]; week: number }> = ({ position, week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 8, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  const leafCount = Math.floor(6 + progress * 14);
  const headSize = 0.1 + progress * 0.25;

  return (
    <group ref={groupRef} position={position}>
      {/* Rosette of leaves */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const layer = Math.floor(i / 5);
        const angleOffset = layer * 0.3;
        const angle = (i % 5) / 5 * Math.PI * 2 + angleOffset;
        const leafSize = headSize * (0.6 + layer * 0.15);
        const height = layer * 0.03;
        const curl = 0.15 + layer * 0.1;
        
        return (
          <group key={i} position={[0, height, 0]} rotation={[curl, angle, 0]}>
            {/* Wavy lettuce leaf */}
            <mesh position={[leafSize * 0.5, 0, 0]} scale={[2, 0.15, 1.2]}>
              <sphereGeometry args={[leafSize * 0.5, 16, 12]} />
              <meshStandardMaterial 
                color={layer < 2 ? '#c8e6c9' : '#81c784'} 
                roughness={0.7}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Leaf vein */}
            <mesh position={[leafSize * 0.4, 0.01, 0]} rotation={[0, 0, -0.1]}>
              <cylinderGeometry args={[0.003, 0.005, leafSize * 0.7, 4]} />
              <meshStandardMaterial color="#a5d6a7" />
            </mesh>
          </group>
        );
      })}

      {/* Core/heart */}
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[headSize * 0.3, 12, 12]} />
        <meshStandardMaterial color="#f1f8e9" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Realistic Pepper Plant
const RealisticPepper: React.FC<{ position: [number, number, number]; week: number }> = ({ position, week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 14, 1);
  
  const stemHeight = 0.3 + progress * 1.4;
  const branchCount = Math.floor(3 + progress * 5);
  const hasFruit = week >= 10;

  return (
    <group ref={groupRef} position={position}>
      {/* Main woody stem */}
      <mesh position={[0, stemHeight / 2, 0]}>
        <cylinderGeometry args={[0.025, 0.04, stemHeight, 10]} />
        <meshStandardMaterial color="#3d5c2a" roughness={0.85} />
      </mesh>

      {/* Branches with leaves */}
      {Array.from({ length: branchCount }).map((_, i) => {
        const angle = (i / branchCount) * Math.PI * 2;
        const branchHeight = 0.15 + (i / branchCount) * stemHeight * 0.75;
        const branchLength = 0.12 + progress * 0.1;
        
        return (
          <group key={i} position={[0, branchHeight, 0]} rotation={[0.4, angle, 0]}>
            {/* Branch */}
            <mesh position={[branchLength / 2, 0, 0]} rotation={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.01, 0.015, branchLength, 6]} />
              <meshStandardMaterial color="#4a6b36" />
            </mesh>
            {/* Oval leaves */}
            <mesh position={[branchLength, 0, 0]} scale={[1.5, 0.4, 1]}>
              <sphereGeometry args={[0.08 + progress * 0.04, 10, 8]} />
              <meshStandardMaterial color="#4caf50" roughness={0.5} />
            </mesh>
            <mesh position={[branchLength * 0.7, 0.03, 0.03]} scale={[1.3, 0.35, 0.9]}>
              <sphereGeometry args={[0.06 + progress * 0.03, 8, 6]} />
              <meshStandardMaterial color="#66bb6a" roughness={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Bell peppers */}
      {hasFruit && Array.from({ length: Math.min(4, week - 9) }).map((_, i) => {
        const colors = ['#e53935', '#fdd835', '#ff9800', '#43a047'];
        const size = 0.07 + ((week - 10) / 4) * 0.06;
        
        return (
          <group key={`pepper-${i}`} position={[
            Math.cos(i * 1.6) * 0.14,
            stemHeight * (0.35 + i * 0.1),
            Math.sin(i * 1.6) * 0.14
          ]} rotation={[0.2, i, 0]}>
            {/* Pepper body - blocky shape */}
            <mesh scale={[1, 1.3, 1]}>
              <boxGeometry args={[size, size * 1.5, size]} />
              <meshStandardMaterial color={colors[i % 4]} roughness={0.25} />
            </mesh>
            {/* Stem */}
            <mesh position={[0, size * 0.9, 0]}>
              <cylinderGeometry args={[0.008, 0.012, 0.03, 6]} />
              <meshStandardMaterial color="#2e7d32" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Modern Greenhouse Structure
const ModernGreenhouse: React.FC = () => {
  return (
    <group>
      {/* Steel frame - main posts */}
      {[[-4.5, -3.5], [-4.5, 3.5], [4.5, -3.5], [4.5, 3.5], [0, -3.5], [0, 3.5]].map((pos, i) => (
        <mesh key={`post-${i}`} position={[pos[0], 2.5, pos[1]]}>
          <cylinderGeometry args={[0.06, 0.06, 5, 8]} />
          <meshStandardMaterial color="#37474f" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Arched roof beams */}
      {[-3.5, 0, 3.5].map((z, i) => (
        <group key={`arch-${i}`} position={[0, 4.5, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[4.5, 0.04, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#37474f" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Cross beams */}
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <mesh key={`beam-${i}`} position={[x, 5.2 - Math.abs(x) * 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 7, 6]} />
          <meshStandardMaterial color="#455a64" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Glass panels - sides */}
      <mesh position={[0, 2.5, 3.6]}>
        <planeGeometry args={[9.5, 5]} />
        <meshPhysicalMaterial color="#e3f2fd" transparent opacity={0.25} roughness={0.05} metalness={0} />
      </mesh>
      <mesh position={[0, 2.5, -3.6]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[9.5, 5]} />
        <meshPhysicalMaterial color="#e3f2fd" transparent opacity={0.25} roughness={0.05} metalness={0} />
      </mesh>
      <mesh position={[-4.7, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[7.2, 5]} />
        <meshPhysicalMaterial color="#e3f2fd" transparent opacity={0.25} roughness={0.05} metalness={0} />
      </mesh>
      <mesh position={[4.7, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[7.2, 5]} />
        <meshPhysicalMaterial color="#e3f2fd" transparent opacity={0.25} roughness={0.05} metalness={0} />
      </mesh>

      {/* Ventilation panels on roof */}
      {[-2, 2].map((x, i) => (
        <mesh key={`vent-${i}`} position={[x, 5.3, 0]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[1.5, 0.02, 1]} />
          <meshStandardMaterial color="#78909c" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Raised garden beds */}
      {[-3, 0, 3].map((z, i) => (
        <mesh key={`bed-${i}`} position={[0, 0.2, z]}>
          <boxGeometry args={[8, 0.4, 1.8]} />
          <meshStandardMaterial color="#4e342e" roughness={0.9} />
        </mesh>
      ))}

      {/* Rich soil in beds */}
      {[-3, 0, 3].map((z, i) => (
        <mesh key={`soil-${i}`} position={[0, 0.42, z]}>
          <boxGeometry args={[7.8, 0.05, 1.6]} />
          <meshStandardMaterial color="#3e2723" roughness={1} />
        </mesh>
      ))}

      {/* Drip irrigation lines */}
      {[-3, 0, 3].map((z, i) => (
        <group key={`irrigation-${i}`}>
          <mesh position={[0, 0.48, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, 7.5, 8]} />
            <meshStandardMaterial color="#1565c0" />
          </mesh>
          {/* Drip emitters */}
          {[-3, -1.5, 0, 1.5, 3].map((x, j) => (
            <mesh key={`drip-${j}`} position={[x, 0.48, z]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color="#0d47a1" />
            </mesh>
          ))}
        </group>
      ))}

      {/* LED grow lights */}
      {[-2.5, 0, 2.5].map((x, i) => (
        <group key={`light-${i}`} position={[x, 4.2, 0]}>
          <mesh>
            <boxGeometry args={[0.3, 0.06, 6]} />
            <meshStandardMaterial color="#212121" metalness={0.8} roughness={0.3} />
          </mesh>
          <pointLight position={[0, -0.3, 0]} color="#ff80ab" intensity={0.4} distance={4} />
          <pointLight position={[0, -0.3, -2]} color="#ce93d8" intensity={0.3} distance={3} />
          <pointLight position={[0, -0.3, 2]} color="#ce93d8" intensity={0.3} distance={3} />
        </group>
      ))}

      {/* Climate sensors */}
      {[[-4, 2, 0], [4, 2, 0], [0, 3.5, -3]].map((pos, i) => (
        <group key={`sensor-${i}`} position={pos as [number, number, number]}>
          <mesh>
            <boxGeometry args={[0.12, 0.12, 0.04]} />
            <meshStandardMaterial color="#00c853" emissive="#00c853" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <circleGeometry args={[0.02, 12]} />
            <meshStandardMaterial color="#69f0ae" emissive="#69f0ae" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}

      {/* Floor/ground */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#263238" roughness={0.95} />
      </mesh>
    </group>
  );
};

// Main scene
const Scene: React.FC<GreenhouseSceneProps> = ({ growthWeek }) => {
  const plantRows = useMemo(() => [
    // Row 1 - Tomatoes
    { z: -3, plants: Array.from({ length: 6 }, (_, i) => ({ x: -3 + i * 1.2, type: 'tomato' as const })) },
    // Row 2 - Lettuce
    { z: 0, plants: Array.from({ length: 8 }, (_, i) => ({ x: -3.5 + i * 1, type: 'lettuce' as const })) },
    // Row 3 - Peppers
    { z: 3, plants: Array.from({ length: 6 }, (_, i) => ({ x: -3 + i * 1.2, type: 'pepper' as const })) },
  ], []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 8]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-8, 10, -5]} intensity={0.4} color="#b3e5fc" />
      <hemisphereLight intensity={0.3} color="#87ceeb" groundColor="#3e2723" />

      <ModernGreenhouse />

      {/* Plants */}
      {plantRows.map((row, ri) => 
        row.plants.map((plant, pi) => {
          const key = `${ri}-${pi}`;
          const pos: [number, number, number] = [plant.x, 0.45, row.z];
          
          switch (plant.type) {
            case 'tomato':
              return <RealisticTomato key={key} position={pos} week={growthWeek} />;
            case 'lettuce':
              return <RealisticLettuce key={key} position={pos} week={growthWeek} />;
            case 'pepper':
              return <RealisticPepper key={key} position={pos} week={growthWeek} />;
          }
        })
      )}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.5, 0]}
      />
      <PerspectiveCamera makeDefault position={[10, 7, 10]} fov={45} />
    </>
  );
};

const LoadingFallback = () => (
  <Html center>
    <div className="text-primary animate-pulse text-lg font-medium">Loading 3D Greenhouse...</div>
  </Html>
);

export const Greenhouse3D: React.FC<GreenhouseSceneProps> = ({ growthWeek }) => {
  return (
    <div style={{ height: '100%', minHeight: '450px', background: 'linear-gradient(180deg, #1a237e 0%, #0d47a1 50%, #263238 100%)' }}>
      <Canvas shadows>
        <Suspense fallback={<LoadingFallback />}>
          <fog attach="fog" args={['#1a237e', 15, 40]} />
          <Scene growthWeek={growthWeek} />
        </Suspense>
      </Canvas>
    </div>
  );
};
