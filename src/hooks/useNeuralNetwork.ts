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
import { AlgorithmType, ALGORITHMS } from "../algorithms/types";

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
  const [algorithmProgress, setAlgorithmProgress] = useState(0);
  const [neuronsCreated, setNeuronsCreated] = useState(0);
  const algorithmStartTime = useRef<number>(0);

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

  // Spustenie algoritmu s postupným pridávaním neurónov
  const runAlgorithm = useCallback((algorithmType: AlgorithmType) => {
    // Zastav trénovanie ak beží
    setMode("idle");
    if (trainingInterval.current) {
      clearInterval(trainingInterval.current);
      trainingInterval.current = null;
    }
    
    setIsAlgorithmRunning(true);
    setCurrentAlgorithm(algorithmType);
    setAlgorithmProgress(0);
    setNeuronsCreated(0);
    algorithmStartTime.current = Date.now();
    
    // Vytvor neuróny ak ich je málo (menej ako 40)
    const minNeurons = 40;
    if (neurons.length < minNeurons) {
      const neuronsToAdd = minNeurons - neurons.length;
      const newNeurons: Neuron[] = [];
      
      // POSTUPNÉ pridávanie neurónov s animáciou
      let addedCount = 0;
      const addNeuronInterval = setInterval(() => {
        if (addedCount >= neuronsToAdd) {
          clearInterval(addNeuronInterval);
          
          // Teraz spusti algoritmus
          setTimeout(() => {
            const updatedNeurons = [...neurons, ...newNeurons];
            if (!algorithmRunner.current) {
              algorithmRunner.current = new AlgorithmRunner(updatedNeurons);
            } else {
              algorithmRunner.current.updateNeurons(updatedNeurons);
            }
            
            algorithmRunner.current.start(algorithmType);
            setNeuronsCreated(minNeurons);
          }, 100);
          return;
        }
        
        const i = addedCount;
        const phi = Math.acos(-1 + (2 * (neurons.length + i)) / minNeurons);
        const theta = Math.sqrt(minNeurons * Math.PI) * phi;
        
        const radius = 5 + (i * 0.1);
        const position = new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        );
        
        const type: "input" | "hidden" | "output" = 
          i < 5 ? "input" : 
          i > neuronsToAdd - 5 ? "output" : 
          "hidden";
        
        const neuron = createNeuron(position, type);
        
        // Prepoj s niekoľkými najbližšími neurónmi
        const allNeurons = [...neurons, ...newNeurons];
        const connections: Connection[] = [];
        
        if (allNeurons.length > 0) {
          // Nájdi 3 najbližších neurónov
          const distances = allNeurons.map(n => ({
            neuron: n,
            distance: n.position.distanceTo(position)
          }));
          distances.sort((a, b) => a.distance - b.distance);
          
          for (let j = 0; j < Math.min(3, distances.length); j++) {
            connections.push(createConnection(distances[j].neuron.id, neuron.id));
          }
        }
        
        neuron.connections = connections;
        newNeurons.push(neuron);
        
        setNeurons(prev => [...prev, neuron]);
        setNeuronsCreated(prev => prev + 1);
        addedCount++;
      }, 30); // Pridávaj neuróny rýchlejšie pre kratšiu animáciu
      
    } else {
      // Už máme dosť neurónov
      setNeuronsCreated(neurons.length);
      if (!algorithmRunner.current) {
        algorithmRunner.current = new AlgorithmRunner(neurons);
      } else {
        algorithmRunner.current.updateNeurons(neurons);
      }
      
      algorithmRunner.current.start(algorithmType);
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

  // Update algoritmov v animation loop + progress tracking
  useEffect(() => {
    if (isAlgorithmRunning && algorithmRunner.current) {
      const intervalId = setInterval(() => {
        // IMPORTANT: Update referencií pred každým update
        if (algorithmRunner.current) {
          algorithmRunner.current.updateNeurons(neurons);
          algorithmRunner.current.update();
        }
        
        // Update progress
        if (algorithmStartTime.current > 0 && currentAlgorithm) {
          const algorithm = ALGORITHMS.find(a => a.id === currentAlgorithm);
          if (algorithm) {
            const elapsed = (Date.now() - algorithmStartTime.current) / 1000;
            const progress = Math.min(1, elapsed / algorithm.duration);
            setAlgorithmProgress(progress);
          }
        }
        
        // Force re-render - vytvor nový array aby React videl zmeny
        setNeurons(prev => [...prev]);
      }, 16); // ~60fps

      return () => clearInterval(intervalId);
    }
  }, [isAlgorithmRunning, currentAlgorithm, neurons]);

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
    algorithmProgress,
    neuronsCreated,
  };
};
