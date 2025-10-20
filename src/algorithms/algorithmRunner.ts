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
      
      // Obnov originálnu farbu
      const originalColor = this.originalColors.get(neuron.id);
      if (originalColor) {
        neuron.color = originalColor;
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
    const waveSpeed = 2.5;
    const waveWidth = 2.0;
    const currentRadius = elapsed * waveSpeed;

    this.neurons.forEach(neuron => {
      const distance = neuron.position.distanceTo(center);
      const diff = Math.abs(distance - currentRadius);
      
      if (diff < waveWidth) {
        const activation = 1 - (diff / waveWidth);
        neuron.activation = activation;
        
        // Mení farbu na jasno-modrú keď je vlna na ňom
        this.setNeuronColor(neuron, '#00D4FF', activation);
      } else {
        neuron.activation *= 0.92; // Fade out
        
        // Fade back to original
        const originalColor = this.originalColors.get(neuron.id);
        if (originalColor) {
          neuron.color.lerp(originalColor, 0.1);
        }
      }
    });
  }

  private spiralGrowth(elapsed: number): void {
    const rotationSpeed = 2;
    const expansionSpeed = 1.5;
    
    this.neurons.forEach(neuron => {
      const angle = Math.atan2(neuron.position.z, neuron.position.x);
      const distance = Math.sqrt(
        neuron.position.x ** 2 + neuron.position.z ** 2
      );
      
      // Spiral pattern
      const spiralPhase = angle + distance * 0.5 - elapsed * rotationSpeed;
      const activation = (Math.sin(spiralPhase) + 1) / 2;
      
      // Expansion wave
      const expansionPhase = distance - elapsed * expansionSpeed;
      const expansion = Math.exp(-Math.abs(expansionPhase) * 0.5);
      
      neuron.activation = activation * expansion;
      
      // Farebná špirála - prechod z jasnej fialovej do jasnej zelenej
      const colorPhase = (angle + Math.PI) / (2 * Math.PI); // 0 to 1
      const spiralColor = colorPhase < 0.5 
        ? new THREE.Color('#B565FF').lerp(new THREE.Color('#00D4FF'), colorPhase * 2)
        : new THREE.Color('#00D4FF').lerp(new THREE.Color('#00FF88'), (colorPhase - 0.5) * 2);
      
      neuron.color.copy(spiralColor).multiplyScalar(0.5 + activation * 0.5);
    });
  }

  private cascadeActivation(elapsed: number): void {
    const cascadeSpeed = 0.3;
    
    // Zoraď neuróny podle age alebo pozície Y
    const sortedNeurons = [...this.neurons].sort((a, b) => a.age - b.age);
    const totalNeurons = sortedNeurons.length;
    
    sortedNeurons.forEach((neuron, index) => {
      const phase = (index / totalNeurons) * 4;
      const activation = elapsed - phase;
      
      if (activation > 0 && activation < 1) {
        neuron.activation = Math.sin(activation * Math.PI);
        
        // Jasná zelená farba pri aktivácii
        this.setNeuronColor(neuron, '#00FF88', neuron.activation);
      } else if (activation >= 1) {
        neuron.activation = Math.max(0, 1 - (activation - 1) * 0.5);
        
        // Fade to orange
        this.setNeuronColor(neuron, '#FFB74A', neuron.activation * 0.5);
      } else {
        neuron.activation = 0;
        
        // Naspäť na originál
        const originalColor = this.originalColors.get(neuron.id);
        if (originalColor) {
          neuron.color.lerp(originalColor, 0.1);
        }
      }
    });
  }

  private pulseNetwork(elapsed: number): void {
    const pulseFrequency = 1.5;
    
    this.neurons.forEach(neuron => {
      // Mierné variácie pre rôzne neuróny
      const phase = neuron.position.x * 0.1 + neuron.position.y * 0.1;
      const localPulse = (Math.sin(elapsed * pulseFrequency * Math.PI + phase) + 1) / 2;
      neuron.activation = localPulse;
      
      // Pulzujúce farby - striedaj medzi ružovou a jasnou fialovou
      const colorPhase = (Math.sin(elapsed * pulseFrequency * Math.PI * 0.5) + 1) / 2;
      const pulseColor = new THREE.Color('#FF6B9D').lerp(new THREE.Color('#B565FF'), colorPhase);
      
      neuron.color.copy(pulseColor).multiplyScalar(0.5 + localPulse * 0.5);
    });
  }

  private randomWalker(elapsed: number): void {
    const walkSpeed = 3;
    const step = Math.floor(elapsed * walkSpeed);
    
    // Fade všetkých
    this.neurons.forEach(n => {
      n.activation *= 0.85;
      
      // Fade farby naspäť
      const originalColor = this.originalColors.get(n.id);
      if (originalColor) {
        n.color.lerp(originalColor, 0.15);
      }
    });
    
    // Aktivuj náhodný neurón každý step
    if (step < this.neurons.length * 3) {
      const randomIndex = Math.floor(Math.sin(step * 12.9898) * 43758.5453) % this.neurons.length;
      const neuron = this.neurons[Math.abs(randomIndex)];
      if (neuron) {
        neuron.activation = 1;
        
        // Jasná oranžová farba pre aktívny
        this.setNeuronColor(neuron, '#FFB74A', 1);
        
        // Aktivuj susedné neuróny s postupným farebným prechodom
        this.neurons.forEach(other => {
          const distance = neuron.position.distanceTo(other.position);
          if (distance < 4 && distance > 0) {
            const intensity = 1 - (distance / 4);
            other.activation = Math.max(other.activation, intensity * 0.7);
            
            // Jasná zelená pre susedov
            this.setNeuronColor(other, '#00FF88', intensity * 0.6);
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
