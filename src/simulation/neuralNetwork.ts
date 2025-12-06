import * as THREE from "three";
import { Neuron, Connection } from "./types";

// Vytvorenie nového neurónu
export const createNeuron = (
  position: THREE.Vector3,
  type: "input" | "hidden" | "output" = "hidden"
): Neuron => {
  // Výraznejšie, žiarivejšie farby!
  const colorMap = {
    input: new THREE.Color("#00D4FF"),    // Jasnejšia modrá
    hidden: new THREE.Color("#B565FF"),   // Jasnejšia fialová
    output: new THREE.Color("#00FF88"),   // Jasnejšia zelená
  };

  return {
    id: `neuron_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    position: position.clone(),
    activation: 0,
    age: 0,
    connections: [],
    learningRate: 0.1,
    health: 1.0,
    trainingCount: 0,
    type,
    color: colorMap[type],
  };
};

// Vytvorenie spojenia medzi neurónmi
export const createConnection = (fromId: string, toId: string): Connection => {
  return {
    id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    from: fromId,
    to: toId,
    weight: (Math.random() - 0.5) * 2, // -1 až 1
    strength: 0.5,
    age: 0,
    lastActivation: 0,
  };
};

// Sigmoid aktivačná funkcia
export const sigmoid = (x: number): number => {
  return 1 / (1 + Math.exp(-x));
};

// ReLU aktivačná funkcia
export const relu = (x: number): number => {
  return Math.max(0, x);
};

// Aktivácia neurónu na základe vstupov
export const activateNeuron = (
  neuron: Neuron,
  inputs: Map<string, number>
): number => {
  let sum = 0;
  neuron.connections.forEach((conn) => {
    const inputValue = inputs.get(conn.from) || 0;
    sum += inputValue * conn.weight;
  });
  return sigmoid(sum);
};

// Hebbian Learning: Neurons that fire together, wire together
// Oja's Rule (stabilized Hebbian): dw = alpha * (y * (x - y * w))
export const updateConnectionWeight = (
  connection: Connection,
  sourceActivation: number,
  targetActivation: number,
  learningRate: number
): number => {
  // Standard Hebbian: delta = rate * source * target
  // But this grows indefinitely. We use a simplified Oja's rule or decay.
  
  // Let's use simple Hebbian with decay to keep it interesting but bounded
  const hebbianTerm = sourceActivation * targetActivation;
  const decayTerm = 0.05 * connection.weight * targetActivation * targetActivation; // Active decay
  
  const delta = learningRate * (hebbianTerm - decayTerm);
  
  const newWeight = connection.weight + delta;
  return Math.max(-1, Math.min(1, newWeight)); // clamp
};

// Výpočet zdravia neurónu na základe veku a tréningu
export const calculateNeuronHealth = (neuron: Neuron): number => {
  const ageDecay = Math.max(0, 1 - neuron.age / 300); // Degradácia po 5 minútach
  const overtrainingPenalty = Math.max(0, 1 - neuron.trainingCount / 10000);
  return Math.min(1, (ageDecay + overtrainingPenalty) / 2 * neuron.health);
};

// Detekcia overtrain/undertrain
export const detectTrainingIssues = (
  trainingAccuracy: number,
  validationAccuracy: number,
  epochs: number
): { isOverfitted: boolean; isUnderfitted: boolean } => {
  const gap = trainingAccuracy - validationAccuracy;
  return {
    isOverfitted: gap > 0.15 && epochs > 100, // Veľký rozdiel = overfitting
    isUnderfitted: trainingAccuracy < 0.7 && epochs > 50, // Nízka presnosť = underfitting
  };
};

// Náhodná pozícia v sfére
export const randomSpherePosition = (radius: number): THREE.Vector3 => {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
};
