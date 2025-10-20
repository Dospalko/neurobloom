export type AlgorithmType = 
  | 'wave-propagation'
  | 'spiral-growth'
  | 'cascade-activation'
  | 'pulse-network'
  | 'random-walker';

export interface Algorithm {
  id: AlgorithmType;
  name: string;
  description: string;
  duration: number; // v sekundách
  color: string;
}

export const ALGORITHMS: Algorithm[] = [
  {
    id: 'wave-propagation',
    name: 'Wave Propagation',
    description: 'Vlny aktivácie sa šíria od stredu siete radiálne von, simulujúc šírenie signálu v mozgu.',
    duration: 5,
    color: '#4A9EFF',
  },
  {
    id: 'spiral-growth',
    name: 'Spiral Growth',
    description: 'Neuróny sa aktivujú v špirále, vytvárajúc hypnotický vizuálny efekt organického rastu.',
    duration: 6,
    color: '#9B6AFF',
  },
  {
    id: 'cascade-activation',
    name: 'Cascade Activation',
    description: 'Kaskádová aktivácia od najstarších k najnovším neurónom, simulujúc učenie a spracovanie informácií.',
    duration: 4,
    color: '#5FE88C',
  },
  {
    id: 'pulse-network',
    name: 'Pulse Network',
    description: 'Synchronizované pulzovanie celej siete v rytmických vlnách, podobné mozgovým vlnám.',
    duration: 8,
    color: '#FF6B9D',
  },
  {
    id: 'random-walker',
    name: 'Random Walker',
    description: 'Náhodné prechádzanie aktivácie cez sieť, simulujúc spontánnu neurónovú aktivitu.',
    duration: 7,
    color: '#FFB74A',
  },
];
