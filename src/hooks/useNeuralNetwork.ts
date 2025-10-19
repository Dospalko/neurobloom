import { useState, useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  Neuron,
  Connection,
  NetworkStats,
  SimulationMode,
} from "../simulation/types";
import {
  createNeuron,
  createConnection,
  activateNeuron,
  calculateNeuronHealth,
  randomSpherePosition,
  updateConnectionWeight,
  detectTrainingIssues,
} from "../simulation/neuralNetwork";

export const useNeuralNetwork = () => {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [mode, setMode] = useState<SimulationMode>("idle");
  const [stats, setStats] = useState<NetworkStats>({
    totalNeurons: 0,
    totalConnections: 0,
    averageActivation: 0,
    averageHealth: 1,
    trainingEpochs: 0,
    accuracy: 0,
    isOverfitted: false,
    isUnderfitted: false,
  });

  const trainingInterval = useRef<NodeJS.Timeout | null>(null);
  const ageInterval = useRef<NodeJS.Timeout | null>(null);

  // Pridanie nového neurónu
  const addNeuron = useCallback(
    (type: "input" | "hidden" | "output" = "hidden") => {
      const position = randomSpherePosition(3 + neurons.length * 0.1);
      const newNeuron = createNeuron(position, type);

      // Automaticky prepoj s náhodnými existujúcimi neurónmi
      const connections: Connection[] = [];
      const numConnections = Math.min(3, neurons.length);

      for (let i = 0; i < numConnections; i++) {
        const randomNeuron = neurons[Math.floor(Math.random() * neurons.length)];
        if (randomNeuron) {
          connections.push(createConnection(randomNeuron.id, newNeuron.id));
        }
      }

      newNeuron.connections = connections;
      setNeurons((prev) => [...prev, newNeuron]);
    },
    [neurons]
  );

  // Odstránenie neurónu
  const removeNeuron = useCallback((id: string) => {
    setNeurons((prev) => {
      const filtered = prev.filter((n) => n.id !== id);
      // Odstráň všetky spojenia ktoré vedú k/z tohto neurónu
      return filtered.map((n) => ({
        ...n,
        connections: n.connections.filter((c) => c.from !== id && c.to !== id),
      }));
    });
  }, []);

  // Vytvorenie spojenia medzi dvoma neurónmi
  const connectNeurons = useCallback((fromId: string, toId: string) => {
    setNeurons((prev) =>
      prev.map((n) => {
        if (n.id === toId) {
          // Skontroluj či spojenie už existuje
          const exists = n.connections.some((c) => c.from === fromId);
          if (!exists) {
            return {
              ...n,
              connections: [...n.connections, createConnection(fromId, toId)],
            };
          }
        }
        return n;
      })
    );
  }, []);

  // Spustenie trénovania
  const startTraining = useCallback(() => {
    setMode("training");

    if (trainingInterval.current) clearInterval(trainingInterval.current);

    trainingInterval.current = setInterval(() => {
      setNeurons((prev) => {
        const updated = prev.map((neuron) => {
          // Simulácia aktivácie
          const inputs = new Map<string, number>();
          neuron.connections.forEach((conn) => {
            const sourceNeuron = prev.find((n) => n.id === conn.from);
            if (sourceNeuron) {
              inputs.set(conn.from, sourceNeuron.activation);
            }
          });

          const newActivation = activateNeuron(neuron, inputs);

          // Update weights
          const updatedConnections = neuron.connections.map((conn) => {
            const error = Math.random() * 0.2 - 0.1; // Simulovaná chyba
            const newWeight = updateConnectionWeight(
              conn,
              error,
              neuron.learningRate
            );
            return {
              ...conn,
              weight: newWeight,
              strength: Math.abs(newWeight),
              lastActivation: newActivation,
            };
          });

          return {
            ...neuron,
            activation: newActivation,
            trainingCount: neuron.trainingCount + 1,
            connections: updatedConnections,
            health: calculateNeuronHealth({
              ...neuron,
              trainingCount: neuron.trainingCount + 1,
            }),
          };
        });

        return updated;
      });

      setStats((prev) => ({
        ...prev,
        trainingEpochs: prev.trainingEpochs + 1,
        accuracy: Math.min(0.99, prev.accuracy + 0.001),
        ...detectTrainingIssues(
          Math.min(0.99, prev.accuracy + 0.001),
          Math.min(0.95, prev.accuracy),
          prev.trainingEpochs + 1
        ),
      }));
    }, 100);
  }, []);

  // Zastavenie trénovania
  const stopTraining = useCallback(() => {
    setMode("idle");
    if (trainingInterval.current) {
      clearInterval(trainingInterval.current);
      trainingInterval.current = null;
    }
  }, []);

  // Resetovanie siete
  const resetNetwork = useCallback(() => {
    stopTraining();
    setNeurons([]);
    setStats({
      totalNeurons: 0,
      totalConnections: 0,
      averageActivation: 0,
      averageHealth: 1,
      trainingEpochs: 0,
      accuracy: 0,
      isOverfitted: false,
      isUnderfitted: false,
    });
  }, [stopTraining]);

  // Inicializácia so základnými neurónmi
  const initializeNetwork = useCallback(() => {
    const initialPosition = new THREE.Vector3(0, 0, 0);
    const firstNeuron = createNeuron(initialPosition, "input");
    setNeurons([firstNeuron]);
  }, []);

  // Update štatistík
  useEffect(() => {
    if (neurons.length > 0) {
      const totalConnections = neurons.reduce(
        (sum, n) => sum + n.connections.length,
        0
      );
      const avgActivation =
        neurons.reduce((sum, n) => sum + n.activation, 0) / neurons.length;
      const avgHealth =
        neurons.reduce((sum, n) => sum + n.health, 0) / neurons.length;

      setStats((prev) => ({
        ...prev,
        totalNeurons: neurons.length,
        totalConnections,
        averageActivation: avgActivation,
        averageHealth: avgHealth,
      }));
    }
  }, [neurons]);

  // Starnutie neurónov (každú sekundu)
  useEffect(() => {
    if (ageInterval.current) clearInterval(ageInterval.current);

    ageInterval.current = setInterval(() => {
      setNeurons((prev) =>
        prev.map((n) => ({
          ...n,
          age: n.age + 1,
          health: calculateNeuronHealth({ ...n, age: n.age + 1 }),
        }))
      );
    }, 1000);

    return () => {
      if (ageInterval.current) clearInterval(ageInterval.current);
      if (trainingInterval.current) clearInterval(trainingInterval.current);
    };
  }, []);

  return {
    neurons,
    mode,
    stats,
    addNeuron,
    removeNeuron,
    connectNeurons,
    startTraining,
    stopTraining,
    resetNetwork,
    initializeNetwork,
  };
};
