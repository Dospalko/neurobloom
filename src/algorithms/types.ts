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
    description: 'Vlny aktivácie sa šíria od stredu siete radiálne von. Neuróny sa postupne sfarbujú na modro pri prechode vlny. Simuluje šírenie signálu v nervovom systéme.',
    duration: 5,
    color: '#4A9EFF',
  },
  {
    id: 'spiral-growth',
    name: 'Spiral Growth',
    description: 'Neuróny sa aktivujú v rotujúcej špirále s farebným prechodom z fialovej cez modrú až po zelenú. Vytvorí sa hypnotický vizuálny efekt organického rastu.',
    duration: 6,
    color: '#9B6AFF',
  },
  {
    id: 'cascade-activation',
    name: 'Cascade Activation',
    description: 'Postupná aktivácia od najstarších neurónov (zelená) k najnovším (oranžová). Simuluje učenie a sekvenčné spracovanie informácií v neurónových vrstvách.',
    duration: 4,
    color: '#5FE88C',
  },
  {
    id: 'pulse-network',
    name: 'Pulse Network',
    description: 'Celá sieť pulzuje synchronizovane s plynulým prechodom medzi ružovou a fialovou farbou. Pripomína rytmické mozgové vlny počas spánku alebo meditácie.',
    duration: 8,
    color: '#FF6B9D',
  },
  {
    id: 'random-walker',
    name: 'Random Walker',
    description: 'Náhodné šírenie aktivácie cez susedné neuróny (oranžová → zelená). Simuluje spontánnu neurónovú aktivitu a difúziu signálu v biologických sieťach.',
    duration: 7,
    color: '#FFB74A',
  },
];
