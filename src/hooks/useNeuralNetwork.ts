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

export type ActivationFocus = {
  id: string;
  activation: number;
  type: Neuron["type"];
  position: { x: number; y: number; z: number };
  connectionCount: number;
  trainingCount: number;
};

export const useNeuralNetwork = () => {
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [mode, setMode] = useState<SimulationMode>("idle");
  const [activationFocus, setActivationFocus] = useState<ActivationFocus | null>(null);
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
  const [currentProcessingNeuron, setCurrentProcessingNeuron] = useState<Neuron | null>(null);
  const [isStatsLocked, setIsStatsLocked] = useState(false);
  const [algorithmSpeed, setAlgorithmSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
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

  const [currentPattern, setCurrentPattern] = useState<string | null>(null);

  // Spustenie trénovania
  const startTraining = useCallback(() => {
    setMode("training");

    if (trainingInterval.current) clearInterval(trainingInterval.current);
    
    let tick = 0;

    trainingInterval.current = setInterval(() => {
      tick++;
      
      // Generovanie vzorov: Prepnutie vzoru každých 20 tikov (cca 4 sekundy)
      // Vzor A: Aktivovať vstupné neuróny 0, 1, 2
      // Vzor B: Aktivovať vstupné neuróny 3, 4, 5
      const patternPhase = Math.floor(tick / 20) % 2; 
      const patternName = patternPhase === 0 ? "Pattern A (Even Inputs)" : "Pattern B (Odd Inputs)";
      
      // Aktualizovať stav iba pri zmene, aby sa predišlo nadmernému pre-renderovaniu
      setCurrentPattern(prev => prev !== patternName ? patternName : prev);

      setNeurons((prev) => {
        // 1. Vypočítať aktivácie (Forward Pass)
        // Musíme to robiť v topologickom poradí alebo stačí synchrónna aktualizácia?
        // Synchrónna aktualizácia (štýl celulárneho automatu) je pre tento vizuál jednoduchšia.
        
        // Najprv nastaviť vstupy na základe vzoru
        const inputNeurons = prev.filter(n => n.type === 'input');
        const hiddenOutputNeurons = prev.filter(n => n.type !== 'input');
        
        // Aktualizovať vstupy
        const updatedInputs = inputNeurons.map((neuron, idx) => {
             let targetActivation = 0.1; // Šum
             if (patternPhase === 0) {
                 if (idx % 2 === 0) targetActivation = 0.9; // Vzor A: Párne
             } else {
                 if (idx % 2 === 1) targetActivation = 0.9; // Vzor B: Nepárne
             }
             
             return {
                 ...neuron,
                 activation: neuron.activation * 0.8 + targetActivation * 0.2, // Plynulý prechod
                 trainingCount: neuron.trainingCount + 1
             };
        });

        // Aktualizovať Skryté/Výstupné (na základe PREDCHÁDZAJÚCEHO stavu vstupov/ostatných)
        // Používame pole 'prev' pre zdrojové hodnoty na simuláciu súčasného spustenia
        const updatedHiddenOutput = hiddenOutputNeurons.map(neuron => {
             const inputs = new Map<string, number>();
             neuron.connections.forEach(conn => {
                 const source = prev.find(n => n.id === conn.from);
                 if (source) inputs.set(conn.from, source.activation);
             });
             
             const newActivation = activateNeuron(neuron, inputs);
             
             // Hebbovské učenie: Aktualizácia váh na základe korelácie
             const updatedConnections = neuron.connections.map(conn => {
                 const source = prev.find(n => n.id === conn.from);
                 if (!source) return conn;
                 
                 const newWeight = updateConnectionWeight(
                     conn,
                     source.activation,
                     newActivation,
                     neuron.learningRate
                 );
                 
                 return {
                     ...conn,
                     weight: newWeight,
                     strength: Math.abs(newWeight),
                     lastActivation: newActivation
                 };
             });
             
             return {
                 ...neuron,
                 activation: newActivation,
                 connections: updatedConnections,
                 trainingCount: neuron.trainingCount + 1,
                 health: calculateNeuronHealth({
                    ...neuron,
                    trainingCount: neuron.trainingCount + 1
                 })
             };
        });
        
        return [...updatedInputs, ...updatedHiddenOutput];
      });

      setStats((prev) => {
        // Vypočítať abstraktnú "Presnosť" na základe stability/sily siete
        // Vysoká priemerná váha spojenia = vyššia "istota" = vyššia presnosť
        const totalWeight = prev.totalConnections > 0 
            ? neurons.reduce((sum, n) => sum + n.connections.reduce((s, c) => s + Math.abs(c.weight), 0), 0)
            : 0;
        const maxPossibleWeight = prev.totalConnections * 1.0; // Max váha je 1
        
        // Faktor kvality: koľko výstupných neurónov je aktívnych? (Cieľ: ~1-2 aktívnych výstupov je dobré, 0 alebo všetky je zlé)
        const outputs = neurons.filter(n => n.type === 'output');
        const activeOutputs = outputs.filter(n => n.activation > 0.7).length;
        const outputQuality = outputs.length > 0 
            ? (activeOutputs > 0 && activeOutputs < outputs.length / 2 ? 1 : 0.5)
            : 0;

        const rawAccuracy = maxPossibleWeight > 0 ? (totalWeight / maxPossibleWeight) * 0.8 + outputQuality * 0.2 : 0;
        
        // Plynulé zmeny
        const currentAcc = prev.accuracy;
        const newAcc = currentAcc * 0.95 + rawAccuracy * 0.05;

        return {
            ...prev,
            trainingEpochs: prev.trainingEpochs + 1,
            accuracy: Math.min(0.99, newAcc),
            ...detectTrainingIssues(newAcc, newAcc * 0.9, prev.trainingEpochs + 1)
        };
      });
    }, 400); // Pomalší interval (400ms) pre ľahšie pozorovanie
  }, []);

  // Zastavenie trénovania
  const stopTraining = useCallback(() => {
    setMode("idle");
    setCurrentPattern(null);
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
    setIsStatsLocked(true); // Zamknúť štatistiky počas algoritmu
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
    setCurrentProcessingNeuron(null);
    setIsStatsLocked(false); // Odomknúť štatistiky
  }, []);

  // Update algoritmov v animation loop + progress tracking
  useEffect(() => {
    if (isAlgorithmRunning && algorithmRunner.current) {
      // Mapovanie rýchlosti: pomalá=200ms, normálna=120ms, rýchla=50ms
      const intervalMs = algorithmSpeed === 'slow' ? 200 : algorithmSpeed === 'normal' ? 120 : 50;
      
      const intervalId = setInterval(() => {
        // IMPORTANT: Update referencií pred každým update
        if (algorithmRunner.current) {
          algorithmRunner.current.updateNeurons(neurons);
          algorithmRunner.current.update();
          
          // Získať aktuálne spracovávaný neurón z bežca algoritmu
          const currentNeuron = algorithmRunner.current.getCurrentNeuron();
          if (currentNeuron) {
            setCurrentProcessingNeuron(currentNeuron);
          }
        }
        
        // Aktualizovať priebeh
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
      }, intervalMs);

      return () => clearInterval(intervalId);
    }
  }, [isAlgorithmRunning, currentAlgorithm, neurons, algorithmSpeed]);

  // Update štatistík - iba ak algoritmus beží alebo stats nie sú zamknuté
  useEffect(() => {
    if (neurons.length > 0 && (!isStatsLocked || isAlgorithmRunning)) {
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
  }, [neurons, isStatsLocked, isAlgorithmRunning]);

  // Track najaktívnejší neurón pre UI
  useEffect(() => {
    if (neurons.length === 0) {
      setActivationFocus(null);
      return;
    }

    const top = neurons.reduce((best, n) => (n.activation > best.activation ? n : best), neurons[0]);
    const nextFocus: ActivationFocus = {
      id: top.id,
      activation: top.activation,
      type: top.type,
      position: { x: top.position.x, y: top.position.y, z: top.position.z },
      connectionCount: top.connections.length,
      trainingCount: top.trainingCount,
    };

    setActivationFocus((prev) => {
      if (
        prev &&
        prev.id === nextFocus.id &&
        Math.abs(prev.activation - nextFocus.activation) < 0.01 &&
        prev.trainingCount === nextFocus.trainingCount
      ) {
        return prev;
      }
      return nextFocus;
    });
  }, [neurons]);

  // Starnutie neurónov (každú sekundu) - ale nie počas algoritmu
  useEffect(() => {
    if (ageInterval.current) clearInterval(ageInterval.current);

    ageInterval.current = setInterval(() => {
      // Nepridávaj starnutie ak algoritmus beží
      if (!isAlgorithmRunning) {
        setNeurons((prev) =>
          prev.map((n) => ({
            ...n,
            age: n.age + 1,
            health: calculateNeuronHealth({ ...n, age: n.age + 1 }),
          }))
        );
      }
    }, 1000);

    return () => {
      if (ageInterval.current) clearInterval(ageInterval.current);
      if (trainingInterval.current) clearInterval(trainingInterval.current);
    };
  }, [isAlgorithmRunning]);

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
    activationFocus,
    currentPattern,
    currentProcessingNeuron,
    algorithmSpeed,
    setAlgorithmSpeed,
  };
};
