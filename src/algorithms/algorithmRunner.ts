import { Neuron } from '../simulation/types';
import { AlgorithmType } from './types';
import * as THREE from 'three';

export class AlgorithmRunner {
  private neurons: Neuron[];
  private currentAlgorithm: AlgorithmType | null = null;
  private startTime: number = 0;
  private isRunning: boolean = false;
  private originalColors: Map<string, THREE.Color> = new Map();

  constructor(neurons: Neuron[]) {
    this.neurons = neurons;
  }

  updateNeurons(neurons: Neuron[]) {
    this.neurons = neurons;
  }

  start(algorithmType: AlgorithmType) {
    this.currentAlgorithm = algorithmType;
    this.startTime = Date.now();
    this.isRunning = true;
    
    // Ulož originálne farby
    this.originalColors.clear();
    this.neurons.forEach(neuron => {
      this.originalColors.set(neuron.id, neuron.color.clone());
    });
  }

  stop() {
    this.isRunning = false;
    this.currentAlgorithm = null;
    
    // Reset všetkých neurónov
    this.neurons.forEach(neuron => {
      neuron.activation = 0;
      
      // Obnov originálnu farbu - COPY hodnoty, nevytváraj novú referenciu!
      const originalColor = this.originalColors.get(neuron.id);
      if (originalColor) {
        neuron.color.copy(originalColor);
      }
    });
    
    this.originalColors.clear();
  }
  
  // Metóda na zmenu farby neurónu
  private setNeuronColor(neuron: Neuron, color: string, intensity: number = 1) {
    const newColor = new THREE.Color(color);
    // Interpoluj medzi originálnou farbou a novou
    const originalColor = this.originalColors.get(neuron.id) || neuron.color;
    neuron.color.lerpColors(originalColor, newColor, intensity);
  }

  update(): void {
    if (!this.isRunning || !this.currentAlgorithm) return;

    const elapsed = (Date.now() - this.startTime) / 1000; // v sekundách

    switch (this.currentAlgorithm) {
      case 'wave-propagation':
        this.wavePropaation(elapsed);
        break;
      case 'spiral-growth':
        this.spiralGrowth(elapsed);
        break;
      case 'cascade-activation':
        this.cascadeActivation(elapsed);
        break;
      case 'pulse-network':
        this.pulseNetwork(elapsed);
        break;
      case 'random-walker':
        this.randomWalker(elapsed);
        break;
    }
  }

  private wavePropaation(elapsed: number): void {
    const center = new THREE.Vector3(0, 0, 0);
    const waveSpeed = 0.8; // POMALŠIA vlna - z 2 na 0.8
    const waveWidth = 3.5; // ŠIRŠIA vlna pre lepšiu viditeľnosť
    const currentRadius = elapsed * waveSpeed;

    this.neurons.forEach(neuron => {
      const distance = neuron.position.distanceTo(center);
      const diff = Math.abs(distance - currentRadius);
      
      // Plynulá vlna s jemným fade
      const waveFactor = Math.exp(-Math.pow(diff / waveWidth, 2));
      neuron.activation = waveFactor * 0.95; // Vyššia aktivácia
      
      // VÝRAZNEJŠIA zmena farby - nasilu!
      if (waveFactor > 0.2) { // Nižší threshold pre väčšiu oblasť
        const blueColor = new THREE.Color('#00D4FF');
        neuron.color.copy(blueColor); // Priama kópia, nie lerp!
      } else {
        // POMALŠÍ návrat k originálnej farbe
        const originalColor = this.originalColors.get(neuron.id);
        if (originalColor) {
          neuron.color.lerp(originalColor, 0.05); // Pomalší návrat pre lepšiu viditeľnosť
        }
      }
    });
  }

  private spiralGrowth(elapsed: number): void {
    const rotationSpeed = 0.6; // POMALŠIA rotácia - z 1.5 na 0.6
    const expansionSpeed = 0.5; // POMALŠIA expanzia - z 1 na 0.5
    
    this.neurons.forEach(neuron => {
      const angle = Math.atan2(neuron.position.z, neuron.position.x);
      const distance = Math.sqrt(
        neuron.position.x ** 2 + neuron.position.z ** 2
      );
      
      // Jemnejší špirálový vzor
      const spiralPhase = angle + distance * 0.3 - elapsed * rotationSpeed;
      const activation = (Math.sin(spiralPhase) * 0.5 + 0.5) * 0.95; // Vyššia aktivácia
      
      // Plynulejšia expanzia
      const expansionPhase = Math.sin((distance - elapsed * expansionSpeed) * 0.5) * 0.5 + 0.5;
      
      neuron.activation = activation * expansionPhase * 0.9;
      
      // VÝRAZNEJŠÍ farebný prechod - nasilu!
      const colorPhase = (angle + Math.PI + elapsed * 0.3) / (2 * Math.PI); // Pomalší farebný prechod
      const normalizedPhase = colorPhase % 1;
      
      let spiralColor: THREE.Color;
      if (normalizedPhase < 0.33) {
        spiralColor = new THREE.Color('#B565FF').lerp(new THREE.Color('#00D4FF'), normalizedPhase * 3);
      } else if (normalizedPhase < 0.67) {
        spiralColor = new THREE.Color('#00D4FF').lerp(new THREE.Color('#00FF88'), (normalizedPhase - 0.33) * 3);
      } else {
        spiralColor = new THREE.Color('#00FF88').lerp(new THREE.Color('#B565FF'), (normalizedPhase - 0.67) * 3);
      }
      
      // Priama kópia ak je aktivácia vysoká, inak rýchlejší lerp
      if (activation > 0.4) { // Nižší threshold
        neuron.color.copy(spiralColor);
      } else {
        neuron.color.lerp(spiralColor, 0.3); // Pomalší prechod
      }
    });
  }

  private cascadeActivation(elapsed: number): void {
    // Zoraď neuróny podľa pozície (zľava doprava, zhora dole)
    const sortedNeurons = [...this.neurons].sort((a, b) => {
      const aValue = a.position.x * 0.5 + a.position.y * 0.5;
      const bValue = b.position.x * 0.5 + b.position.y * 0.5;
      return aValue - bValue;
    });
    
    const totalNeurons = sortedNeurons.length;
    const cascadeDuration = 5; // dlhšie trvanie pre plynulosť
    
    sortedNeurons.forEach((neuron, index) => {
      const progress = (index / totalNeurons) * cascadeDuration;
      const timeSinceActivation = elapsed - progress;
      
      if (timeSinceActivation > 0 && timeSinceActivation < 1.5) {
        // Plynulý nárast a pokles
        const curve = Math.sin((timeSinceActivation / 1.5) * Math.PI);
        neuron.activation = curve * 0.9;
        
        // VÝRAZNEJŠÍ prechod zo zelenej do žltej/oranžovej - nasilu!
        const colorPhase = timeSinceActivation / 1.5;
        const color = colorPhase < 0.5
          ? new THREE.Color('#00FF88')
          : new THREE.Color('#00FF88').lerp(new THREE.Color('#FFB74A'), (colorPhase - 0.5) * 2);
        
        neuron.color.copy(color); // Priama kópia!
      } else {
        neuron.activation *= 0.95;
        
        // Plynulý návrat
        const originalColor = this.originalColors.get(neuron.id);
        if (originalColor) {
          neuron.color.lerp(originalColor, 0.1); // Rýchlejší návrat
        }
      }
    });
  }

  private pulseNetwork(elapsed: number): void {
    const pulseFrequency = 0.8; // Pomalší pulz
    
    this.neurons.forEach(neuron => {
      // Jemné variácie medzi neurónmi
      const phase = (neuron.position.x + neuron.position.y + neuron.position.z) * 0.05;
      const localPulse = (Math.sin(elapsed * pulseFrequency * Math.PI + phase) + 1) / 2;
      
      // Jemnejšia aktivácia
      neuron.activation = localPulse * 0.8;
      
      // VÝRAZNEJŠÍ farebný prechod - nasilu!
      const colorPhase = (Math.sin(elapsed * pulseFrequency * Math.PI * 0.3) + 1) / 2;
      const pulseColor = new THREE.Color('#FF6B9D').lerp(new THREE.Color('#B565FF'), colorPhase);
      
      // Priama kópia ak je pulz vysoký
      if (localPulse > 0.6) {
        neuron.color.copy(pulseColor);
      } else {
        neuron.color.lerp(pulseColor, 0.4);
      }
    });
  }

  private randomWalker(elapsed: number): void {
    const walkSpeed = 2; // Pomalšie
    const step = Math.floor(elapsed * walkSpeed);
    
    // Jemný fade všetkých
    this.neurons.forEach(n => {
      n.activation *= 0.92;
      
      // Plynulý návrat k originálnej farbe
      const originalColor = this.originalColors.get(n.id);
      if (originalColor) {
        n.color.lerp(originalColor, 0.15); // Rýchlejší návrat
      }
    });
    
    // Aktivuj náhodný neurón - menej často
    if (step < this.neurons.length * 2) {
      const randomIndex = Math.floor(Math.sin(step * 12.9898) * 43758.5453) % this.neurons.length;
      const neuron = this.neurons[Math.abs(randomIndex)];
      if (neuron) {
        neuron.activation = 0.9;
        
        // VÝRAZNÁ oranžová - nasilu!
        const orangeColor = new THREE.Color('#FFB74A');
        neuron.color.copy(orangeColor);
        
        // Jemnejšia aktivácia susedov
        this.neurons.forEach(other => {
          const distance = neuron.position.distanceTo(other.position);
          if (distance < 3.5 && distance > 0) {
            const intensity = Math.pow(1 - (distance / 3.5), 2);
            other.activation = Math.max(other.activation, intensity * 0.6);
            
            // VÝRAZNÝ prechod do zelenej - nasilu!
            const greenColor = new THREE.Color('#00FF88');
            other.color.copy(greenColor);
          }
        });
      }
    }
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getCurrentAlgorithm(): AlgorithmType | null {
    return this.currentAlgorithm;
  }
}
