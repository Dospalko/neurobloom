import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NeuralNetworkScene from "../components/three/NeuralNetworkScene";
import ControlPanel from "../components/ui/ControlPanel";
import StatsDisplay from "../components/ui/StatsDisplay";
import AlgorithmPanel from "../components/ui/AlgorithmPanel";
import AlgorithmInfoOverlay from "../components/ui/AlgorithmInfoOverlay";
import NeuronReferencePanel from "../components/ui/NeuronReferencePanel";
import { useNeuralNetwork } from "../hooks/useNeuralNetwork";

const SimulationPage = () => {
  const navigate = useNavigate();
  const [selectedNeuronId, setSelectedNeuronId] = useState<string | null>(null);
  
  const {
    neurons,
    mode,
    stats,
    addNeuron,
    addMultipleNeurons,
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
  } = useNeuralNetwork();

  useEffect(() => {
    if (neurons.length === 0) {
      initializeNetwork();
    }
  }, [neurons.length, initializeNetwork]);

  useEffect(() => {
    if (selectedNeuronId && !neurons.find((n) => n.id === selectedNeuronId)) {
      setSelectedNeuronId(null);
    }
  }, [neurons, selectedNeuronId]);


  return (
    <div className="relative min-h-screen overflow-hidden bg-neuro-dark">
      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="px-3 py-2 rounded-lg border border-white/10 text-xs text-gray-300 hover:text-white hover:border-white/30 transition"
              >
                ← Späť
              </button>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-mono">NeuroBloom</p>
                <h1 className="text-2xl font-bold text-white">Simulation workspace</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="tag border-white/20 text-white bg-white/5">
                <span className={`w-2 h-2 rounded-full ${mode === "training" ? "bg-neuro-green animate-pulse" : "bg-gray-500"} inline-block`} />
                {mode === "training" ? (currentPattern || "Training") : isAlgorithmRunning ? "Algorithm" : "Idle"}
              </div>
              <div className="tag border-white/15 text-gray-300 bg-white/5">v1.0</div>
            </div>
          </div>

          {/* Quick summary bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Neurons", value: stats.totalNeurons },
              { label: "Connections", value: stats.totalConnections },
              { label: "Avg Activation", value: `${(stats.averageActivation * 100).toFixed(1)}%` },
              { label: "Health", value: `${(stats.averageHealth * 100).toFixed(1)}%` },
            ].map((item) => (
              <div key={item.label} className="panel-subtle px-3 py-3 border-white/10">
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-mono">{item.label}</p>
                <p className="text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Scene - zaberie 3 stĺpce */}
          <div className="lg:col-span-3 h-[620px] panel overflow-hidden relative">
            <NeuralNetworkScene
              neurons={neurons}
              highlightedNeuronId={activationFocus?.id ?? null}
              selectedNeuronId={selectedNeuronId}
              onNeuronClick={(id) => setSelectedNeuronId(id)}
              currentProcessingNeuron={currentProcessingNeuron}
            />
            
            {/* Algorithm Info Overlay */}
            <AlgorithmInfoOverlay
              currentAlgorithm={currentAlgorithm}
              isRunning={isAlgorithmRunning}
              progress={algorithmProgress}
              neuronsCreated={neuronsCreated}
              totalNeurons={40}
            />
          </div>

          {/* Sidebar - 1 stĺpec */}
          <div className="space-y-4">
            <div className="panel p-4 space-y-4">
              <AlgorithmPanel
                onRunAlgorithm={runAlgorithm}
                onStopAlgorithm={stopAlgorithm}
                isRunning={isAlgorithmRunning}
                currentAlgorithm={currentAlgorithm}
              />
            </div>

            <div className="panel p-4 space-y-4">
              <ControlPanel
                mode={mode}
                onAddNeuron={addNeuron}
                onAddMultiple={addMultipleNeurons}
                onStartTraining={startTraining}
                onStopTraining={stopTraining}
                onReset={resetNetwork}
                disabled={isAlgorithmRunning}
              />

              <NeuronReferencePanel
                neurons={neurons}
                liveFocus={activationFocus}
                selectedNeuronId={selectedNeuronId}
                onSelectNeuron={setSelectedNeuronId}
              />
            </div>

            <div className="panel p-4">
              <StatsDisplay stats={stats} />
            </div>
          </div>
        </div>

        {/* Simple footer */}
        <div className="max-w-7xl mx-auto mt-10 flex flex-wrap items-center justify-between text-[11px] text-gray-500">
          <span>NeuroBloom • Clean layout v1.1</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-neuro-blue rounded-full" />
            React • Three.js • TypeScript
          </span>
        </div>
      </main>
    </div>
  );
};

export default SimulationPage;
