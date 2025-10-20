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
    description: 'Vlny aktivácie sa šíria od stredu siete radiálne von. Neuróny sa postupne sfarbujú na jasno-modro pri prechode vlny. Simuluje šírenie elektrického signálu v nervovom systéme.',
    duration: 12, // Predĺžené na 12s pre lepšiu viditeľnosť
    color: '#00D4FF',
  },
  {
    id: 'spiral-growth',
    name: 'Spiral Growth',
    description: 'Neuróny sa aktivujú v rotujúcej špirále s plynulým farebným prechodom (fialová → modrá → zelená). Vytvorí sa hypnotický vizuálny efekt podobný rastu organizmov.',
    duration: 15, // Predĺžené na 15s
    color: '#B565FF',
  },
  {
    id: 'cascade-activation',
    name: 'Cascade Activation',
    description: 'Postupná kaskádová aktivácia od najstarších neurónov (jasná zelená) k najnovším (oranžová). Demonštruje učenie a sekvenčné spracovanie v hlbokých neurónových sieťach.',
    duration: 10, // Predĺžené na 10s
    color: '#00FF88',
  },
  {
    id: 'pulse-network',
    name: 'Pulse Network',
    description: 'Celá sieť pulzuje synchronizovane s rytmickým prechodom ružová ↔ fialová. Pripomína mozgové vlny alfa a theta počas hlbokej relaxácie alebo REM spánku.',
    duration: 14, // Predĺžené na 14s
    color: '#FF6B9D',
  },
  {
    id: 'random-walker',
    name: 'Random Walker',
    description: 'Náhodné šírenie aktivácie cez susedné neuróny (žiariaca oranžová → jasná zelená). Simuluje stochastickú difúziu signálu a spontánnu aktivitu v biologických neurónových sieťach.',
    duration: 13, // Predĺžené na 13s
    color: '#FFB74A',
  },
];
