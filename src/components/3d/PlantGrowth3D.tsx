import React, { useRef, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';

interface PlantGrowth3DProps {
  plantType: 'tomato' | 'strawberry' | 'pepper' | 'carrot';
  currentWeek: number;
  maxWeeks: number;
}

// Detailed Tomato Plant with growth stages
const TomatoPlant: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 12, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  const stemHeight = 0.3 + progress * 2.2;
  const stemWidth = 0.04 + progress * 0.06;
  const leafCount = Math.floor(2 + progress * 8);
  const hasFruit = week >= 8;
  const fruitSize = week >= 8 ? ((week - 8) / 4) * 0.25 : 0;
  const hasFlowers = week >= 6 && week < 10;

  return (
    <group ref={groupRef}>
      {/* Soil mound */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>

      {/* Main stem */}
      <mesh position={[0, stemHeight / 2 + 0.1, 0]}>
        <cylinderGeometry args={[stemWidth * 0.8, stemWidth, stemHeight, 8]} />
        <meshStandardMaterial color="#2d5016" roughness={0.7} />
      </mesh>

      {/* Branches and leaves */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const angle = (i / leafCount) * Math.PI * 2 + i * 0.5;
        const height = 0.2 + (i / leafCount) * stemHeight * 0.8;
        const branchLength = 0.15 + progress * 0.25;
        
        return (
          <group key={i} position={[0, height, 0]} rotation={[0, angle, 0]}>
            {/* Branch */}
            <mesh position={[branchLength / 2, 0, 0]} rotation={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.015, 0.02, branchLength, 6]} />
              <meshStandardMaterial color="#3d6b1f" />
            </mesh>
            {/* Leaf cluster */}
            <group position={[branchLength, 0, 0]}>
              <mesh rotation={[0.2, 0, 0.5]}>
                <sphereGeometry args={[0.12 + progress * 0.08, 8, 6]} />
                <meshStandardMaterial color="#4ade80" roughness={0.6} />
              </mesh>
              <mesh position={[0.08, 0, 0.05]} rotation={[0.1, 0.3, 0.3]}>
                <sphereGeometry args={[0.08 + progress * 0.05, 6, 4]} />
                <meshStandardMaterial color="#22c55e" roughness={0.6} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Flowers */}
      {hasFlowers && Array.from({ length: 3 }).map((_, i) => (
        <mesh key={`flower-${i}`} position={[
          Math.cos(i * 2) * 0.2,
          stemHeight * 0.7 + i * 0.1,
          Math.sin(i * 2) * 0.2
        ]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Tomatoes */}
      {hasFruit && Array.from({ length: Math.min(5, week - 7) }).map((_, i) => {
        const ripeness = Math.min(1, (week - 8 - i * 0.5) / 3);
        const color = new THREE.Color().lerpColors(
          new THREE.Color('#22c55e'),
          new THREE.Color('#dc2626'),
          ripeness
        );
        
        return (
          <mesh key={`fruit-${i}`} position={[
            Math.cos(i * 1.5) * 0.25,
            stemHeight * (0.5 + i * 0.08),
            Math.sin(i * 1.5) * 0.25
          ]}>
            <sphereGeometry args={[fruitSize * (0.7 + i * 0.1), 12, 12]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
        );
      })}

      {/* Growth stage label */}
      <Html position={[0, stemHeight + 0.5, 0]} center>
        <div className="bg-card/90 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          Week {week} - {week < 3 ? 'Seedling' : week < 6 ? 'Vegetative' : week < 8 ? 'Flowering' : week < 10 ? 'Fruit Set' : 'Ripening'}
        </div>
      </Html>
    </group>
  );
};

// Strawberry plant with detailed growth
const StrawberryPlant: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 16, 1);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    }
  });

  const leafCount = Math.floor(3 + progress * 9);
  const hasFlowers = week >= 10;
  const hasFruit = week >= 12;

  return (
    <group ref={groupRef}>
      {/* Crown/base */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.15, 12]} />
        <meshStandardMaterial color="#4a2c0a" roughness={0.8} />
      </mesh>

      {/* Leaves in rosette pattern */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const angle = (i / leafCount) * Math.PI * 2;
        const leafLength = 0.2 + progress * 0.15;
        
        return (
          <group key={i} rotation={[0, angle, 0]}>
            {/* Leaf stem (petiole) */}
            <mesh position={[0.08, 0.15, 0]} rotation={[0, 0, -0.8]}>
              <cylinderGeometry args={[0.012, 0.015, 0.15, 6]} />
              <meshStandardMaterial color="#2d5016" />
            </mesh>
            {/* Trifoliate leaf */}
            <group position={[0.2, 0.25, 0]} rotation={[-0.3, 0, 0]}>
              <mesh>
                <sphereGeometry args={[leafLength * 0.5, 8, 6]} />
                <meshStandardMaterial color="#16a34a" roughness={0.5} />
              </mesh>
              <mesh position={[-0.06, 0, 0.04]}>
                <sphereGeometry args={[leafLength * 0.35, 6, 4]} />
                <meshStandardMaterial color="#22c55e" roughness={0.5} />
              </mesh>
              <mesh position={[0.06, 0, 0.04]}>
                <sphereGeometry args={[leafLength * 0.35, 6, 4]} />
                <meshStandardMaterial color="#22c55e" roughness={0.5} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Runners */}
      {week >= 8 && (
        <mesh position={[0.3, 0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.4, 4]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
      )}

      {/* Flowers */}
      {hasFlowers && Array.from({ length: 4 }).map((_, i) => (
        <group key={`flower-${i}`} position={[
          Math.cos(i * 1.5) * 0.15,
          0.3 + i * 0.03,
          Math.sin(i * 1.5) * 0.15
        ]}>
          {[0, 1, 2, 3, 4].map((p) => (
            <mesh key={p} rotation={[0.3, p * (Math.PI * 2 / 5), 0]} position={[0.03, 0, 0]}>
              <sphereGeometry args={[0.02, 6, 4]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </group>
      ))}

      {/* Strawberries */}
      {hasFruit && Array.from({ length: Math.min(4, week - 11) }).map((_, i) => {
        const ripeness = Math.min(1, (week - 12 - i * 0.8) / 3);
        
        return (
          <group key={`fruit-${i}`} position={[
            Math.cos(i * 2) * 0.18,
            0.15 + i * 0.02,
            Math.sin(i * 2) * 0.18
          ]}>
            <mesh rotation={[0.2, 0, 0]}>
              <coneGeometry args={[0.06 + ripeness * 0.04, 0.12 + ripeness * 0.06, 8]} />
              <meshStandardMaterial 
                color={ripeness > 0.5 ? '#dc2626' : '#22c55e'} 
                roughness={0.3} 
              />
            </mesh>
            {/* Seeds */}
            {ripeness > 0.3 && Array.from({ length: 8 }).map((_, s) => (
              <mesh key={s} position={[
                Math.cos(s) * 0.05,
                -0.02 + s * 0.01,
                Math.sin(s) * 0.05
              ]}>
                <sphereGeometry args={[0.008, 4, 4]} />
                <meshStandardMaterial color="#fbbf24" />
              </mesh>
            ))}
          </group>
        );
      })}

      <Html position={[0, 0.6, 0]} center>
        <div className="bg-card/90 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          Week {week} - {week < 4 ? 'Establishment' : week < 8 ? 'Vegetative' : week < 10 ? 'Runner' : week < 12 ? 'Flowering' : 'Fruiting'}
        </div>
      </Html>
    </group>
  );
};

// Bell Pepper plant
const PepperPlant: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 14, 1);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.02;
    }
  });

  const stemHeight = 0.2 + progress * 1.8;
  const branchCount = Math.floor(2 + progress * 6);
  const hasFruit = week >= 10;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>

      {/* Main stem */}
      <mesh position={[0, stemHeight / 2 + 0.1, 0]}>
        <cylinderGeometry args={[0.03 + progress * 0.02, 0.05 + progress * 0.03, stemHeight, 8]} />
        <meshStandardMaterial color="#365314" roughness={0.7} />
      </mesh>

      {/* Branches with leaves */}
      {Array.from({ length: branchCount }).map((_, i) => {
        const angle = (i / branchCount) * Math.PI * 2;
        const height = 0.25 + (i / branchCount) * stemHeight * 0.7;
        
        return (
          <group key={i} position={[0, height, 0]} rotation={[0, angle, 0]}>
            <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.4]}>
              <cylinderGeometry args={[0.015, 0.02, 0.25, 6]} />
              <meshStandardMaterial color="#365314" />
            </mesh>
            <mesh position={[0.28, 0.05, 0]} rotation={[0.3, 0, 0.2]}>
              <sphereGeometry args={[0.1 + progress * 0.06, 8, 6]} />
              <meshStandardMaterial color="#4ade80" roughness={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Peppers */}
      {hasFruit && Array.from({ length: Math.min(4, week - 9) }).map((_, i) => {
        const colors = ['#dc2626', '#f59e0b', '#22c55e', '#eab308'];
        const pepperSize = 0.08 + ((week - 10) / 4) * 0.12;
        
        return (
          <mesh key={`pepper-${i}`} position={[
            Math.cos(i * 1.8) * 0.2,
            stemHeight * (0.4 + i * 0.12),
            Math.sin(i * 1.8) * 0.2
          ]} rotation={[0.2, i * 0.5, 0]}>
            <boxGeometry args={[pepperSize, pepperSize * 1.5, pepperSize]} />
            <meshStandardMaterial color={colors[i % 4]} roughness={0.3} />
          </mesh>
        );
      })}

      <Html position={[0, stemHeight + 0.4, 0]} center>
        <div className="bg-card/90 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          Week {week} - {week < 3 ? 'Seedling' : week < 6 ? 'Vegetative' : week < 8 ? 'Flowering' : week < 10 ? 'Fruit Set' : 'Ripening'}
        </div>
      </Html>
    </group>
  );
};

// Carrot plant (root vegetable)
const CarrotPlant: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 12, 1);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (child.type === 'Group') {
          child.rotation.x = Math.sin(state.clock.elapsedTime * 2 + i) * 0.05;
        }
      });
    }
  });

  const foliageHeight = 0.15 + progress * 0.4;
  const rootLength = progress * 0.5;
  const leafCount = Math.floor(3 + progress * 8);

  return (
    <group ref={groupRef}>
      {/* Soil surface */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.1, 16]} />
        <meshStandardMaterial color="#3d2817" roughness={0.9} />
      </mesh>

      {/* Carrot root (underground - partially visible) */}
      <mesh position={[0, -rootLength / 2, 0]}>
        <coneGeometry args={[0.05 + progress * 0.04, rootLength, 12]} />
        <meshStandardMaterial color="#f97316" roughness={0.6} />
      </mesh>

      {/* Carrot crown */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.06, 12]} />
        <meshStandardMaterial color="#ea580c" roughness={0.5} />
      </mesh>

      {/* Feathery foliage */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const angle = (i / leafCount) * Math.PI * 2;
        const lean = 0.3 + Math.random() * 0.4;
        
        return (
          <group key={i} position={[0, 0.05, 0]} rotation={[lean, angle, 0]}>
            {/* Main frond */}
            <mesh position={[0, foliageHeight / 2, 0]}>
              <cylinderGeometry args={[0.008, 0.012, foliageHeight, 4]} />
              <meshStandardMaterial color="#16a34a" />
            </mesh>
            {/* Leaflets */}
            {Array.from({ length: 5 }).map((_, l) => (
              <mesh key={l} position={[
                (l % 2 === 0 ? 0.03 : -0.03),
                0.08 + l * foliageHeight * 0.15,
                0
              ]} rotation={[0, 0, l % 2 === 0 ? 0.5 : -0.5]}>
                <sphereGeometry args={[0.02 + progress * 0.01, 4, 3]} />
                <meshStandardMaterial color="#4ade80" roughness={0.6} />
              </mesh>
            ))}
          </group>
        );
      })}

      <Html position={[0, foliageHeight + 0.2, 0]} center>
        <div className="bg-card/90 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          Week {week} - {week < 2 ? 'Germination' : week < 4 ? 'Seedling' : week < 8 ? 'Root Development' : 'Sizing'}
        </div>
      </Html>
    </group>
  );
};

// Scene with all 4 plant types
const GrowthScene: React.FC<PlantGrowth3DProps> = ({ plantType, currentWeek, maxWeeks }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 4, -3]} intensity={0.4} color="#ffd700" />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Plant based on type */}
      {plantType === 'tomato' && <TomatoPlant week={currentWeek} />}
      {plantType === 'strawberry' && <StrawberryPlant week={currentWeek} />}
      {plantType === 'pepper' && <PepperPlant week={currentWeek} />}
      {plantType === 'carrot' && <CarrotPlant week={currentWeek} />}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={5}
        maxPolarAngle={Math.PI / 2}
      />
      <PerspectiveCamera makeDefault position={[2, 1.5, 2]} fov={45} />
    </>
  );
};

const LoadingFallback = () => (
  <Html center>
    <div className="text-primary animate-pulse">Loading Plant...</div>
  </Html>
);

export const PlantGrowth3D: React.FC<PlantGrowth3DProps> = (props) => {
  return (
    <div className="three-canvas" style={{ height: '100%', minHeight: '350px' }}>
      <Canvas shadows>
        <Suspense fallback={<LoadingFallback />}>
          <GrowthScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};
