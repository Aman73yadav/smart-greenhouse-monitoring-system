import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Building, Calendar, TrendingUp } from 'lucide-react';

interface PlantGrowthData {
  position: [number, number, number];
  type: 'tomato' | 'lettuce' | 'pepper' | 'strawberry' | 'carrot' | 'cucumber';
  plantedWeek: number;
}

// Individual plant in greenhouse
const GreenhousePlant: React.FC<{ 
  data: PlantGrowthData; 
  currentWeek: number;
}> = ({ data, currentWeek }) => {
  const groupRef = useRef<THREE.Group>(null);
  const growthWeek = Math.max(0, currentWeek - data.plantedWeek);
  const maxWeeks = data.type === 'lettuce' ? 8 : data.type === 'carrot' ? 12 : 14;
  const progress = Math.min(growthWeek / maxWeeks, 1);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + data.position[0]) * 0.02;
    }
  });

  const plantHeight = 0.05 + progress * 0.4;
  const plantColor = useMemo(() => {
    const colors: Record<string, string> = {
      tomato: progress > 0.8 ? '#e53935' : '#4caf50',
      lettuce: '#81c784',
      pepper: progress > 0.8 ? '#ff9800' : '#66bb6a',
      strawberry: progress > 0.8 ? '#c62828' : '#4caf50',
      carrot: '#ff9800',
      cucumber: '#558b2f',
    };
    return colors[data.type];
  }, [data.type, progress]);

  if (growthWeek <= 0) return null;

  return (
    <group ref={groupRef} position={data.position}>
      {/* Soil patch */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.04, 8]} />
        <meshStandardMaterial color="#3e2723" roughness={0.95} />
      </mesh>

      {/* Plant stem */}
      <mesh position={[0, plantHeight / 2 + 0.04, 0]}>
        <cylinderGeometry args={[0.008 + progress * 0.01, 0.015, plantHeight, 8]} />
        <meshStandardMaterial color="#558b2f" />
      </mesh>

      {/* Leaves */}
      {Array.from({ length: Math.floor(2 + progress * 6) }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const leafHeight = 0.08 + (i / 6) * plantHeight * 0.7;
        const leafSize = 0.03 + progress * 0.04 - i * 0.005;

        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * 0.03,
              leafHeight,
              Math.sin(angle) * 0.03
            ]}
            rotation={[0.3, angle, 0]}
            scale={[2, 0.15, 1.2]}
          >
            <dodecahedronGeometry args={[leafSize]} />
            <meshStandardMaterial color="#66bb6a" flatShading />
          </mesh>
        );
      })}

      {/* Fruits/Vegetables (when mature) */}
      {progress > 0.7 && data.type !== 'lettuce' && data.type !== 'carrot' && (
        <group>
          {Array.from({ length: Math.floor((progress - 0.7) * 10) }).map((_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(i * 1.5) * 0.06,
                plantHeight * 0.5 + i * 0.04,
                Math.sin(i * 1.5) * 0.06
              ]}
            >
              <sphereGeometry args={[0.015 + (progress - 0.7) * 0.02, 8, 8]} />
              <meshStandardMaterial color={plantColor} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// Greenhouse structure
const GreenhouseStructure: React.FC = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} />
      </mesh>

      {/* Growing beds */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 0.1, 0]}>
          <boxGeometry args={[1.5, 0.2, 3.5]} />
          <meshStandardMaterial color="#5d4037" roughness={0.85} />
        </mesh>
      ))}

      {/* Greenhouse frame posts */}
      {[
        [-2.8, 0, -1.8], [2.8, 0, -1.8], [-2.8, 0, 1.8], [2.8, 0, 1.8],
        [-2.8, 0, 0], [2.8, 0, 0]
      ].map((pos, i) => (
        <mesh key={i} position={[pos[0], 1.5, pos[2]]}>
          <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
          <meshStandardMaterial color="#90a4ae" metalness={0.5} />
        </mesh>
      ))}

      {/* Roof arches */}
      {[-1.8, 0, 1.8].map((z, i) => (
        <mesh key={i} position={[0, 3.2, z]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[2.8, 0.04, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#90a4ae" metalness={0.5} />
        </mesh>
      ))}

      {/* Glass panels (transparent) */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[5.8, 2.5, 3.8]} />
        <meshStandardMaterial 
          color="#e3f2fd" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Irrigation pipes */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <mesh key={`pipe-${i}`} position={[x, 0.35, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 3.2, 8]} />
          <meshStandardMaterial color="#1565c0" />
        </mesh>
      ))}

      {/* Sensors */}
      {[[-1, 2.5, 0], [1, 2.5, 0]].map((pos, i) => (
        <mesh key={`sensor-${i}`} position={[pos[0], pos[1], pos[2]]}>
          <boxGeometry args={[0.15, 0.1, 0.1]} />
          <meshStandardMaterial color="#4caf50" emissive="#4caf50" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
};

// Weather effects based on week
const WeatherEffects: React.FC<{ week: number }> = ({ week }) => {
  const season = Math.floor((week % 52) / 13); // 0=winter, 1=spring, 2=summer, 3=fall
  const sunPosition = useMemo(() => {
    const hour = 6 + (week % 24);
    return [
      Math.cos((hour / 24) * Math.PI * 2) * 50,
      20 + Math.sin((hour / 24) * Math.PI) * 30,
      -20
    ] as [number, number, number];
  }, [week]);

  return (
    <>
      <Sky 
        sunPosition={sunPosition}
        turbidity={season === 0 ? 20 : 8}
        rayleigh={season === 2 ? 0.5 : 2}
      />
    </>
  );
};

// Main greenhouse scene
const GreenhouseScene: React.FC<{ 
  currentWeek: number;
  plants: PlantGrowthData[];
}> = ({ currentWeek, plants }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[6, 5, 6]} fov={50} />
      <OrbitControls
        enablePan={true}
        minDistance={4}
        maxDistance={15}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 1, 0]}
      />
      
      <WeatherEffects week={currentWeek} />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 5]} intensity={1.2} castShadow />
      <pointLight position={[-5, 8, -5]} intensity={0.3} color="#ffe082" />

      <GreenhouseStructure />
      
      {plants.map((plant, i) => (
        <GreenhousePlant key={i} data={plant} currentWeek={currentWeek} />
      ))}

      {/* Week indicator in scene */}
      <Html position={[0, 4, 0]} center>
        <div className="bg-background/90 px-4 py-2 rounded-lg shadow-lg border border-border text-center">
          <p className="text-lg font-bold">Week {currentWeek}</p>
          <p className="text-xs text-muted-foreground">
            {currentWeek <= 4 ? '🌱 Early Growth' : 
             currentWeek <= 8 ? '🌿 Vegetative' : 
             currentWeek <= 12 ? '🌸 Flowering' : '🍅 Harvest Time'}
          </p>
        </div>
      </Html>
    </>
  );
};

export const GreenhouseGrowthSimulation: React.FC = () => {
  const [week, setWeek] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Generate plants across growing beds
  const plants = useMemo<PlantGrowthData[]>(() => {
    const plantTypes: PlantGrowthData['type'][] = ['tomato', 'lettuce', 'pepper', 'strawberry', 'carrot', 'cucumber'];
    const result: PlantGrowthData[] = [];
    
    [-1.5, 0, 1.5].forEach((bedX, bedIndex) => {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 3; col++) {
          result.push({
            position: [
              bedX + (col - 1) * 0.4,
              0.22,
              (row - 2) * 0.6
            ],
            type: plantTypes[(bedIndex * 5 + row + col) % plantTypes.length],
            plantedWeek: Math.floor(Math.random() * 3) // Staggered planting
          });
        }
      }
    });
    
    return result;
  }, []);

  // Simulation effect
  React.useEffect(() => {
    if (!isSimulating) return;
    
    const interval = setInterval(() => {
      setWeek(prev => {
        if (prev >= 16) {
          setIsSimulating(false);
          return 1;
        }
        return prev + 1;
      });
    }, 2000 / speed);

    return () => clearInterval(interval);
  }, [isSimulating, speed]);

  const harvestReady = plants.filter(p => {
    const growth = week - p.plantedWeek;
    const maxWeeks = p.type === 'lettuce' ? 8 : p.type === 'carrot' ? 12 : 14;
    return growth >= maxWeeks;
  }).length;

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              3D Greenhouse Growth Simulation
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Watch your entire greenhouse grow week by week
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Week {week}/16
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {harvestReady} Ready
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">{plants.length}</p>
            <p className="text-xs text-muted-foreground">Total Plants</p>
          </div>
          <div className="p-3 bg-success/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-success">{harvestReady}</p>
            <p className="text-xs text-muted-foreground">Harvest Ready</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">
              {Math.round((plants.filter(p => week - p.plantedWeek > 0).length / plants.length) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">Growing</p>
          </div>
        </div>

        {/* 3D View */}
        <div className="h-[450px] rounded-xl overflow-hidden bg-gradient-to-b from-sky-200 to-green-100 dark:from-slate-900 dark:to-slate-800">
          <Canvas shadows>
            <React.Suspense fallback={null}>
              <GreenhouseScene currentWeek={week} plants={plants} />
            </React.Suspense>
          </Canvas>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium w-20">Week {week}</span>
            <Slider
              value={[week]}
              onValueChange={(v) => setWeek(v[0])}
              min={1}
              max={16}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12 text-right">/ 16</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium w-20">Speed</span>
            <Slider
              value={[speed]}
              onValueChange={(v) => setSpeed(v[0])}
              min={0.5}
              max={3}
              step={0.5}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-12 text-right">{speed}x</span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isSimulating ? "destructive" : "default"}
              onClick={() => setIsSimulating(!isSimulating)}
              className="flex-1"
            >
              {isSimulating ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isSimulating ? 'Pause Simulation' : 'Start Simulation'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setWeek(1)}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Drag to rotate • Scroll to zoom • Pan with right click
        </p>
      </CardContent>
    </Card>
  );
};