import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';

interface PlantGrowth3DProps {
  plantType: 'tomato' | 'strawberry' | 'pepper' | 'carrot';
  currentWeek: number;
  maxWeeks: number;
}

// Detailed Realistic Tomato
const DetailedTomato: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 12, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.03;
    }
  });

  const stemHeight = 0.5 + progress * 2;
  const leafSets = Math.floor(3 + progress * 6);
  
  return (
    <group ref={groupRef}>
      {/* Soil mound */}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.35, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Main stem - woody at base */}
      <mesh position={[0, stemHeight / 2 + 0.1, 0]}>
        <cylinderGeometry args={[0.025, 0.045, stemHeight, 12]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.75} />
      </mesh>

      {/* Compound tomato leaves */}
      {Array.from({ length: leafSets }).map((_, set) => {
        const setHeight = 0.2 + (set / leafSets) * stemHeight * 0.85;
        const leavesInSet = 2 + Math.floor(progress * 2);
        
        return Array.from({ length: leavesInSet }).map((_, i) => {
          const baseAngle = set * 0.8;
          const angle = baseAngle + (i / leavesInSet) * Math.PI * 2;
          const size = 0.12 + progress * 0.08;
          
          return (
            <group key={`${set}-${i}`} position={[0, setHeight, 0]} rotation={[0.35, angle, 0]}>
              {/* Petiole */}
              <mesh position={[size * 0.4, 0, 0]} rotation={[0, 0, -0.25]}>
                <cylinderGeometry args={[0.006, 0.01, size * 0.8, 6]} />
                <meshStandardMaterial color="#388e3c" />
              </mesh>
              {/* Main leaflet - serrated look */}
              <mesh position={[size * 0.9, 0, 0]} scale={[2.2, 0.35, 1.3]}>
                <dodecahedronGeometry args={[size * 0.3]} />
                <meshStandardMaterial color="#43a047" roughness={0.55} flatShading />
              </mesh>
              {/* Side leaflets */}
              {[0.5, 0.7].map((offset, li) => (
                <React.Fragment key={li}>
                  <mesh position={[size * offset, 0, 0.04]} scale={[1.5, 0.25, 0.9]}>
                    <dodecahedronGeometry args={[size * 0.18]} />
                    <meshStandardMaterial color="#66bb6a" roughness={0.5} flatShading />
                  </mesh>
                  <mesh position={[size * offset, 0, -0.04]} scale={[1.5, 0.25, 0.9]}>
                    <dodecahedronGeometry args={[size * 0.18]} />
                    <meshStandardMaterial color="#66bb6a" roughness={0.5} flatShading />
                  </mesh>
                </React.Fragment>
              ))}
            </group>
          );
        });
      })}

      {/* Yellow flower clusters */}
      {week >= 5 && week < 9 && Array.from({ length: 5 }).map((_, i) => (
        <group key={`flower-${i}`} position={[
          Math.cos(i * 1.3) * 0.18,
          stemHeight * (0.55 + i * 0.07),
          Math.sin(i * 1.3) * 0.18
        ]}>
          {[0, 1, 2, 3, 4].map((p) => (
            <mesh key={p} position={[Math.cos(p * 1.26) * 0.025, 0, Math.sin(p * 1.26) * 0.025]} rotation={[0.4, p * 1.26, 0]}>
              <coneGeometry args={[0.015, 0.03, 5]} />
              <meshStandardMaterial color="#ffd54f" />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="#ff8f00" />
          </mesh>
        </group>
      ))}

      {/* Realistic tomatoes with details */}
      {week >= 7 && Array.from({ length: Math.min(8, week - 6) }).map((_, i) => {
        const ripeness = Math.min(1, (week - 7 - i * 0.25) / 4);
        const color = new THREE.Color().lerpColors(
          new THREE.Color('#558b2f'),
          new THREE.Color('#c62828'),
          ripeness
        );
        const size = 0.08 + ripeness * 0.1;
        
        return (
          <group key={`tomato-${i}`} position={[
            Math.cos(i * 0.9) * 0.22,
            stemHeight * (0.4 + i * 0.055),
            Math.sin(i * 0.9) * 0.22
          ]}>
            {/* Tomato body with slight depression on top */}
            <mesh scale={[1, 0.82, 1]}>
              <sphereGeometry args={[size, 20, 20]} />
              <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} />
            </mesh>
            {/* Segments (subtle) */}
            {[0, 1, 2, 3].map((s) => (
              <mesh key={s} position={[Math.cos(s * Math.PI / 2) * size * 0.02, -size * 0.1, Math.sin(s * Math.PI / 2) * size * 0.02]} scale={[0.9, 0.75, 0.9]}>
                <sphereGeometry args={[size * 0.98, 12, 12]} />
                <meshStandardMaterial color={color} roughness={0.3} transparent opacity={0.3} />
              </mesh>
            ))}
            {/* Green calyx star */}
            {[0, 1, 2, 3, 4].map((s) => (
              <mesh key={`calyx-${s}`} position={[
                Math.cos(s * Math.PI * 0.4) * size * 0.35,
                size * 0.7,
                Math.sin(s * Math.PI * 0.4) * size * 0.35
              ]} rotation={[0.5, s * Math.PI * 0.4, 0]}>
                <coneGeometry args={[0.015, 0.05, 3]} />
                <meshStandardMaterial color="#2e7d32" />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Stage label */}
      <Html position={[0, stemHeight + 0.6, 0]} center>
        <div className="bg-background/95 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border">
          Week {week}: {week < 3 ? '🌱 Seedling' : week < 5 ? '🌿 Vegetative' : week < 7 ? '🌼 Flowering' : week < 9 ? '🍅 Fruit Set' : '✅ Ripening'}
        </div>
      </Html>
    </group>
  );
};

// Realistic Strawberry Plant
const DetailedStrawberry: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 16, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.04;
    }
  });

  const leafCount = Math.floor(5 + progress * 12);
  const hasFlowers = week >= 9;
  const hasFruit = week >= 11;

  return (
    <group ref={groupRef}>
      {/* Crown base */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.12, 14]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </mesh>

      {/* Trifoliate leaves in rosette */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const layer = Math.floor(i / 4);
        const angle = (i % 4) / 4 * Math.PI * 2 + layer * 0.4;
        const petioleLength = 0.15 + progress * 0.1 + layer * 0.03;
        const leafSize = 0.08 + progress * 0.04;
        const droop = 0.25 + layer * 0.12;
        
        return (
          <group key={i} position={[0, 0.1, 0]} rotation={[droop, angle, 0]}>
            {/* Long petiole */}
            <mesh position={[petioleLength / 2, 0, 0]} rotation={[0, 0, -0.15]}>
              <cylinderGeometry args={[0.008, 0.012, petioleLength, 6]} />
              <meshStandardMaterial color="#558b2f" />
            </mesh>
            {/* Three leaflets - strawberry trifoliate */}
            <group position={[petioleLength, 0, 0]}>
              {/* Center leaflet */}
              <mesh scale={[2, 0.3, 1.4]}>
                <icosahedronGeometry args={[leafSize]} />
                <meshStandardMaterial color="#4caf50" roughness={0.45} flatShading />
              </mesh>
              {/* Serrated edge detail */}
              {[0, 1, 2, 3, 4].map((t) => (
                <mesh key={t} position={[leafSize * (0.3 + t * 0.15), 0, leafSize * (t % 2 === 0 ? 0.12 : -0.12)]}>
                  <tetrahedronGeometry args={[0.015]} />
                  <meshStandardMaterial color="#66bb6a" flatShading />
                </mesh>
              ))}
              {/* Side leaflets */}
              <mesh position={[-0.04, 0, 0.06]} rotation={[0, 0.4, 0]} scale={[1.6, 0.25, 1.1]}>
                <icosahedronGeometry args={[leafSize * 0.7]} />
                <meshStandardMaterial color="#66bb6a" roughness={0.5} flatShading />
              </mesh>
              <mesh position={[-0.04, 0, -0.06]} rotation={[0, -0.4, 0]} scale={[1.6, 0.25, 1.1]}>
                <icosahedronGeometry args={[leafSize * 0.7]} />
                <meshStandardMaterial color="#66bb6a" roughness={0.5} flatShading />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Stolons (runners) */}
      {week >= 7 && (
        <group>
          <mesh position={[0.25, 0.04, 0.1]} rotation={[0, 0.5, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.4, 6]} />
            <meshStandardMaterial color="#8d6e63" />
          </mesh>
          <mesh position={[0.4, 0.02, 0.15]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#a5d6a7" />
          </mesh>
        </group>
      )}

      {/* White flowers with yellow centers */}
      {hasFlowers && Array.from({ length: 5 }).map((_, i) => (
        <group key={`flower-${i}`} position={[
          Math.cos(i * 1.3) * 0.14,
          0.2 + i * 0.02,
          Math.sin(i * 1.3) * 0.14
        ]}>
          {[0, 1, 2, 3, 4].map((p) => (
            <mesh key={p} position={[Math.cos(p * 1.26) * 0.025, 0, Math.sin(p * 1.26) * 0.025]} rotation={[0.5, p * 1.26, 0]} scale={[1, 0.2, 0.8]}>
              <sphereGeometry args={[0.02, 8, 6]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.015, 10, 10]} />
            <meshStandardMaterial color="#ffeb3b" />
          </mesh>
        </group>
      ))}

      {/* Realistic strawberries */}
      {hasFruit && Array.from({ length: Math.min(5, week - 10) }).map((_, i) => {
        const ripeness = Math.min(1, (week - 11 - i * 0.6) / 4);
        const size = 0.04 + ripeness * 0.05;
        
        return (
          <group key={`berry-${i}`} position={[
            Math.cos(i * 1.4) * 0.16,
            0.08 + i * 0.015,
            Math.sin(i * 1.4) * 0.16
          ]} rotation={[0.3, 0, 0]}>
            {/* Berry body - heart/cone shape */}
            <mesh scale={[1, 1.3, 1]}>
              <coneGeometry args={[size, size * 2.2, 12]} />
              <meshStandardMaterial color={ripeness > 0.4 ? '#c62828' : '#7cb342'} roughness={0.35} />
            </mesh>
            {/* Seeds (achenes) */}
            {Array.from({ length: 20 }).map((_, s) => {
              const seedAngle = s * 0.5;
              const seedHeight = -size + (s % 5) * size * 0.4;
              return (
                <mesh key={s} position={[
                  Math.cos(seedAngle) * (size * 0.85 - Math.abs(seedHeight) * 0.3),
                  seedHeight,
                  Math.sin(seedAngle) * (size * 0.85 - Math.abs(seedHeight) * 0.3)
                ]}>
                  <sphereGeometry args={[0.006, 4, 4]} />
                  <meshStandardMaterial color="#ffcc80" />
                </mesh>
              );
            })}
            {/* Green calyx */}
            {[0, 1, 2, 3, 4].map((c) => (
              <mesh key={`calyx-${c}`} position={[
                Math.cos(c * 1.26) * size * 0.5,
                size * 0.8,
                Math.sin(c * 1.26) * size * 0.5
              ]} rotation={[-0.3, c * 1.26, 0.5]}>
                <coneGeometry args={[0.018, 0.06, 4]} />
                <meshStandardMaterial color="#388e3c" />
              </mesh>
            ))}
          </group>
        );
      })}

      <Html position={[0, 0.55, 0]} center>
        <div className="bg-background/95 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border">
          Week {week}: {week < 4 ? '🌱 Establishment' : week < 7 ? '🌿 Vegetative' : week < 9 ? '🔗 Runner' : week < 11 ? '🌸 Flowering' : '🍓 Fruiting'}
        </div>
      </Html>
    </group>
  );
};

// Realistic Bell Pepper
const DetailedPepper: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 14, 1);
  
  const stemHeight = 0.4 + progress * 1.5;
  const branchCount = Math.floor(4 + progress * 4);

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Woody main stem */}
      <mesh position={[0, stemHeight / 2 + 0.1, 0]}>
        <cylinderGeometry args={[0.03, 0.05, stemHeight, 10]} />
        <meshStandardMaterial color="#33691e" roughness={0.8} />
      </mesh>

      {/* Branches with oval leaves */}
      {Array.from({ length: branchCount }).map((_, i) => {
        const angle = (i / branchCount) * Math.PI * 2;
        const branchHeight = 0.2 + (i / branchCount) * stemHeight * 0.7;
        
        return (
          <group key={i} position={[0, branchHeight, 0]} rotation={[0.45, angle, 0]}>
            <mesh position={[0.12, 0, 0]} rotation={[0, 0, -0.35]}>
              <cylinderGeometry args={[0.012, 0.018, 0.2, 6]} />
              <meshStandardMaterial color="#558b2f" />
            </mesh>
            {/* Smooth oval pepper leaves */}
            <mesh position={[0.25, 0.02, 0]} scale={[2.5, 0.2, 1.2]}>
              <sphereGeometry args={[0.06 + progress * 0.03, 14, 10]} />
              <meshStandardMaterial color="#4caf50" roughness={0.4} />
            </mesh>
            <mesh position={[0.18, 0.03, 0.03]} scale={[2, 0.18, 1]}>
              <sphereGeometry args={[0.045 + progress * 0.02, 10, 8]} />
              <meshStandardMaterial color="#66bb6a" roughness={0.45} />
            </mesh>
          </group>
        );
      })}

      {/* Bell peppers - blocky realistic shape */}
      {week >= 9 && Array.from({ length: Math.min(4, week - 8) }).map((_, i) => {
        const colors = ['#d32f2f', '#f9a825', '#e65100', '#388e3c'];
        const size = 0.08 + ((week - 9) / 5) * 0.07;
        
        return (
          <group key={`pepper-${i}`} position={[
            Math.cos(i * 1.6) * 0.18,
            stemHeight * (0.35 + i * 0.11),
            Math.sin(i * 1.6) * 0.18
          ]} rotation={[0.15, i * 0.8, 0]}>
            {/* Bell pepper body - 4 lobes */}
            <mesh scale={[1, 1.4, 1]}>
              <boxGeometry args={[size * 1.1, size * 1.8, size * 1.1]} />
              <meshStandardMaterial color={colors[i % 4]} roughness={0.2} />
            </mesh>
            {/* Lobes detail */}
            {[0, 1, 2, 3].map((l) => (
              <mesh key={l} position={[
                Math.cos(l * Math.PI / 2) * size * 0.45,
                -size * 0.4,
                Math.sin(l * Math.PI / 2) * size * 0.45
              ]} scale={[0.9, 1.2, 0.9]}>
                <sphereGeometry args={[size * 0.4, 10, 10]} />
                <meshStandardMaterial color={colors[i % 4]} roughness={0.25} />
              </mesh>
            ))}
            {/* Stem */}
            <mesh position={[0, size * 1.1, 0]}>
              <cylinderGeometry args={[0.015, 0.02, 0.05, 6]} />
              <meshStandardMaterial color="#33691e" />
            </mesh>
          </group>
        );
      })}

      <Html position={[0, stemHeight + 0.5, 0]} center>
        <div className="bg-background/95 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border">
          Week {week}: {week < 3 ? '🌱 Seedling' : week < 6 ? '🌿 Vegetative' : week < 9 ? '🌼 Flowering' : '🫑 Fruiting'}
        </div>
      </Html>
    </group>
  );
};

// Realistic Carrot
const DetailedCarrot: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 12, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (child.type === 'Group') {
          child.rotation.x = Math.sin(state.clock.elapsedTime * 1.5 + i * 0.3) * 0.04;
        }
      });
    }
  });

  const foliageHeight = 0.2 + progress * 0.5;
  const rootLength = 0.1 + progress * 0.6;
  const frondCount = Math.floor(5 + progress * 10);

  return (
    <group ref={groupRef}>
      {/* Soil surface with slight mound */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.08, 18]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Carrot root (showing orange shoulder) */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.04 + progress * 0.03, 0.01, 0.08, 12]} />
        <meshStandardMaterial color="#e65100" roughness={0.5} />
      </mesh>

      {/* Underground carrot (transparent ground hint) */}
      <mesh position={[0, -rootLength / 2, 0]}>
        <coneGeometry args={[0.04 + progress * 0.025, rootLength, 14]} />
        <meshStandardMaterial color="#ff6d00" roughness={0.55} transparent opacity={0.85} />
      </mesh>

      {/* Feathery carrot tops */}
      {Array.from({ length: frondCount }).map((_, i) => {
        const angle = (i / frondCount) * Math.PI * 2;
        const lean = 0.25 + Math.random() * 0.3;
        const frondHeight = foliageHeight * (0.8 + Math.random() * 0.4);
        
        return (
          <group key={i} position={[0, 0.06, 0]} rotation={[lean, angle, 0]}>
            {/* Main frond stem */}
            <mesh position={[0, frondHeight / 2, 0]}>
              <cylinderGeometry args={[0.005, 0.008, frondHeight, 5]} />
              <meshStandardMaterial color="#388e3c" />
            </mesh>
            {/* Feathery pinnae */}
            {Array.from({ length: 8 }).map((_, p) => {
              const side = p % 2 === 0 ? 1 : -1;
              const pHeight = 0.05 + p * frondHeight * 0.1;
              return (
                <mesh key={p} position={[side * 0.02, pHeight, 0]} rotation={[0, 0, side * 0.8]} scale={[0.8, 0.15, 0.5]}>
                  <sphereGeometry args={[0.025 + progress * 0.012, 6, 4]} />
                  <meshStandardMaterial color={p < 4 ? '#66bb6a' : '#81c784'} roughness={0.55} />
                </mesh>
              );
            })}
          </group>
        );
      })}

      <Html position={[0, foliageHeight + 0.25, 0]} center>
        <div className="bg-background/95 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border">
          Week {week}: {week < 2 ? '🌱 Germination' : week < 5 ? '🌿 Seedling' : week < 9 ? '🥕 Root Growth' : '✅ Harvest Ready'}
        </div>
      </Html>
    </group>
  );
};

// Growth Stage Timeline
const GrowthTimeline: React.FC<{ week: number; maxWeeks: number; plantType: string }> = ({ week, maxWeeks, plantType }) => {
  const stages = {
    tomato: ['Seed', 'Sprout', 'Seedling', 'Leaves', 'Veg', 'Flower', 'Fruit Set', 'Green', 'Turning', 'Ripe', 'Harvest', 'Done'],
    strawberry: ['Plant', 'Root', 'Crown', 'Leaves', 'Spread', 'Runner', 'Bud', 'Flower', 'Set', 'Green', 'Pink', 'Red', 'Ripe', 'Harvest', 'Rest', 'Done'],
    pepper: ['Seed', 'Sprout', 'Seedling', 'True Leaf', 'Veg', 'Bush', 'Bud', 'Flower', 'Set', 'Grow', 'Size', 'Color', 'Ripe', 'Harvest'],
    carrot: ['Seed', 'Germ', 'Sprout', 'Tops', 'Roots', 'Growing', 'Sizing', 'Shoulder', 'Orange', 'Full', 'Harvest', 'Done'],
  };
  
  const currentStages = stages[plantType as keyof typeof stages] || stages.tomato;
  const stageIndex = Math.min(Math.floor((week / maxWeeks) * currentStages.length), currentStages.length - 1);
  
  return (
    <Html position={[0, -0.5, 0]} center>
      <div className="flex gap-1 bg-background/90 px-2 py-1 rounded-full">
        {currentStages.slice(0, Math.min(8, currentStages.length)).map((_, i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full ${i <= stageIndex ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
    </Html>
  );
};

// Scene component
const GrowthScene: React.FC<PlantGrowth3DProps> = ({ plantType, currentWeek, maxWeeks }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 8, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 5, -2]} intensity={0.35} color="#b3e5fc" />
      <hemisphereLight intensity={0.25} color="#87ceeb" groundColor="#4e342e" />

      {/* Ground with gradient */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#212121" roughness={0.98} />
      </mesh>

      {/* Plant based on type */}
      {plantType === 'tomato' && <DetailedTomato week={currentWeek} />}
      {plantType === 'strawberry' && <DetailedStrawberry week={currentWeek} />}
      {plantType === 'pepper' && <DetailedPepper week={currentWeek} />}
      {plantType === 'carrot' && <DetailedCarrot week={currentWeek} />}

      <GrowthTimeline week={currentWeek} maxWeeks={maxWeeks} plantType={plantType} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.2}
        maxDistance={4}
        maxPolarAngle={Math.PI / 2}
      />
      <PerspectiveCamera makeDefault position={[1.8, 1.2, 1.8]} fov={40} />
    </>
  );
};

const LoadingFallback = () => (
  <Html center>
    <div className="text-primary animate-pulse font-medium">Loading Plant...</div>
  </Html>
);

export const PlantGrowth3D: React.FC<PlantGrowth3DProps> = (props) => {
  return (
    <div style={{ height: '100%', minHeight: '380px', background: 'linear-gradient(180deg, #1b5e20 0%, #2e7d32 30%, #1a1a1a 100%)' }}>
      <Canvas shadows>
        <Suspense fallback={<LoadingFallback />}>
          <fog attach="fog" args={['#1b5e20', 4, 12]} />
          <GrowthScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};
