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
import { AlgorithmRunner } from "../algorithms/algorithmRunner";
import { AlgorithmType } from "../algorithms/types";

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
  const algorithmRunner = useRef<AlgorithmRunner | null>(null);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<AlgorithmType | null>(null);

  // Pridanie nového neurónu
  const addNeuron = useCallback(
    (type: "input" | "hidden" | "output" = "hidden") => {
      const position = randomSpherePosition(3 + neurons.length * 0.05);
      const newNeuron = createNeuron(position, type);

      // Automaticky prepoj s náhodnými existujúcimi neurónmi
      const connections: Connection[] = [];
      const numConnections = Math.min(2, neurons.length); // Menej spojení = rýchlejšie

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

  // Bulk pridanie neurónov (rýchle)
  const addMultipleNeurons = useCallback(
    (count: number, type: "input" | "hidden" | "output" = "hidden") => {
      const newNeurons: Neuron[] = [];
      
      for (let i = 0; i < count; i++) {
        const position = randomSpherePosition(3 + (neurons.length + i) * 0.05);
        const neuron = createNeuron(position, type);
        
        // Prepoj s existujúcimi neurónmi
        const connections: Connection[] = [];
        const allNeurons = [...neurons, ...newNeurons];
        const numConnections = Math.min(2, allNeurons.length);
        
        for (let j = 0; j < numConnections; j++) {
          const randomNeuron = allNeurons[Math.floor(Math.random() * allNeurons.length)];
          if (randomNeuron) {
            connections.push(createConnection(randomNeuron.id, neuron.id));
          }
        }
        
        neuron.connections = connections;
        newNeurons.push(neuron);
      }
      
      setNeurons((prev) => [...prev, ...newNeurons]);
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
        // Optimalizácia - použij batch update
        const updated = prev.map((neuron) => {
          // Simulácia aktivácie
          const inputs = new Map<string, number>();
          
          // Len ak má spojenia
          if (neuron.connections.length === 0) {
            return {
              ...neuron,
              activation: Math.random() * 0.5, // Náhodná aktivácia pre vstupné
              trainingCount: neuron.trainingCount + 1,
            };
          }

          neuron.connections.forEach((conn) => {
            const sourceNeuron = prev.find((n) => n.id === conn.from);
            if (sourceNeuron) {
              inputs.set(conn.from, sourceNeuron.activation);
            }
          });

          const newActivation = activateNeuron(neuron, inputs);

          // Update weights - jednoduchšie výpočty
          const updatedConnections = neuron.connections.map((conn) => {
            const error = (Math.random() - 0.5) * 0.1; // Menšia chyba
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
        accuracy: Math.min(0.99, prev.accuracy + 0.002), // Rýchlejší progres
        ...detectTrainingIssues(
          Math.min(0.99, prev.accuracy + 0.002),
          Math.min(0.95, prev.accuracy),
          prev.trainingEpochs + 1
        ),
      }));
    }, 50); // Rýchlejší interval (50ms namiesto 100ms)
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

  // Spustenie algoritmu
  const runAlgorithm = useCallback((algorithmType: AlgorithmType) => {
    if (!algorithmRunner.current) {
      algorithmRunner.current = new AlgorithmRunner(neurons);
    } else {
      algorithmRunner.current.updateNeurons(neurons);
    }
    
    algorithmRunner.current.start(algorithmType);
    setIsAlgorithmRunning(true);
    setCurrentAlgorithm(algorithmType);
    setMode("idle"); // Zastav trénovanie ak beží
    if (trainingInterval.current) {
      clearInterval(trainingInterval.current);
      trainingInterval.current = null;
    }
  }, [neurons]);

  // Zastavenie algoritmu
  const stopAlgorithm = useCallback(() => {
    if (algorithmRunner.current) {
      algorithmRunner.current.stop();
    }
    setIsAlgorithmRunning(false);
    setCurrentAlgorithm(null);
  }, []);

  // Update algoritmov v animation loop
  useEffect(() => {
    if (isAlgorithmRunning && algorithmRunner.current) {
      const intervalId = setInterval(() => {
        algorithmRunner.current?.update();
        // Force re-render
        setNeurons(prev => [...prev]);
      }, 16); // ~60fps

      return () => clearInterval(intervalId);
    }
  }, [isAlgorithmRunning]);

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
    addMultipleNeurons,
    removeNeuron,
    connectNeurons,
    startTraining,
    stopTraining,
    resetNetwork,
    initializeNetwork,
    runAlgorithm,
    stopAlgorithm,
    isAlgorithmRunning,
    currentAlgorithm,
  };
};
