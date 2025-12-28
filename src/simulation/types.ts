import * as THREE from "three";

export interface Neuron {
  id: string;
  position: THREE.Vector3;
  activation: number; // 0-1
  age: number; // v sekundách
  connections: Connection[];
  learningRate: number;
  health: number; // 0-1 (1 = zdravý, 0 = degradovaný)
  trainingCount: number;
  type: "input" | "hidden" | "output";
  color: THREE.Color;
}

export interface Connection {
  id: string;
  from: string; // ID neurónu
  to: string; // ID neurónu
  weight: number; // -1 až 1
  strength: number; // 0-1 (viditeľnosť)
  age: number;
  lastActivation: number;
}

export interface TrainingData {
  input: number[];
  expectedOutput: number[];
}

export interface NetworkStats {
  totalNeurons: number;
  totalConnections: number;
  averageActivation: number;
  averageHealth: number;
  trainingEpochs: number;
  accuracy: number;
  isOverfitted: boolean;
  isUnderfitted: boolean;
}

export type SimulationMode = "idle" | "training" | "inference" | "degrading";
