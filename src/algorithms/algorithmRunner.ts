import { Neuron } from '../simulation/types';
import { AlgorithmType } from './types';
import * as THREE from 'three';

export class AlgorithmRunner {
  private neurons: Neuron[];
  private currentAlgorithm: AlgorithmType | null = null;
  private startTime: number = 0;
  private isRunning: boolean = false;

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
  }

  stop() {
    this.isRunning = false;
    this.currentAlgorithm = null;
    // Reset všetkých neurónov
    this.neurons.forEach(neuron => {
      neuron.activation = 0;
    });
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
    const waveWidth = 1.5;
    const currentRadius = elapsed * waveSpeed;

    this.neurons.forEach(neuron => {
      const distance = neuron.position.distanceTo(center);
      const diff = Math.abs(distance - currentRadius);
      
      if (diff < waveWidth) {
        neuron.activation = 1 - (diff / waveWidth);
      } else {
        neuron.activation *= 0.95; // Fade out
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
      } else if (activation >= 1) {
        neuron.activation = Math.max(0, 1 - (activation - 1) * 0.5);
      } else {
        neuron.activation = 0;
      }
    });
  }

  private pulseNetwork(elapsed: number): void {
    const pulseFrequency = 2;
    const pulse = (Math.sin(elapsed * pulseFrequency * Math.PI) + 1) / 2;
    
    this.neurons.forEach(neuron => {
      // Mierné variácie pre rôzne neuróny
      const phase = neuron.position.x * 0.1 + neuron.position.y * 0.1;
      const localPulse = (Math.sin(elapsed * pulseFrequency * Math.PI + phase) + 1) / 2;
      neuron.activation = localPulse;
    });
  }

  private randomWalker(elapsed: number): void {
    const walkSpeed = 2;
    const step = Math.floor(elapsed * walkSpeed);
    
    // Reset všetkých
    this.neurons.forEach(n => n.activation *= 0.9);
    
    // Aktivuj náhodný neurón každý step
    if (step < this.neurons.length && this.neurons[step % this.neurons.length]) {
      const randomIndex = Math.floor(Math.sin(step * 12.9898) * 43758.5453) % this.neurons.length;
      const neuron = this.neurons[Math.abs(randomIndex)];
      if (neuron) {
        neuron.activation = 1;
        
        // Aktivuj susedné neuróny
        this.neurons.forEach(other => {
          const distance = neuron.position.distanceTo(other.position);
          if (distance < 3 && distance > 0) {
            other.activation = Math.max(other.activation, 0.5);
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
