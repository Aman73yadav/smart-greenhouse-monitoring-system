export interface PlantInfo {
  name: string;
  species: string;
  category: 'vegetable' | 'fruit' | 'herb';
  growthWeeks: number;
  optimalTemp: { min: number; max: number };
  optimalHumidity: { min: number; max: number };
  wateringFrequency: string;
  stages: { week: number; name: string; description: string }[];
  tips: string[];
  image?: string;
}

import tomatoImg from '@/assets/tomatoes.jpg';
import lettuceImg from '@/assets/lettuce.jpg';
import pepperImg from '@/assets/peppers.jpg';
import cucumberImg from '@/assets/cucumbers.jpg';
import strawberryImg from '@/assets/strawberries.jpg';
import carrotImg from '@/assets/carrots.jpg';
import eggplantImg from '@/assets/eggplant.jpg';

export const plantLibrary: PlantInfo[] = [
  {
    name: 'Cherry Tomato',
    species: 'Solanum lycopersicum',
    category: 'vegetable',
    growthWeeks: 12,
    optimalTemp: { min: 18, max: 29 },
    optimalHumidity: { min: 60, max: 80 },
    wateringFrequency: 'Daily',
    image: tomatoImg,
    stages: [
      { week: 1, name: 'Germination', description: 'Seed sprouts, cotyledons emerge' },
      { week: 2, name: 'Seedling', description: 'First true leaves develop' },
      { week: 4, name: 'Vegetative', description: 'Rapid stem and leaf growth' },
      { week: 6, name: 'Flowering', description: 'Yellow flowers appear' },
      { week: 8, name: 'Fruit Set', description: 'Small green tomatoes form' },
      { week: 10, name: 'Ripening', description: 'Fruits turn red' },
      { week: 12, name: 'Harvest', description: 'Ready for picking' },
    ],
    tips: ['Prune suckers for larger fruits', 'Support with stakes or cages', 'Consistent watering prevents cracking'],
  },
  {
    name: 'Butterhead Lettuce',
    species: 'Lactuca sativa',
    category: 'vegetable',
    growthWeeks: 8,
    optimalTemp: { min: 15, max: 21 },
    optimalHumidity: { min: 50, max: 70 },
    wateringFrequency: 'Every 2 days',
    image: lettuceImg,
    stages: [
      { week: 1, name: 'Germination', description: 'Seeds sprout in 2-3 days' },
      { week: 2, name: 'Seedling', description: 'First leaves unfold' },
      { week: 4, name: 'Rosette', description: 'Leaves form circular pattern' },
      { week: 6, name: 'Head Formation', description: 'Leaves begin to cup' },
      { week: 8, name: 'Mature', description: 'Full head formed, harvest ready' },
    ],
    tips: ['Keep soil consistently moist', 'Harvest in morning for best flavor', 'Shade cloth in hot weather'],
  },
  {
    name: 'Bell Pepper',
    species: 'Capsicum annuum',
    category: 'vegetable',
    growthWeeks: 14,
    optimalTemp: { min: 20, max: 30 },
    optimalHumidity: { min: 60, max: 75 },
    wateringFrequency: 'Every 2-3 days',
    image: pepperImg,
    stages: [
      { week: 1, name: 'Germination', description: 'Seeds take 7-10 days to sprout' },
      { week: 3, name: 'Seedling', description: 'True leaves develop' },
      { week: 6, name: 'Vegetative', description: 'Bushy growth begins' },
      { week: 8, name: 'Flowering', description: 'White flowers appear' },
      { week: 10, name: 'Fruit Development', description: 'Peppers grow and mature' },
      { week: 14, name: 'Harvest', description: 'Color change indicates ripeness' },
    ],
    tips: ['Warm soil speeds germination', 'Pick green or wait for color', 'Calcium prevents blossom end rot'],
  },
  {
    name: 'Cucumber',
    species: 'Cucumis sativus',
    category: 'vegetable',
    growthWeeks: 10,
    optimalTemp: { min: 21, max: 32 },
    optimalHumidity: { min: 70, max: 90 },
    wateringFrequency: 'Daily',
    image: cucumberImg,
    stages: [
      { week: 1, name: 'Germination', description: 'Quick sprouting in 3-5 days' },
      { week: 2, name: 'Seedling', description: 'Large cotyledons and true leaves' },
      { week: 4, name: 'Vining', description: 'Rapid vine growth begins' },
      { week: 6, name: 'Flowering', description: 'Male and female flowers' },
      { week: 8, name: 'Fruiting', description: 'Cucumbers develop quickly' },
      { week: 10, name: 'Harvest', description: 'Pick before seeds harden' },
    ],
    tips: ['Trellis for straight fruits', 'Pick frequently for more production', 'High humidity prevents bitterness'],
  },
  {
    name: 'Strawberry',
    species: 'Fragaria × ananassa',
    category: 'fruit',
    growthWeeks: 16,
    optimalTemp: { min: 15, max: 26 },
    optimalHumidity: { min: 60, max: 80 },
    wateringFrequency: 'Every 2 days',
    image: strawberryImg,
    stages: [
      { week: 1, name: 'Establishment', description: 'Roots develop' },
      { week: 4, name: 'Vegetative', description: 'Crown and leaves grow' },
      { week: 8, name: 'Runner Production', description: 'Runners extend' },
      { week: 10, name: 'Flowering', description: 'White flowers bloom' },
      { week: 12, name: 'Fruit Set', description: 'Green berries form' },
      { week: 14, name: 'Ripening', description: 'Berries turn red' },
      { week: 16, name: 'Harvest', description: 'Full red, sweet and juicy' },
    ],
    tips: ['Mulch to keep berries clean', 'Remove first flowers for stronger plants', 'Net against birds'],
  },
  {
    name: 'Carrot',
    species: 'Daucus carota',
    category: 'vegetable',
    growthWeeks: 12,
    optimalTemp: { min: 15, max: 24 },
    optimalHumidity: { min: 50, max: 70 },
    wateringFrequency: 'Every 2-3 days',
    image: carrotImg,
    stages: [
      { week: 1, name: 'Germination', description: 'Slow to sprout, 10-14 days' },
      { week: 3, name: 'Seedling', description: 'Feathery leaves appear' },
      { week: 6, name: 'Root Development', description: 'Taproot thickens' },
      { week: 9, name: 'Sizing', description: 'Carrot reaches full length' },
      { week: 12, name: 'Harvest', description: 'Shoulders visible, ready to pull' },
    ],
    tips: ['Loose soil for straight roots', 'Thin seedlings early', 'Harvest before ground freezes'],
  },
  {
    name: 'Eggplant',
    species: 'Solanum melongena',
    category: 'vegetable',
    growthWeeks: 14,
    optimalTemp: { min: 22, max: 32 },
    optimalHumidity: { min: 60, max: 80 },
    wateringFrequency: 'Every 2-3 days',
    image: eggplantImg,
    stages: [
      { week: 1, name: 'Germination', description: 'Seeds need warmth, 7-14 days' },
      { week: 3, name: 'Seedling', description: 'Purple-tinged leaves' },
      { week: 6, name: 'Vegetative', description: 'Bushy plant develops' },
      { week: 8, name: 'Flowering', description: 'Purple flowers appear' },
      { week: 10, name: 'Fruit Set', description: 'Fruits begin to form' },
      { week: 14, name: 'Harvest', description: 'Glossy skin, slight give' },
    ],
    tips: ['Stake heavy plants', 'Pick before seeds harden', 'Warm soil essential'],
  },
  {
    name: 'Basil',
    species: 'Ocimum basilicum',
    category: 'herb',
    growthWeeks: 6,
    optimalTemp: { min: 20, max: 30 },
    optimalHumidity: { min: 50, max: 70 },
    wateringFrequency: 'Daily',
    stages: [
      { week: 1, name: 'Germination', description: 'Quick sprouting in 5-7 days' },
      { week: 2, name: 'Seedling', description: 'First true leaves' },
      { week: 3, name: 'Vegetative', description: 'Rapid leaf production' },
      { week: 4, name: 'Bushing', description: 'Pinching promotes branching' },
      { week: 6, name: 'Harvest', description: 'Continuous harvesting begins' },
    ],
    tips: ['Pinch flower buds', 'Harvest from top', 'Never let soil dry out'],
  },
  {
    name: 'Spinach',
    species: 'Spinacia oleracea',
    category: 'vegetable',
    growthWeeks: 6,
    optimalTemp: { min: 10, max: 20 },
    optimalHumidity: { min: 50, max: 70 },
    wateringFrequency: 'Every 2 days',
    stages: [
      { week: 1, name: 'Germination', description: 'Sprouts in 5-7 days' },
      { week: 2, name: 'Seedling', description: 'First true leaves' },
      { week: 4, name: 'Vegetative', description: 'Rosette of leaves' },
      { week: 6, name: 'Harvest', description: 'Cut-and-come-again harvesting' },
    ],
    tips: ['Cool weather crop', 'Partial shade in warm weather', 'Harvest outer leaves first'],
  },
  {
    name: 'Zucchini',
    species: 'Cucurbita pepo',
    category: 'vegetable',
    growthWeeks: 8,
    optimalTemp: { min: 21, max: 32 },
    optimalHumidity: { min: 60, max: 80 },
    wateringFrequency: 'Daily',
    stages: [
      { week: 1, name: 'Germination', description: 'Fast sprouting, 4-6 days' },
      { week: 2, name: 'Seedling', description: 'Large leaves unfold' },
      { week: 4, name: 'Vegetative', description: 'Rapid plant growth' },
      { week: 5, name: 'Flowering', description: 'Male then female flowers' },
      { week: 6, name: 'Fruiting', description: 'Fruits grow fast' },
      { week: 8, name: 'Harvest', description: 'Pick young for best taste' },
    ],
    tips: ['Hand pollinate indoors', 'Pick every 2-3 days', 'Morning harvest'],
  },
];

export const getPlantByName = (name: string): PlantInfo | undefined => {
  return plantLibrary.find(p => p.name.toLowerCase() === name.toLowerCase());
};

export const getPlantsByCategory = (category: 'vegetable' | 'fruit' | 'herb'): PlantInfo[] => {
  return plantLibrary.filter(p => p.category === category);
};
