import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Camera, Info } from 'lucide-react';

interface PlantInfo {
  name: string;
  scientific: string;
  growthWeeks: number;
  harvestInfo: string;
  stages: { week: number; name: string; description: string; color: string }[];
}

const PLANT_DATA: Record<string, PlantInfo> = {
  tomato: {
    name: 'Tomato',
    scientific: 'Solanum lycopersicum',
    growthWeeks: 16,
    harvestInfo: 'Harvest when fruits are fully red',
    stages: [
      { week: 1, name: 'Germination', description: 'Seeds sprouting', color: '#8bc34a' },
      { week: 3, name: 'Seedling', description: 'First true leaves', color: '#66bb6a' },
      { week: 6, name: 'Vegetative', description: 'Rapid stem growth', color: '#4caf50' },
      { week: 8, name: 'Flowering', description: 'Yellow flowers appear', color: '#ffeb3b' },
      { week: 10, name: 'Fruit Set', description: 'Small green tomatoes', color: '#8bc34a' },
      { week: 14, name: 'Ripening', description: 'Fruits turning red', color: '#f44336' },
    ],
  },
  lettuce: {
    name: 'Lettuce',
    scientific: 'Lactuca sativa',
    growthWeeks: 8,
    harvestInfo: 'Harvest outer leaves or whole head',
    stages: [
      { week: 1, name: 'Germination', description: 'Seeds sprouting', color: '#c8e6c9' },
      { week: 2, name: 'Seedling', description: 'Cotyledons emerge', color: '#a5d6a7' },
      { week: 4, name: 'Rosette', description: 'Leaves form rosette', color: '#81c784' },
      { week: 6, name: 'Head Formation', description: 'Leaves cupping inward', color: '#66bb6a' },
      { week: 8, name: 'Harvest Ready', description: 'Full head formed', color: '#4caf50' },
    ],
  },
  cucumber: {
    name: 'Cucumber',
    scientific: 'Cucumis sativus',
    growthWeeks: 12,
    harvestInfo: 'Harvest when 6-8 inches long',
    stages: [
      { week: 1, name: 'Germination', description: 'Seeds sprouting', color: '#aed581' },
      { week: 2, name: 'Seedling', description: 'First leaves appear', color: '#8bc34a' },
      { week: 4, name: 'Vining', description: 'Tendrils and vines grow', color: '#7cb342' },
      { week: 6, name: 'Flowering', description: 'Yellow flowers bloom', color: '#ffeb3b' },
      { week: 8, name: 'Fruit Set', description: 'Small cucumbers form', color: '#689f38' },
      { week: 10, name: 'Harvest', description: 'Ready to pick', color: '#558b2f' },
    ],
  },
  pepper: {
    name: 'Bell Pepper',
    scientific: 'Capsicum annuum',
    growthWeeks: 14,
    harvestInfo: 'Harvest green or wait for color',
    stages: [
      { week: 1, name: 'Germination', description: 'Slow germination', color: '#a5d6a7' },
      { week: 3, name: 'Seedling', description: 'True leaves develop', color: '#81c784' },
      { week: 6, name: 'Vegetative', description: 'Bushy growth', color: '#66bb6a' },
      { week: 8, name: 'Flowering', description: 'White flowers', color: '#ffffff' },
      { week: 10, name: 'Fruit Set', description: 'Green peppers form', color: '#4caf50' },
      { week: 14, name: 'Maturity', description: 'Colors develop', color: '#f44336' },
    ],
  },
  strawberry: {
    name: 'Strawberry',
    scientific: 'Fragaria × ananassa',
    growthWeeks: 16,
    harvestInfo: 'Harvest when fully red',
    stages: [
      { week: 1, name: 'Planting', description: 'Crown establishment', color: '#8d6e63' },
      { week: 4, name: 'Leaf Growth', description: 'Trifoliate leaves', color: '#4caf50' },
      { week: 8, name: 'Runner', description: 'Stolons appear', color: '#81c784' },
      { week: 10, name: 'Flowering', description: 'White flowers', color: '#ffffff' },
      { week: 12, name: 'Fruit Set', description: 'Green berries', color: '#aed581' },
      { week: 14, name: 'Ripening', description: 'Red berries', color: '#e53935' },
    ],
  },
  eggplant: {
    name: 'Eggplant',
    scientific: 'Solanum melongena',
    growthWeeks: 14,
    harvestInfo: 'Harvest when skin is glossy',
    stages: [
      { week: 1, name: 'Germination', description: 'Slow to start', color: '#a5d6a7' },
      { week: 3, name: 'Seedling', description: 'Fuzzy leaves', color: '#81c784' },
      { week: 6, name: 'Vegetative', description: 'Large leaves grow', color: '#66bb6a' },
      { week: 8, name: 'Flowering', description: 'Purple flowers', color: '#9c27b0' },
      { week: 10, name: 'Fruit Set', description: 'Small eggplants', color: '#7b1fa2' },
      { week: 14, name: 'Harvest', description: 'Full size fruits', color: '#4a148c' },
    ],
  },
  carrot: {
    name: 'Carrot',
    scientific: 'Daucus carota',
    growthWeeks: 12,
    harvestInfo: 'Harvest when tops are 3/4 inch diameter',
    stages: [
      { week: 1, name: 'Germination', description: 'Slow germination', color: '#c8e6c9' },
      { week: 2, name: 'Seedling', description: 'Feathery cotyledons', color: '#a5d6a7' },
      { week: 4, name: 'Leaf Development', description: 'Ferny foliage grows', color: '#81c784' },
      { week: 6, name: 'Root Swelling', description: 'Tap root thickens', color: '#ff9800' },
      { week: 9, name: 'Root Growth', description: 'Carrot develops', color: '#f57c00' },
      { week: 12, name: 'Harvest Ready', description: 'Full size root', color: '#e65100' },
    ],
  },
};

// 3D Lettuce Component
const Lettuce3D: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 8, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  const leafCount = Math.floor(4 + progress * 16);
  const headSize = 0.1 + progress * 0.4;

  return (
    <group ref={groupRef}>
      {/* Soil */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.1, 20]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Lettuce leaves in rosette pattern */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const layer = Math.floor(i / 5);
        const angle = (i % 5) / 5 * Math.PI * 2 + layer * 0.5;
        const layerProgress = Math.max(0, progress - layer * 0.15);
        const size = 0.08 + layerProgress * 0.15 - layer * 0.02;
        const height = 0.1 + layer * 0.04;
        const curl = week >= 6 ? 0.3 + layer * 0.1 : 0;
        
        const leafColor = layer > 2 ? '#c8e6c9' : layer > 1 ? '#a5d6a7' : '#81c784';
        
        return (
          <group key={i} position={[0, height, 0]} rotation={[-curl, angle, 0]}>
            <mesh position={[size * 0.3, 0, 0]} rotation={[0, 0, -0.2]}>
              <cylinderGeometry args={[0.008, 0.012, size * 0.6, 6]} />
              <meshStandardMaterial color="#c8e6c9" />
            </mesh>
            <group position={[size * 0.7, 0.02, 0]}>
              <mesh scale={[2.5, 0.15, 1.8]}>
                <dodecahedronGeometry args={[size * 0.6]} />
                <meshStandardMaterial 
                  color={leafColor} 
                  roughness={0.4} 
                  flatShading
                  side={THREE.DoubleSide}
                />
              </mesh>
              {[0, 1, 2, 3].map((r) => (
                <mesh 
                  key={r} 
                  position={[size * 0.3, 0, (r - 1.5) * 0.04]}
                  scale={[1.5, 0.1, 0.8]}
                >
                  <icosahedronGeometry args={[size * 0.25]} />
                  <meshStandardMaterial color="#e8f5e9" roughness={0.35} flatShading />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}

      {week >= 5 && (
        <mesh position={[0, 0.15 + progress * 0.1, 0]}>
          <sphereGeometry args={[headSize * 0.4, 12, 12]} />
          <meshStandardMaterial color="#e8f5e9" roughness={0.3} />
        </mesh>
      )}

      <Html position={[0, 0.6, 0]} center>
        <div className="bg-background/95 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border whitespace-nowrap">
          Week {week}: {week < 2 ? '🌱 Germination' : week < 4 ? '🌿 Seedling' : week < 6 ? '🥬 Rosette' : '✅ Harvest Ready'}
        </div>
      </Html>
    </group>
  );
};

// 3D Cucumber Component
const Cucumber3D: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 12, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      const children = groupRef.current.children;
      children.forEach((child, i) => {
        if (child.name === 'vine') {
          child.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.03;
        }
      });
    }
  });

  const vineLength = progress * 1.5;
  const hasFruits = week >= 8;

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      <mesh name="vine" position={[vineLength / 2, 0.15, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.015, 0.025, vineLength + 0.5, 8]} />
        <meshStandardMaterial color="#558b2f" roughness={0.7} />
      </mesh>

      {Array.from({ length: Math.floor(3 + progress * 8) }).map((_, i) => {
        const leafPos = (i / 10) * vineLength;
        const side = i % 2 === 0 ? 1 : -1;
        const leafSize = 0.12 + Math.random() * 0.05;
        
        return (
          <group key={i} position={[leafPos + 0.2, 0.15, side * 0.15]} rotation={[side * 0.3, side * 0.5, 0]}>
            <mesh position={[0, 0.08, 0]} rotation={[0, 0, side * 0.3]}>
              <cylinderGeometry args={[0.008, 0.012, 0.15, 6]} />
              <meshStandardMaterial color="#7cb342" />
            </mesh>
            <group position={[0, 0.18, 0]}>
              {[0, 1, 2, 3, 4].map((lobe) => (
                <mesh 
                  key={lobe} 
                  position={[
                    Math.cos(lobe * 1.26 - 0.6) * leafSize * 0.4,
                    0,
                    Math.sin(lobe * 1.26 - 0.6) * leafSize * 0.4
                  ]}
                  rotation={[0.2, lobe * 1.26, 0]}
                  scale={[1.8, 0.15, 1.2]}
                >
                  <dodecahedronGeometry args={[leafSize * 0.5]} />
                  <meshStandardMaterial color="#66bb6a" roughness={0.45} flatShading />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}

      {week >= 4 && Array.from({ length: Math.floor(progress * 6) }).map((_, i) => {
        const tendrilPos = 0.3 + (i / 6) * vineLength;
        return (
          <mesh 
            key={`tendril-${i}`}
            position={[tendrilPos, 0.2, i % 2 === 0 ? 0.1 : -0.1]}
            rotation={[Math.PI / 4, i % 2 === 0 ? 0.5 : -0.5, Math.PI / 2]}
          >
            <torusGeometry args={[0.05, 0.004, 6, 12, Math.PI * 1.5]} />
            <meshStandardMaterial color="#9ccc65" />
          </mesh>
        );
      })}

      {week >= 6 && week < 10 && Array.from({ length: 4 }).map((_, i) => (
        <group 
          key={`flower-${i}`}
          position={[0.3 + i * 0.2, 0.22, i % 2 === 0 ? 0.12 : -0.12]}
        >
          {[0, 1, 2, 3, 4].map((p) => (
            <mesh key={p} position={[Math.cos(p * 1.26) * 0.02, 0, Math.sin(p * 1.26) * 0.02]} rotation={[0.5, p * 1.26, 0]}>
              <coneGeometry args={[0.018, 0.035, 5]} />
              <meshStandardMaterial color="#ffeb3b" />
            </mesh>
          ))}
        </group>
      ))}

      {hasFruits && Array.from({ length: Math.min(4, week - 7) }).map((_, i) => {
        const maturity = Math.min(1, (week - 8 - i * 0.5) / 3);
        const length = 0.08 + maturity * 0.15;
        const width = 0.02 + maturity * 0.025;
        
        return (
          <group 
            key={`cucumber-${i}`}
            position={[0.35 + i * 0.25, 0.1, i % 2 === 0 ? 0.15 : -0.15]}
            rotation={[0.2, i * 0.5, 0.1]}
          >
            <mesh>
              <capsuleGeometry args={[width, length, 8, 16]} />
              <meshStandardMaterial 
                color={maturity > 0.5 ? '#2e7d32' : '#558b2f'} 
                roughness={0.3}
              />
            </mesh>
            {Array.from({ length: 8 }).map((_, b) => (
              <mesh 
                key={b}
                position={[
                  Math.cos(b * 0.8) * width * 0.9,
                  -length / 2 + (b / 8) * length,
                  Math.sin(b * 0.8) * width * 0.9
                ]}
              >
                <sphereGeometry args={[0.006, 4, 4]} />
                <meshStandardMaterial color="#1b5e20" />
              </mesh>
            ))}
            <mesh position={[0, -length / 2 - 0.02, 0]}>
              <coneGeometry args={[0.008, 0.015, 5]} />
              <meshStandardMaterial color="#fdd835" />
            </mesh>
          </group>
        );
      })}

      <Html position={[0, 0.7, 0]} center>
        <div className="bg-background/95 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border whitespace-nowrap">
          Week {week}: {week < 2 ? '🌱 Germination' : week < 4 ? '🌿 Seedling' : week < 6 ? '🌿 Vining' : week < 8 ? '🌼 Flowering' : '🥒 Fruiting'}
        </div>
      </Html>
    </group>
  );
};

// 3D Eggplant Component
const Eggplant3D: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 14, 1);
  
  const stemHeight = 0.3 + progress * 1.2;
  const branchCount = Math.floor(3 + progress * 5);

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      <mesh position={[0, stemHeight / 2 + 0.1, 0]}>
        <cylinderGeometry args={[0.025, 0.04, stemHeight, 10]} />
        <meshStandardMaterial color="#5d4037" roughness={0.8} />
      </mesh>

      {Array.from({ length: branchCount }).map((_, i) => {
        const angle = (i / branchCount) * Math.PI * 2;
        const height = 0.15 + (i / branchCount) * stemHeight * 0.7;
        const leafSize = 0.15 + progress * 0.1 - i * 0.01;
        
        return (
          <group key={i} position={[0, height, 0]} rotation={[0.4, angle, 0]}>
            <mesh position={[0.1, 0, 0]} rotation={[0, 0, -0.25]}>
              <cylinderGeometry args={[0.01, 0.015, 0.18, 6]} />
              <meshStandardMaterial color="#7b5e57" />
            </mesh>
            <group position={[0.25, 0.02, 0]}>
              <mesh scale={[2.5, 0.2, 1.6]}>
                <dodecahedronGeometry args={[leafSize]} />
                <meshStandardMaterial color="#558b2f" roughness={0.7} flatShading />
              </mesh>
              {[0, 1, 2].map((f) => (
                <mesh key={f} position={[f * 0.06 - 0.06, 0.02, 0]} scale={[1.8, 0.15, 1.2]}>
                  <icosahedronGeometry args={[leafSize * 0.4]} />
                  <meshStandardMaterial color="#689f38" roughness={0.8} flatShading transparent opacity={0.6} />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}

      {week >= 8 && week < 12 && Array.from({ length: 3 }).map((_, i) => (
        <group 
          key={`flower-${i}`}
          position={[
            Math.cos(i * 2.1) * 0.15,
            stemHeight * (0.5 + i * 0.12),
            Math.sin(i * 2.1) * 0.15
          ]}
        >
          {[0, 1, 2, 3, 4].map((p) => (
            <mesh key={p} position={[Math.cos(p * 1.26) * 0.025, 0, Math.sin(p * 1.26) * 0.025]} rotation={[0.4, p * 1.26, 0]}>
              <coneGeometry args={[0.015, 0.04, 4]} />
              <meshStandardMaterial color="#9c27b0" />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#ffeb3b" />
          </mesh>
        </group>
      ))}

      {week >= 10 && Array.from({ length: Math.min(3, week - 9) }).map((_, i) => {
        const maturity = Math.min(1, (week - 10 - i * 0.7) / 4);
        const size = 0.06 + maturity * 0.08;
        
        return (
          <group 
            key={`eggplant-${i}`}
            position={[
              Math.cos(i * 2.2) * 0.18,
              stemHeight * (0.35 + i * 0.1),
              Math.sin(i * 2.2) * 0.18
            ]}
            rotation={[0.3, i * 0.8, 0]}
          >
            <mesh scale={[1, 1.8, 1]}>
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial 
                color={maturity > 0.5 ? '#4a148c' : '#7b1fa2'}
                roughness={0.15}
                metalness={0.1}
              />
            </mesh>
            <mesh position={[0, size * 1.5, 0]}>
              <coneGeometry args={[size * 0.4, 0.03, 5]} />
              <meshStandardMaterial color="#33691e" />
            </mesh>
            {[0, 1, 2, 3, 4].map((c) => (
              <mesh 
                key={c}
                position={[
                  Math.cos(c * 1.26) * size * 0.35,
                  size * 1.4,
                  Math.sin(c * 1.26) * size * 0.35
                ]}
                rotation={[-0.4, c * 1.26, 0.3]}
              >
                <coneGeometry args={[0.015, 0.05, 3]} />
                <meshStandardMaterial color="#2e7d32" />
              </mesh>
            ))}
          </group>
        );
      })}

      <Html position={[0, stemHeight + 0.5, 0]} center>
        <div className="bg-background/95 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border whitespace-nowrap">
          Week {week}: {week < 3 ? '🌱 Germination' : week < 6 ? '🌿 Seedling' : week < 8 ? '🌿 Vegetative' : week < 10 ? '🌸 Flowering' : '🍆 Fruiting'}
        </div>
      </Html>
    </group>
  );
};

// 3D Strawberry Component
const Strawberry3D: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 16, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
  });

  const leafCount = Math.floor(3 + progress * 9);
  const hasRunners = week >= 8;
  const hasFlowers = week >= 10 && week < 14;
  const hasFruits = week >= 12;

  return (
    <group ref={groupRef}>
      {/* Soil mound */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.12, 20]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Crown base */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.08, 12]} />
        <meshStandardMaterial color="#5d4037" roughness={0.8} />
      </mesh>

      {/* Trifoliate leaves */}
      {Array.from({ length: leafCount }).map((_, i) => {
        const angle = (i / leafCount) * Math.PI * 2;
        const size = 0.1 + progress * 0.06;
        const height = 0.15 + i * 0.02;
        
        return (
          <group key={i} position={[0, height, 0]} rotation={[0.5, angle, 0]}>
            {/* Petiole (long stem) */}
            <mesh position={[0.12, 0.08, 0]} rotation={[0, 0, -0.4]}>
              <cylinderGeometry args={[0.008, 0.012, 0.25, 6]} />
              <meshStandardMaterial color="#4caf50" />
            </mesh>
            
            {/* Three leaflets */}
            {[0, 1, 2].map((leaflet) => {
              const leafletAngle = (leaflet - 1) * 0.5;
              return (
                <group 
                  key={leaflet} 
                  position={[0.28, 0.12, leafletAngle * 0.08]}
                  rotation={[0, leafletAngle, 0]}
                >
                  <mesh scale={[1.5, 0.12, 1]}>
                    <dodecahedronGeometry args={[size * 0.5]} />
                    <meshStandardMaterial 
                      color="#388e3c" 
                      roughness={0.5} 
                      flatShading
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                  {/* Serrated edges */}
                  {[0, 1, 2, 3, 4].map((s) => (
                    <mesh 
                      key={s}
                      position={[size * 0.3, 0, (s - 2) * 0.025]}
                      scale={[0.8, 0.08, 0.5]}
                    >
                      <tetrahedronGeometry args={[size * 0.15]} />
                      <meshStandardMaterial color="#2e7d32" flatShading />
                    </mesh>
                  ))}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Runners (stolons) */}
      {hasRunners && Array.from({ length: Math.min(3, Math.floor((week - 7) / 2)) }).map((_, i) => {
        const runnerAngle = (i * 2.1) + 0.5;
        const runnerLength = 0.3 + i * 0.15;
        
        return (
          <group key={`runner-${i}`}>
            {/* Runner stem */}
            <mesh 
              position={[
                Math.cos(runnerAngle) * runnerLength / 2,
                0.1,
                Math.sin(runnerAngle) * runnerLength / 2
              ]}
              rotation={[0, runnerAngle + Math.PI / 2, 0.1]}
            >
              <cylinderGeometry args={[0.006, 0.008, runnerLength, 6]} />
              <meshStandardMaterial color="#7cb342" />
            </mesh>
            {/* Baby plant at end */}
            <group position={[
              Math.cos(runnerAngle) * runnerLength,
              0.1,
              Math.sin(runnerAngle) * runnerLength
            ]}>
              {[0, 1, 2].map((leaf) => (
                <mesh 
                  key={leaf}
                  position={[Math.cos(leaf * 2.1) * 0.03, 0.02, Math.sin(leaf * 2.1) * 0.03]}
                  rotation={[0.3, leaf * 2.1, 0]}
                  scale={[1.2, 0.1, 0.8]}
                >
                  <dodecahedronGeometry args={[0.025]} />
                  <meshStandardMaterial color="#66bb6a" flatShading />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}

      {/* White flowers */}
      {hasFlowers && Array.from({ length: Math.min(5, week - 9) }).map((_, i) => (
        <group 
          key={`flower-${i}`}
          position={[
            Math.cos(i * 1.4) * 0.15,
            0.25 + i * 0.03,
            Math.sin(i * 1.4) * 0.15
          ]}
        >
          {/* Petals */}
          {[0, 1, 2, 3, 4].map((p) => (
            <mesh 
              key={p} 
              position={[Math.cos(p * 1.26) * 0.025, 0, Math.sin(p * 1.26) * 0.025]} 
              rotation={[0.3, p * 1.26, 0]}
            >
              <coneGeometry args={[0.018, 0.03, 6]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
          {/* Yellow center */}
          <mesh>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshStandardMaterial color="#ffc107" />
          </mesh>
        </group>
      ))}

      {/* Strawberry fruits */}
      {hasFruits && Array.from({ length: Math.min(6, week - 11) }).map((_, i) => {
        const maturity = Math.min(1, (week - 12 - i * 0.5) / 3);
        const size = 0.025 + maturity * 0.035;
        const fruitColor = maturity < 0.3 ? '#aed581' : maturity < 0.6 ? '#ef5350' : '#c62828';
        
        return (
          <group 
            key={`fruit-${i}`}
            position={[
              Math.cos(i * 1.1) * 0.2,
              0.08,
              Math.sin(i * 1.1) * 0.2
            ]}
            rotation={[0.2, i * 0.5, 0]}
          >
            {/* Strawberry body - cone shape */}
            <mesh scale={[1, 1.4, 1]}>
              <coneGeometry args={[size, size * 2.5, 8]} />
              <meshStandardMaterial 
                color={fruitColor}
                roughness={0.4}
              />
            </mesh>
            {/* Seeds */}
            {maturity > 0.3 && Array.from({ length: 12 }).map((_, s) => {
              const seedAngle = (s / 12) * Math.PI * 2;
              const seedHeight = (s % 3) * size * 0.5 - size * 0.3;
              return (
                <mesh 
                  key={s}
                  position={[
                    Math.cos(seedAngle) * size * 0.85,
                    seedHeight,
                    Math.sin(seedAngle) * size * 0.85
                  ]}
                >
                  <sphereGeometry args={[0.004, 4, 4]} />
                  <meshStandardMaterial color="#ffeb3b" />
                </mesh>
              );
            })}
            {/* Calyx (green top) */}
            <group position={[0, size * 1.2, 0]}>
              {[0, 1, 2, 3, 4].map((c) => (
                <mesh 
                  key={c}
                  position={[Math.cos(c * 1.26) * size * 0.4, 0, Math.sin(c * 1.26) * size * 0.4]}
                  rotation={[-0.6, c * 1.26, 0]}
                >
                  <coneGeometry args={[0.012, 0.025, 3]} />
                  <meshStandardMaterial color="#2e7d32" />
                </mesh>
              ))}
            </group>
          </group>
        );
      })}

      <Html position={[0, 0.65, 0]} center>
        <div className="bg-background/95 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border whitespace-nowrap">
          Week {week}: {week < 4 ? '🌱 Establishing' : week < 8 ? '🌿 Leaf Growth' : week < 10 ? '🌿 Runners' : week < 12 ? '🌸 Flowering' : '🍓 Fruiting'}
        </div>
      </Html>
    </group>
  );
};

// 3D Pepper Component
const Pepper3D: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 14, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.015;
    }
  });

  const stemHeight = 0.25 + progress * 0.9;
  const branchCount = Math.floor(2 + progress * 6);
  const hasFlowers = week >= 8 && week < 12;
  const hasFruits = week >= 10;

  return (
    <group ref={groupRef}>
      {/* Soil */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.12, 20]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Main stem */}
      <mesh position={[0, stemHeight / 2 + 0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.035, stemHeight, 10]} />
        <meshStandardMaterial color="#33691e" roughness={0.7} />
      </mesh>

      {/* Branches and leaves */}
      {Array.from({ length: branchCount }).map((_, i) => {
        const angle = (i / branchCount) * Math.PI * 2 + 0.3;
        const height = 0.2 + (i / branchCount) * stemHeight * 0.6;
        const branchLength = 0.1 + (1 - i / branchCount) * 0.15;
        const leafSize = 0.08 + progress * 0.04;
        
        return (
          <group key={i} position={[0, height, 0]} rotation={[0.3, angle, 0]}>
            {/* Branch */}
            <mesh position={[branchLength / 2, 0, 0]} rotation={[0, 0, -0.3]}>
              <cylinderGeometry args={[0.008, 0.012, branchLength, 6]} />
              <meshStandardMaterial color="#558b2f" />
            </mesh>
            
            {/* Oval leaves */}
            <group position={[branchLength + 0.02, 0.02, 0]}>
              <mesh scale={[2.2, 0.12, 1.3]} rotation={[0, 0.2, 0]}>
                <dodecahedronGeometry args={[leafSize]} />
                <meshStandardMaterial 
                  color="#4caf50" 
                  roughness={0.5} 
                  flatShading
                  side={THREE.DoubleSide}
                />
              </mesh>
              {/* Leaf vein */}
              <mesh position={[0, 0.005, 0]} scale={[1.5, 0.03, 0.1]}>
                <boxGeometry args={[leafSize * 1.5, 0.01, 0.01]} />
                <meshStandardMaterial color="#81c784" />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* White flowers */}
      {hasFlowers && Array.from({ length: Math.min(6, week - 7) }).map((_, i) => (
        <group 
          key={`flower-${i}`}
          position={[
            Math.cos(i * 1.2) * 0.12,
            stemHeight * (0.5 + i * 0.06),
            Math.sin(i * 1.2) * 0.12
          ]}
        >
          {[0, 1, 2, 3, 4, 5].map((p) => (
            <mesh 
              key={p} 
              position={[Math.cos(p * 1.05) * 0.015, 0, Math.sin(p * 1.05) * 0.015]} 
              rotation={[0.4, p * 1.05, 0]}
            >
              <coneGeometry args={[0.012, 0.02, 5]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.008, 6, 6]} />
            <meshStandardMaterial color="#ffeb3b" />
          </mesh>
        </group>
      ))}

      {/* Bell peppers */}
      {hasFruits && Array.from({ length: Math.min(4, week - 9) }).map((_, i) => {
        const maturity = Math.min(1, (week - 10 - i * 0.7) / 4);
        const size = 0.04 + maturity * 0.05;
        // Color progression: green -> yellow -> red
        const fruitColor = maturity < 0.3 ? '#388e3c' : maturity < 0.6 ? '#fbc02d' : maturity < 0.8 ? '#ff9800' : '#e53935';
        
        return (
          <group 
            key={`pepper-${i}`}
            position={[
              Math.cos(i * 1.8 + 0.5) * 0.15,
              stemHeight * (0.4 + i * 0.08),
              Math.sin(i * 1.8 + 0.5) * 0.15
            ]}
            rotation={[0.15, i * 0.6, 0]}
          >
            {/* Bell pepper body - blocky shape */}
            <mesh scale={[1, 1.2, 1]}>
              <sphereGeometry args={[size, 8, 8]} />
              <meshStandardMaterial 
                color={fruitColor}
                roughness={0.25}
                metalness={0.05}
              />
            </mesh>
            {/* Lobes at bottom */}
            {[0, 1, 2, 3].map((lobe) => (
              <mesh 
                key={lobe}
                position={[
                  Math.cos(lobe * 1.57) * size * 0.4,
                  -size * 0.8,
                  Math.sin(lobe * 1.57) * size * 0.4
                ]}
              >
                <sphereGeometry args={[size * 0.35, 6, 6]} />
                <meshStandardMaterial color={fruitColor} roughness={0.25} />
              </mesh>
            ))}
            {/* Stem */}
            <mesh position={[0, size * 1.1, 0]}>
              <cylinderGeometry args={[0.008, 0.012, 0.04, 6]} />
              <meshStandardMaterial color="#33691e" />
            </mesh>
            {/* Calyx */}
            <mesh position={[0, size * 0.95, 0]}>
              <cylinderGeometry args={[size * 0.35, size * 0.25, 0.02, 6]} />
              <meshStandardMaterial color="#2e7d32" />
            </mesh>
          </group>
        );
      })}

      <Html position={[0, stemHeight + 0.4, 0]} center>
        <div className="bg-background/95 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border whitespace-nowrap">
          Week {week}: {week < 3 ? '🌱 Germination' : week < 6 ? '🌿 Seedling' : week < 8 ? '🌿 Vegetative' : week < 10 ? '🌸 Flowering' : '🫑 Fruiting'}
        </div>
      </Html>
    </group>
  );
};

// 3D Carrot Component
const Carrot3D: React.FC<{ week: number }> = ({ week }) => {
  const groupRef = useRef<THREE.Group>(null);
  const progress = Math.min(week / 12, 1);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle sway in the breeze
      groupRef.current.children.forEach((child, i) => {
        if (child.name === 'foliage') {
          child.rotation.x = Math.sin(state.clock.elapsedTime * 1.5 + i * 0.5) * 0.03;
        }
      });
    }
  });

  const foliageHeight = 0.1 + progress * 0.4;
  const foliageCount = Math.floor(3 + progress * 12);
  const carrotVisible = week >= 6;
  const carrotSize = carrotVisible ? Math.min(1, (week - 5) / 7) : 0;

  return (
    <group ref={groupRef}>
      {/* Soil with raised bed look */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.16, 20]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Soil mound around carrot top */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4e342e" roughness={0.9} />
      </mesh>

      {/* Feathery foliage (fern-like leaves) */}
      {Array.from({ length: foliageCount }).map((_, i) => {
        const angle = (i / foliageCount) * Math.PI * 2;
        const tilt = 0.3 + Math.random() * 0.3;
        const height = foliageHeight * (0.7 + Math.random() * 0.3);
        
        return (
          <group 
            key={i} 
            name="foliage"
            position={[0, 0.12, 0]} 
            rotation={[tilt, angle, 0]}
          >
            {/* Main stem */}
            <mesh position={[0, height / 2, 0]}>
              <cylinderGeometry args={[0.004, 0.008, height, 6]} />
              <meshStandardMaterial color="#66bb6a" />
            </mesh>
            
            {/* Feathery fronds along stem */}
            {Array.from({ length: Math.floor(4 + progress * 6) }).map((_, f) => {
              const frondHeight = (f / 10) * height;
              const frondSize = 0.02 + (1 - f / 10) * 0.03;
              const side = f % 2 === 0 ? 1 : -1;
              
              return (
                <group 
                  key={f}
                  position={[side * 0.01, frondHeight, 0]}
                  rotation={[0, 0, side * 0.6]}
                >
                  {/* Frond segment */}
                  <mesh position={[side * frondSize / 2, 0, 0]} scale={[3, 0.15, 1]}>
                    <dodecahedronGeometry args={[frondSize * 0.4]} />
                    <meshStandardMaterial 
                      color="#81c784" 
                      roughness={0.5} 
                      flatShading 
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Carrot root (partially visible above soil) */}
      {carrotVisible && (
        <group position={[0, 0.1, 0]}>
          {/* Carrot crown (visible part) */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.03 + carrotSize * 0.02, 0.025 + carrotSize * 0.015, 0.04, 12]} />
            <meshStandardMaterial color="#e65100" roughness={0.6} />
          </mesh>
          
          {/* Root shoulder rings */}
          {Array.from({ length: 3 }).map((_, r) => (
            <mesh 
              key={r} 
              position={[0, 0.015 - r * 0.008, 0]}
            >
              <torusGeometry args={[0.028 + carrotSize * 0.018 - r * 0.003, 0.003, 6, 16]} />
              <meshStandardMaterial color="#bf360c" />
            </mesh>
          ))}
        </group>
      )}

      {/* Underground carrot (shown as semi-transparent for visualization) */}
      {carrotVisible && (
        <group position={[0, -0.05, 0]}>
          {/* Main carrot body */}
          <mesh position={[0, -carrotSize * 0.12, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.035 + carrotSize * 0.025, 0.15 + carrotSize * 0.2, 12]} />
            <meshStandardMaterial 
              color="#ff6d00" 
              roughness={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
          
          {/* Carrot tip */}
          <mesh position={[0, -0.2 - carrotSize * 0.15, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.01 + carrotSize * 0.005, 0.04 + carrotSize * 0.03, 8]} />
            <meshStandardMaterial 
              color="#e65100" 
              roughness={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Root hairs */}
          {Array.from({ length: 8 }).map((_, h) => {
            const hairAngle = (h / 8) * Math.PI * 2;
            const hairY = -0.08 - (h % 3) * 0.05;
            return (
              <mesh 
                key={h}
                position={[
                  Math.cos(hairAngle) * (0.03 + carrotSize * 0.02),
                  hairY,
                  Math.sin(hairAngle) * (0.03 + carrotSize * 0.02)
                ]}
                rotation={[0.5, hairAngle, 0.3]}
              >
                <cylinderGeometry args={[0.002, 0.001, 0.03 + Math.random() * 0.02, 4]} />
                <meshStandardMaterial color="#ffab40" transparent opacity={0.6} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Ground cross-section indicator */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.35, 32]} />
        <meshStandardMaterial color="#5d4037" transparent opacity={0.3} />
      </mesh>

      <Html position={[0, foliageHeight + 0.3, 0]} center>
        <div className="bg-background/95 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border border-border whitespace-nowrap">
          Week {week}: {week < 2 ? '🌱 Germination' : week < 4 ? '🌿 Seedling' : week < 6 ? '🌿 Foliage' : week < 9 ? '🥕 Root Growing' : '✅ Harvest Ready'}
        </div>
      </Html>
    </group>
  );
};

// Plant Selection Scene
const PlantScene: React.FC<{ plantType: string; week: number }> = ({ plantType, week }) => {
  const PlantComponent = useMemo(() => {
    switch (plantType) {
      case 'lettuce': return <Lettuce3D week={week} />;
      case 'cucumber': return <Cucumber3D week={week} />;
      case 'eggplant': return <Eggplant3D week={week} />;
      case 'strawberry': return <Strawberry3D week={week} />;
      case 'pepper': return <Pepper3D week={week} />;
      case 'carrot': return <Carrot3D week={week} />;
      default: return <Lettuce3D week={week} />;
    }
  }, [plantType, week]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[1.5, 1.2, 1.5]} fov={45} />
      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={4}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.1}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 3]} intensity={1.2} castShadow />
      <pointLight position={[-3, 3, -3]} intensity={0.4} color="#ffe082" />
      
      {PlantComponent}
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial color="#2d1f1a" roughness={1} />
      </mesh>
    </>
  );
};

export const EnhancedPlantGrowth3D: React.FC = () => {
  const [selectedPlant, setSelectedPlant] = useState('lettuce');
  const [week, setWeek] = useState(4);
  const [isSimulating, setIsSimulating] = useState(false);

  const plantInfo = PLANT_DATA[selectedPlant];

  // Simulation effect
  React.useEffect(() => {
    if (!isSimulating) return;
    
    const interval = setInterval(() => {
      setWeek(prev => {
        if (prev >= plantInfo.growthWeeks) {
          setIsSimulating(false);
          return 1;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, plantInfo.growthWeeks]);

  const currentStage = plantInfo.stages.filter(s => s.week <= week).pop();

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Enhanced 3D Plant Growth Visualization
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Interactive weekly growth progression for 7 vegetables
            </p>
          </div>
          <Select value={selectedPlant} onValueChange={setSelectedPlant}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PLANT_DATA).map(([key, data]) => (
                <SelectItem key={key} value={key}>
                  {data.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plant Info */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg">
          <Badge variant="outline">{plantInfo.scientific}</Badge>
          <Badge variant="secondary">{plantInfo.growthWeeks} weeks to harvest</Badge>
          {currentStage && (
            <Badge style={{ backgroundColor: currentStage.color, color: '#fff' }}>
              {currentStage.name}
            </Badge>
          )}
        </div>

        {/* 3D View */}
        <div className="h-[400px] rounded-xl overflow-hidden bg-gradient-to-b from-sky-100 to-amber-50 dark:from-slate-900 dark:to-slate-800">
          <Canvas shadows>
            <React.Suspense fallback={null}>
              <PlantScene plantType={selectedPlant} week={week} />
            </React.Suspense>
          </Canvas>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium w-20">Week {week}</span>
            <Slider
              value={[week]}
              onValueChange={(v) => setWeek(v[0])}
              min={1}
              max={plantInfo.growthWeeks}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-20 text-right">
              / {plantInfo.growthWeeks}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isSimulating ? "destructive" : "default"}
              onClick={() => setIsSimulating(!isSimulating)}
            >
              {isSimulating ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isSimulating ? 'Pause' : 'Simulate Growth'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setWeek(1)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stage Timeline */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Growth Stages</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {plantInfo.stages.map((stage, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
                  week >= stage.week ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: stage.color }}
                />
                <span className="font-medium">W{stage.week}</span>
                <span className="text-muted-foreground hidden sm:inline">
                  {stage.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Drag to rotate • Scroll to zoom • Select different plants above
        </p>
      </CardContent>
    </Card>
  );
};