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
        
        // Inner leaves curl inward more
        const leafColor = layer > 2 ? '#c8e6c9' : layer > 1 ? '#a5d6a7' : '#81c784';
        
        return (
          <group key={i} position={[0, height, 0]} rotation={[-curl, angle, 0]}>
            {/* Leaf stem */}
            <mesh position={[size * 0.3, 0, 0]} rotation={[0, 0, -0.2]}>
              <cylinderGeometry args={[0.008, 0.012, size * 0.6, 6]} />
              <meshStandardMaterial color="#c8e6c9" />
            </mesh>
            {/* Ruffled leaf blade */}
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
              {/* Ruffled edges */}
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

      {/* Center heart (forms later) */}
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
      {/* Soil mound */}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Main vine */}
      <mesh name="vine" position={[vineLength / 2, 0.15, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.015, 0.025, vineLength + 0.5, 8]} />
        <meshStandardMaterial color="#558b2f" roughness={0.7} />
      </mesh>

      {/* Large palmate leaves */}
      {Array.from({ length: Math.floor(3 + progress * 8) }).map((_, i) => {
        const leafPos = (i / 10) * vineLength;
        const side = i % 2 === 0 ? 1 : -1;
        const leafSize = 0.12 + Math.random() * 0.05;
        
        return (
          <group key={i} position={[leafPos + 0.2, 0.15, side * 0.15]} rotation={[side * 0.3, side * 0.5, 0]}>
            {/* Petiole */}
            <mesh position={[0, 0.08, 0]} rotation={[0, 0, side * 0.3]}>
              <cylinderGeometry args={[0.008, 0.012, 0.15, 6]} />
              <meshStandardMaterial color="#7cb342" />
            </mesh>
            {/* 5-lobed cucumber leaf */}
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

      {/* Tendrils */}
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

      {/* Yellow flowers */}
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

      {/* Cucumbers */}
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
            {/* Cucumber body */}
            <mesh>
              <capsuleGeometry args={[width, length, 8, 16]} />
              <meshStandardMaterial 
                color={maturity > 0.5 ? '#2e7d32' : '#558b2f'} 
                roughness={0.3}
              />
            </mesh>
            {/* Bumpy texture */}
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
            {/* Flower remnant */}
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
      {/* Soil */}
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Main stem - sturdy */}
      <mesh position={[0, stemHeight / 2 + 0.1, 0]}>
        <cylinderGeometry args={[0.025, 0.04, stemHeight, 10]} />
        <meshStandardMaterial color="#5d4037" roughness={0.8} />
      </mesh>

      {/* Large fuzzy leaves */}
      {Array.from({ length: branchCount }).map((_, i) => {
        const angle = (i / branchCount) * Math.PI * 2;
        const height = 0.15 + (i / branchCount) * stemHeight * 0.7;
        const leafSize = 0.15 + progress * 0.1 - i * 0.01;
        
        return (
          <group key={i} position={[0, height, 0]} rotation={[0.4, angle, 0]}>
            {/* Petiole */}
            <mesh position={[0.1, 0, 0]} rotation={[0, 0, -0.25]}>
              <cylinderGeometry args={[0.01, 0.015, 0.18, 6]} />
              <meshStandardMaterial color="#7b5e57" />
            </mesh>
            {/* Large oval leaf with fuzzy texture */}
            <group position={[0.25, 0.02, 0]}>
              <mesh scale={[2.5, 0.2, 1.6]}>
                <dodecahedronGeometry args={[leafSize]} />
                <meshStandardMaterial color="#558b2f" roughness={0.7} flatShading />
              </mesh>
              {/* Fuzzy texture overlay */}
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

      {/* Purple star-shaped flowers */}
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

      {/* Eggplants */}
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
            {/* Eggplant body - teardrop shape */}
            <mesh scale={[1, 1.8, 1]}>
              <sphereGeometry args={[size, 16, 16]} />
              <meshStandardMaterial 
                color={maturity > 0.5 ? '#4a148c' : '#7b1fa2'}
                roughness={0.15}
                metalness={0.1}
              />
            </mesh>
            {/* Calyx (green top) */}
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

// Plant Selection Scene
const PlantScene: React.FC<{ plantType: string; week: number }> = ({ plantType, week }) => {
  const PlantComponent = useMemo(() => {
    switch (plantType) {
      case 'lettuce': return <Lettuce3D week={week} />;
      case 'cucumber': return <Cucumber3D week={week} />;
      case 'eggplant': return <Eggplant3D week={week} />;
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
              Interactive weekly growth progression for vegetables
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
