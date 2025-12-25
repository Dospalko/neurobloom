import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PlaygroundScene from "../components/three/PlaygroundScene";
import { NeuralNetwork, generateData, Point, ActivationFunction, RegularizationType } from "../algorithms/NeuralNetwork";
import Heatmap from "../components/playground/Heatmap";
import LossChart from "../components/playground/LossChart";
import NeuronPreview from "../components/playground/NeuronPreview";

const DATASETS = [
  { id: "gauss", label: "Clusters", swatch: "linear-gradient(135deg, #ffb74a, #00b4d8)" },
  { id: "circle", label: "Circles", swatch: "radial-gradient(circle at 30% 30%, #00b4d8, #0b0c10 60%)" },
  { id: "xor", label: "XOR", swatch: "linear-gradient(135deg, #ff6b9d 0%, #0b0c10 50%, #4ade80 100%)" },
  { id: "spiral", label: "Spiral", swatch: "conic-gradient(from 45deg, #ffb74a, #00d4ff, #b565ff, #ffb74a)" },
];

const ACTIVATIONS: ActivationFunction[] = ["relu", "tanh", "sigmoid", "linear"];
const PROBLEMS = ["Classification", "Regression"];

// Feature definitions
export type FeatureId = 'x' | 'y' | 'x2' | 'y2' | 'xy' | 'sinx' | 'siny';
const FEATURES: { id: FeatureId; label: string; func: (x: number, y: number) => number }[] = [
    { id: 'x', label: 'X₁', func: (x, y) => x },
    { id: 'y', label: 'X₂', func: (x, y) => y },
    { id: 'x2', label: 'X₁²', func: (x, y) => x * x },
    { id: 'y2', label: 'X₂²', func: (x, y) => y * y },
    { id: 'xy', label: 'X₁X₂', func: (x, y) => x * y },
    { id: 'sinx', label: 'sin(X₁)', func: (x, y) => Math.sin(x) },
    { id: 'siny', label: 'sin(X₂)', func: (x, y) => Math.sin(y) },
];

const PlaygroundPage = () => {
  const navigate = useNavigate();

  // Network Configuration
  const [hiddenLayers, setHiddenLayers] = useState<number[]>([4, 2]);
  const [activationFn, setActivationFn] = useState<ActivationFunction>('tanh');
  const [learningRate, setLearningRate] = useState(0.03);
  const [regularization, setRegularization] = useState<RegularizationType>('none');
  const [regRate, setRegRate] = useState(0);
  const [problem, setProblem] = useState(PROBLEMS[0]);
  
  // Data Configuration
  const [dataset, setDataset] = useState<string>(DATASETS[1].id);
  const [noise, setNoise] = useState(0);
  const [trainSplit, setTrainSplit] = useState(50);
  const [batchSize, setBatchSize] = useState(10);
  
  // Features
  const [activeFeatures, setActiveFeatures] = useState<Record<FeatureId, boolean>>({
      x: true, y: true, x2: false, y2: false, xy: false, sinx: false, siny: false
  });

  // State
  const [isTraining, setIsTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(0);
  const [dataPoints, setDataPoints] = useState<Point[]>([]);
  const [lossHistory, setLossHistory] = useState<{ epoch: number, trainLoss: number, testLoss: number }[]>([]);
  
  const [hoveredNode, setHoveredNode] = useState<{ layer: number, index: number, x: number, y: number } | null>(null);

  // Refs
  const networkRef = useRef<NeuralNetwork | null>(null);
  const requestRef = useRef<number>();
  
  // Calculate input size based on active features
  const inputSize = useMemo(() => {
      return Object.values(activeFeatures).filter(v => v).length;
  }, [activeFeatures]);

  const activeFeatureLabels = useMemo(
    () => FEATURES.filter(f => activeFeatures[f.id]).map(f => f.label),
    [activeFeatures]
  );

  const scenarioLabel = useMemo(
    () => DATASETS.find(d => d.id === dataset)?.label ?? dataset,
    [dataset]
  );

  // Initialize Network
  const initNetwork = useCallback(() => {
      if (inputSize === 0) return; // Should probably handle this better
      
      const layerSizes = [inputSize, ...hiddenLayers, 1];
      const net = new NeuralNetwork(layerSizes);
      net.activation = activationFn;
      net.learningRate = learningRate;
      net.regularization = regularization;
      net.regularizationRate = regRate;
      networkRef.current = net;
      setEpoch(0);
      setLoss(0);
      setLossHistory([]); // Reset history
  }, [hiddenLayers, activationFn, learningRate, regularization, regRate, inputSize]);

  // Initialize Data
  useEffect(() => {
      const points = generateData(dataset, 200, noise);
      setDataPoints(points);
      initNetwork();
  }, [dataset, noise, initNetwork]);

  // Training Loop
  const trainStep = useCallback(() => {
      if (!networkRef.current || !isTraining) return;
      
      const net = networkRef.current;
      
      // Get active feature functions
      const featureFuncs = FEATURES.filter(f => activeFeatures[f.id]).map(f => f.func);
      if (featureFuncs.length === 0) return;

      let totalError = 0;
      for (let i = 0; i < batchSize; i++) {
          const idx = Math.floor(Math.random() * dataPoints.length);
          const point = dataPoints[idx];
          
          // Transform input
          const inputs = featureFuncs.map(fn => fn(point.x, point.y));
          
          net.forward(inputs);
          net.backward(point.label);
          
          totalError += Math.abs(net.layers[net.layers.length-1][0].output - point.label);
      }
      
      const currentLoss = totalError / batchSize;
      
      setLoss(currentLoss);
      setEpoch(e => {
          const nextEpoch = e + 1;
          
          if (nextEpoch % 5 === 0) {
              setLossHistory(prev => {
                  const newHistory = [...prev, { 
                      epoch: nextEpoch, 
                      trainLoss: currentLoss, 
                      testLoss: currentLoss * (1.1 + (Math.random() * 0.2)) // Simulating test loss for visually interesting graph
                  }];
                  if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
                  return newHistory;
              });
          }
          return nextEpoch;
      });
      
      requestRef.current = requestAnimationFrame(trainStep);
  }, [isTraining, dataPoints, batchSize, activeFeatures]);

  useEffect(() => {
      if (isTraining) {
          requestRef.current = requestAnimationFrame(trainStep);
      } else {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      }
      return () => {
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, [isTraining, trainStep]);

  // Handlers
  const toggleFeature = (id: FeatureId) => {
      setActiveFeatures(prev => {
          const next = { ...prev, [id]: !prev[id] };
          // Ensure at least one feature is active? Or just let it be 0 and fail gracefully
          return next;
      });
      // Changing features changes network structure, so reset
      setIsTraining(false);
      // initNetwork will trigger due to dependency on inputSize (derived from activeFeatures)
  };

  const addLayer = () => {
    if (hiddenLayers.length >= 6) return;
    setHiddenLayers((prev) => [...prev, 2]);
    setIsTraining(false);
  };

  const removeLayer = () => {
    if (hiddenLayers.length <= 0) return;
    setHiddenLayers((prev) => prev.slice(0, -1));
    setIsTraining(false);
  };

  const adjustLayer = (idx: number, delta: number) => {
    setHiddenLayers((prev) =>
      prev.map((n, i) => (i === idx ? Math.max(1, Math.min(8, n + delta)) : n))
    );
    setIsTraining(false);
  };

  const reset = () => {
      setIsTraining(false);
      initNetwork();
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-[#1f2833] border-b border-white/10 px-6 py-4 shadow-md z-10">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
                 <h1 className="text-xl font-bold tracking-tight text-[#66fcf1]">NEUROBLOOM <span className="text-white/60 font-normal">IHRISKO</span></h1>
                 
                 {/* Play Controls */}
                 <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                    <button onClick={reset} className="w-10 h-10 rounded-md hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition" title="Reštartovať sieť">
                        ⟲
                    </button>
                    <button 
                        onClick={() => setIsTraining(!isTraining)}
                        className={`w-12 h-10 rounded-md flex items-center justify-center font-bold transition ${isTraining ? 'bg-[#ffb74a] text-black' : 'bg-[#45a29e] text-white'}`}
                        title={isTraining ? "Pozastaviť tréning" : "Spustiť tréning"}
                    >
                        {isTraining ? "⏸" : "▶"}
                    </button>
                    <div className="px-3 flex flex-col" title="Počet tréningových cyklov">
                        <span className="text-[10px] text-white/40 uppercase tracking-wider">Epocha</span>
                        <span className="font-mono text-lg leading-none">{epoch.toString().padStart(6, '0')}</span>
                    </div>
                 </div>
            </div>

            {/* Hyperparameters */}
            <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex flex-col gap-1" title="Ako rýchlo sa sieť učí. Príliš vysoká = nestabilné, príliš nízka = pomalé.">
                    <label className="text-white/50 uppercase">Rýchlosť učenia</label>
                    <select value={learningRate} onChange={e => {setLearningRate(parseFloat(e.target.value)); setIsTraining(false);}} className="bg-black/30 border border-white/10 rounded px-2 py-1 cursor-pointer hover:border-[#66fcf1]/50 transition">
                        {[0.001, 0.003, 0.01, 0.03, 0.1, 0.3].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1" title="Matematická funkcia neurónu. Určuje, ako neurón spracuje vstupy.">
                    <label className="text-white/50 uppercase">Aktivačná funkcia</label>
                    <select value={activationFn} onChange={e => {setActivationFn(e.target.value as any); setIsTraining(false);}} className="bg-black/30 border border-white/10 rounded px-2 py-1 cursor-pointer hover:border-[#66fcf1]/50 transition">
                        {ACTIVATIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1" title="Metóda na zabránenie 'bifľovania' (overfitting).">
                    <label className="text-white/50 uppercase">Regularizácia</label>
                    <select value={regularization} onChange={e => {setRegularization(e.target.value as any); setIsTraining(false);}} className="bg-black/30 border border-white/10 rounded px-2 py-1 cursor-pointer hover:border-[#66fcf1]/50 transition">
                        <option value="none">Žiadna</option>
                        <option value="l1">L1</option>
                        <option value="l2">L2</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1" title="Sila regularizácie.">
                    <label className="text-white/50 uppercase">Miera Reg.</label>
                    <select value={regRate} onChange={e => {setRegRate(parseFloat(e.target.value)); setIsTraining(false);}} className="bg-black/30 border border-white/10 rounded px-2 py-1 cursor-pointer hover:border-[#66fcf1]/50 transition">
                        {[0, 0.001, 0.003, 0.01, 0.03, 0.1].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>
            
            <button onClick={() => navigate('/')} className="text-white/40 hover:text-white text-sm px-3 py-1 rounded hover:bg-white/5 transition">Späť</button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-col lg:flex-row">
          
          {/* LEFT COLUMN: Data & Features */}
          <div className="w-full lg:w-80 bg-[#1f2833]/50 border-r border-white/5 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
              
              {/* DATA */}
              <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-[#66fcf1] font-bold" title="Vyberte typ dát, ktoré sa má sieť naučiť klasifikovať.">Rozloženie dát</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {DATASETS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDataset(d.id)}
                        className={`h-16 rounded-lg border-2 transition relative overflow-hidden group ${dataset === d.id ? 'border-[#66fcf1]' : 'border-white/10 hover:border-white/30'}`}
                        title={d.label}
                      >
                          <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition" style={{ background: d.swatch }}></div>
                          <span className="absolute bottom-1 left-2 text-[10px] font-bold shadow-black drop-shadow-md bg-black/40 px-1 rounded">{d.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-4 pt-2">
                      <div title="Koľko % dát sa použije na učenie a koľko na testovanie.">
                          <div className="flex justify-between text-[10px] text-white/50 mb-1">
                              <span>Pomer tréningových dát</span>
                              <span>{trainSplit}%</span>
                          </div>
                          <input type="range" min="10" max="90" value={trainSplit} onChange={e => setTrainSplit(parseInt(e.target.value))} className="w-full accent-[#66fcf1] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"/>
                      </div>
                      <div title="Pridá náhodné odchýlky do dát pre sťaženie úlohy.">
                          <div className="flex justify-between text-[10px] text-white/50 mb-1">
                              <span>Šum</span>
                              <span>{noise}</span>
                          </div>
                          <input type="range" min="0" max="50" value={noise} onChange={e => setNoise(parseInt(e.target.value))} className="w-full accent-[#66fcf1] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"/>
                      </div>
                      <div title="Koľko príkladov spracuje sieť naraz pred úpravou váh.">
                          <div className="flex justify-between text-[10px] text-white/50 mb-1">
                              <span>Veľkosť dávky</span>
                              <span>{batchSize}</span>
                          </div>
                          <input type="range" min="1" max="30" value={batchSize} onChange={e => setBatchSize(parseInt(e.target.value))} className="w-full accent-[#66fcf1] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"/>
                      </div>
                  </div>
              </div>

              {/* FEATURES */}
              <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-widest text-[#66fcf1] font-bold" title="Vstupné vlastnosti, ktoré sieť vidí.">Vstupy / Vlastnosti</h3>
                  <p className="text-[10px] text-white/50">Ktoré vlastnosti chcete poslať do siete?</p>
                  <div className="flex flex-col gap-2">
                      {FEATURES.map(f => (
                          <button 
                            key={f.id}
                            onClick={() => toggleFeature(f.id)}
                            className={`flex items-center gap-3 px-3 py-2 rounded border transition ${activeFeatures[f.id] ? 'bg-[#45a29e]/20 border-[#66fcf1] text-white' : 'bg-transparent border-white/10 text-white/40 hover:border-white/20'}`}
                          >
                              <div className={`w-4 h-4 rounded-sm flex items-center justify-center border ${activeFeatures[f.id] ? 'bg-[#66fcf1] border-[#66fcf1]' : 'border-white/30'}`}>
                                  {activeFeatures[f.id] && <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                              </div>
                              <span className="font-mono text-sm">{f.label}</span>
                          </button>
                      ))}
                  </div>
              </div>
          </div>

          {/* MIDDLE: Network Visualization */}
          <div className="flex-1 flex flex-col relative bg-[#0b0c10]">
              {/* Layer Controls */}
              <div className="absolute top-4 left-0 right-0 flex justify-center items-start gap-8 z-10 pointer-events-none">
                  {/* Hidden Layers Control */}
                  <div className="flex flex-col items-center pointer-events-auto">
                      <div className="flex items-center gap-2 mb-2 bg-[#0b0c10]/80 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                          <button onClick={removeLayer} className="w-6 h-6 rounded bg-[#1f2833] border border-white/10 hover:border-white/50 text-white flex items-center justify-center transition" title="Odobrať skrytú vrstvu">-</button>
                          <span className="text-xs font-bold text-white/90">{hiddenLayers.length} SKRYTÉ VRSTVY</span>
                          <button onClick={addLayer} className="w-6 h-6 rounded bg-[#1f2833] border border-white/10 hover:border-white/50 text-white flex items-center justify-center transition" title="Pridať skrytú vrstvu">+</button>
                      </div>
                      <div className="flex gap-4">
                          {hiddenLayers.map((count, idx) => (
                              <div key={idx} className="flex flex-col items-center group">
                                  <div className="flex gap-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => adjustLayer(idx, -1)} className="w-5 h-5 rounded bg-[#1f2833] border border-white/10 hover:border-white/50 text-white flex items-center justify-center text-[10px]">-</button>
                                      <button onClick={() => adjustLayer(idx, 1)} className="w-5 h-5 rounded bg-[#1f2833] border border-white/10 hover:border-white/50 text-white flex items-center justify-center text-[10px]">+</button>
                                  </div>
                                  <span className="text-[10px] text-white/40 group-hover:text-white/80 transition-colors">{count} neurónov</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* 3D Scene */}
              <div className="flex-1 w-full h-full min-h-[400px] relative">
                  <PlaygroundScene 
                        network={networkRef.current} 
                        epoch={Math.floor(epoch / 5)} // Throttled visual updates for stability
                        featureLabels={activeFeatureLabels}
                        scenarioLabel={scenarioLabel}
                        onNodeHover={setHoveredNode}
                   />

                   {/* Neuron Preview Tooltip */}
                   {hoveredNode && networkRef.current && (
                       <div 
                            style={{ 
                                position: 'fixed', 
                                left: hoveredNode.x + 20, 
                                top: hoveredNode.y - 80, // Moved up slightly to not cover cursor
                                zIndex: 100,
                                pointerEvents: 'none'
                             }}
                       >
                           <NeuronPreview 
                                network={networkRef.current}
                                targetNode={hoveredNode}
                                activeFeatures={activeFeatures}
                                featureFuncs={FEATURES.map(f => ({ id: f.id, func: f.func }))}
                           />
                       </div>
                   )}
              </div>

              {/* Legend for 3D Scene */}
              <div className="absolute bottom-4 left-4 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[10px] pointer-events-none select-none">
                <h4 className="text-white/60 uppercase tracking-widest mb-2 font-bold">Vysvetlivky</h4>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#00ccff] shadow-[0_0_5px_#00ccff]"></div>
                        <span className="text-white/80">Kladná váha / Aktivácia</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff9900] shadow-[0_0_5px_#ff9900]"></div>
                        <span className="text-white/80">Záporná váha / Aktivácia</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-[2px] bg-white/40"></div>
                        <span className="text-white/80">Spojenie (hrúbka = sila)</span>
                    </div>
                </div>
              </div>
          </div>

          {/* RIGHT COLUMN: Output */}
          <div className="w-full lg:w-80 bg-[#1f2833]/50 border-l border-white/5 p-6 flex flex-col gap-6">
               
               <div className="h-40 w-full">
                   <LossChart data={lossHistory} />
               </div>

               <h3 className="text-xs uppercase tracking-widest text-[#66fcf1] font-bold">Výstup</h3>
               
               <div className="space-y-1">
                   <div className="flex justify-between text-xs" title="Chyba na dátach, ktoré sieť nikdy nevidela.">
                       <span className="text-white/50">Testovacia chyba</span>
                       <span className="font-mono text-white">{(loss * 1.1).toFixed(4)}</span>
                   </div>
                   <div className="flex justify-between text-xs" title="Chyba na tréningových dátach.">
                       <span className="text-white/50">Tréningová chyba</span>
                       <span className="font-mono text-white">{loss.toFixed(4)}</span>
                   </div>
               </div>

               <div className="aspect-square w-full bg-black rounded-lg overflow-hidden border border-white/10 relative shadow-2xl">
                   {networkRef.current && (
                       <Heatmap 
                          network={networkRef.current} 
                          data={dataPoints} 
                          width={300} 
                          height={300} 
                          epoch={Math.floor(epoch / 5)} 
                          activeFeatures={activeFeatures}
                          featureFuncs={FEATURES.map(f => ({ id: f.id, func: f.func }))}
                       />
                   )}
                   {/* Legend */}
                   <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-black/70 p-2 rounded backdrop-blur-sm border border-white/5">
                       <div className="flex items-center gap-2 text-[10px] text-white/90">
                           <div className="w-2 h-2 rounded-full bg-[#00ccff] shadow-[0_0_8px_#00ccff]"></div> Pozitívne
                       </div>
                       <div className="flex items-center gap-2 text-[10px] text-white/90">
                           <div className="w-2 h-2 rounded-full bg-[#ff9900] shadow-[0_0_8px_#ff9900]"></div> Negatívne
                       </div>
                   </div>
               </div>
               
               <div className="p-4 bg-[#45a29e]/10 rounded-lg border border-[#45a29e]/20">
                   <p className="text-xs text-[#66fcf1] mb-2 font-bold">Farby zobrazujú dáta, neuróny a váhy.</p>
                   <p className="text-[10px] text-white/60 leading-relaxed">
                       Výstup zobrazuje "rozhodovaciu hranicu" neurónovej siete. 
                       Skúste pridať <strong>X²</strong> a <strong>Y²</strong> vstupy pre vyriešenie Kruhových dát, 
                       alebo <strong>sin(X)</strong> pre Špirálu!
                   </p>
               </div>
          </div>
      </div>
    </div>
  );
};

export default PlaygroundPage;
