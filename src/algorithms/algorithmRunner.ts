import { Neuron } from '../simulation/types';
import { AlgorithmType } from './types';
import * as THREE from 'three';

export class AlgorithmRunner {
  private neurons: Neuron[];
  private currentAlgorithm: AlgorithmType | null = null;
  private startTime: number = 0;
  private isRunning: boolean = false;
  private originalColors: Map<string, THREE.Color> = new Map();
  private currentProcessingNeuron: Neuron | null = null;

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
    const waveSpeed = 0.5; // POMALŠIA vlna - z 2 na 0.8
    const waveWidth = 4; // ŠIRŠIA vlna pre lepšiu viditeľnosť
    const currentRadius = elapsed * waveSpeed;
    
    let closestNeuron: Neuron | null = null;
    let minDiff = Infinity;

    this.neurons.forEach(neuron => {
      const distance = neuron.position.distanceTo(center);
      const diff = Math.abs(distance - currentRadius);
      
      // Track neurón closest to wave front
      if (diff < minDiff) {
        minDiff = diff;
        closestNeuron = neuron;
      }
      
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
          neuron.color.lerp(originalColor, 0.03); // Pomalší návrat pre lepšiu viditeľnosť
        }
      }
    });
    
    this.currentProcessingNeuron = closestNeuron;
  }

  private spiralGrowth(elapsed: number): void {
    const rotationSpeed = 0.35; // POMALŠIA rotácia - z 1.5 na 0.6
    const expansionSpeed = 0.3; // POMALŠIA expanzia - z 1 na 0.5
    
    let maxActivation = 0;
    let mostActiveNeuron: Neuron | null = null;
    
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
      
      // Track highest activation
      if (neuron.activation > maxActivation) {
        maxActivation = neuron.activation;
        mostActiveNeuron = neuron;
      }
      
      // VÝRAZNEJŠÍ farebný prechod - nasilu!
      const colorPhase = (angle + Math.PI + elapsed * 0.2) / (2 * Math.PI); // Pomalší farebný prechod
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
        neuron.color.lerp(spiralColor, 0.2); // Pomalší prechod
      }
    });
    
    this.currentProcessingNeuron = mostActiveNeuron;
  }

  private cascadeActivation(elapsed: number): void {
    // Zoraď neuróny podľa pozície (zľava doprava, zhora dole)
    const sortedNeurons = [...this.neurons].sort((a, b) => {
      const aValue = a.position.x * 0.5 + a.position.y * 0.5;
      const bValue = b.position.x * 0.5 + b.position.y * 0.5;
      return aValue - bValue;
    });
    
    const totalNeurons = sortedNeurons.length;
    const cascadeDuration = 6; // DLHŠIE trvanie - z 5 na 8 sekúnd
    
    let currentlyActivatingNeuron: Neuron | null = null;
    
    sortedNeurons.forEach((neuron, index) => {
      const progress = (index / totalNeurons) * cascadeDuration;
      const timeSinceActivation = elapsed - progress;
      
      if (timeSinceActivation > 0 && timeSinceActivation < 3) { // DLHŠIE svietenie - z 1.5 na 2.5
        // Plynulý nárast a pokles
        const curve = Math.sin((timeSinceActivation / 3) * Math.PI);
        neuron.activation = curve * 0.95; // Vyššia aktivácia
        
        // Track currently activating neuron (peak of curve)
        if (timeSinceActivation < 1.5 && timeSinceActivation > 0.5) {
          currentlyActivatingNeuron = neuron;
        }
        
        // VÝRAZNEJŠÍ prechod zo zelenej do žltej/oranžovej - nasilu!
        const colorPhase = timeSinceActivation / 3;
        const color = colorPhase < 0.5
          ? new THREE.Color('#00FF88')
          : new THREE.Color('#00FF88').lerp(new THREE.Color('#FFB74A'), (colorPhase - 0.5) * 2);
        
        neuron.color.copy(color); // Priama kópia!
      } else {
        neuron.activation *= 0.98; // POMALŠÍ fade
        
        // POMALŠÍ návrat
        const originalColor = this.originalColors.get(neuron.id);
        if (originalColor) {
          neuron.color.lerp(originalColor, 0.03); // Pomalší návrat pre lepšiu viditeľnosť
        }
      }
    });
    
    this.currentProcessingNeuron = currentlyActivatingNeuron;
  }

  private pulseNetwork(elapsed: number): void {
    const pulseFrequency = 0.25; // POMALŠÍ pulz - z 0.8 na 0.4
    
    let maxPulse = 0;
    let mostPulsingNeuron: Neuron | null = null;
    
    this.neurons.forEach(neuron => {
      // Jemné variácie medzi neurónmi
      const phase = (neuron.position.x + neuron.position.y + neuron.position.z) * 0.05;
      const localPulse = (Math.sin(elapsed * pulseFrequency * Math.PI + phase) + 1) / 2;
      
      // Vyššia aktivácia
      neuron.activation = localPulse * 0.9;
      
      // Track highest pulse
      if (localPulse > maxPulse) {
        maxPulse = localPulse;
        mostPulsingNeuron = neuron;
      }
      
      // VÝRAZNEJŠÍ farebný prechod - nasilu!
      const colorPhase = (Math.sin(elapsed * pulseFrequency * Math.PI * 0.3) + 1) / 2;
      const pulseColor = new THREE.Color('#FF6B9D').lerp(new THREE.Color('#B565FF'), colorPhase);
      
      // Priama kópia ak je pulz vysoký
      if (localPulse > 0.5) { // Nižší threshold
        neuron.color.copy(pulseColor);
      } else {
        neuron.color.lerp(pulseColor, 0.2); // Pomalší prechod
      }
    });
    
    this.currentProcessingNeuron = mostPulsingNeuron;
  }

  private randomWalker(elapsed: number): void {
    const walkSpeed = 0.8; // POMALŠIE - z 2 na 1.2
    const step = Math.floor(elapsed * walkSpeed);
    
    // POMALŠÍ fade všetkých
    this.neurons.forEach(n => {
      n.activation *= 0.98; // Pomalší fade - z 0.92 na 0.96
      
      // POMALŠÍ návrat k originálnej farbe
      const originalColor = this.originalColors.get(n.id);
      if (originalColor) {
        n.color.lerp(originalColor, 0.03); // Pomalší návrat - z 0.15 na 0.05
      }
    });
    
    // Aktivuj náhodný neurón - menej často
    if (step < this.neurons.length * 2) {
      const randomIndex = Math.floor(Math.sin(step * 12.9898) * 43758.5453) % this.neurons.length;
      const neuron = this.neurons[Math.abs(randomIndex)];
      if (neuron) {
        neuron.activation = 0.95; // Vyššia aktivácia
        
        // Track this as current
        this.currentProcessingNeuron = neuron;
        
        // VÝRAZNÁ oranžová - nasilu!
        const orangeColor = new THREE.Color('#FFB74A');
        neuron.color.copy(orangeColor);
        
        // ŠIRŠIA aktivácia susedov
        this.neurons.forEach(other => {
          const distance = neuron.position.distanceTo(other.position);
          if (distance < 4.5 && distance > 0) { // Väčší rozsah - z 3.5 na 4.5
            const intensity = Math.pow(1 - (distance / 4.5), 2);
            other.activation = Math.max(other.activation, intensity * 0.7); // Vyššia aktivácia
            
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
  
  getCurrentNeuron(): Neuron | null {
    return this.currentProcessingNeuron;
  }
}
