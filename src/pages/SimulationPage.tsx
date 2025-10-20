import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NeuralNetworkScene from "../components/three/NeuralNetworkScene";
import ControlPanel from "../components/ui/ControlPanel";
import StatsDisplay from "../components/ui/StatsDisplay";
import AlgorithmPanel from "../components/ui/AlgorithmPanel";
import { useNeuralNetwork } from "../hooks/useNeuralNetwork";

const SimulationPage = () => {
  const navigate = useNavigate();
  
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
  } = useNeuralNetwork();

  useEffect(() => {
    if (neurons.length === 0) {
      initializeNetwork();
    }
  }, [neurons.length, initializeNetwork]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-neuro-dark">
      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="group relative px-4 py-2 glass-effect border border-white/20 rounded-lg hover:bg-white/10 hover:border-white/40 transition-all flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300" />
              <svg className="relative w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="relative text-gray-400 group-hover:text-white text-sm">Back</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">NeuroBloom</h1>
              <p className="text-[10px] text-gray-500 mt-0.5 font-mono">INTERACTIVE_SIM_v1.0</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide font-mono">RUNTIME</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-neuro-green rounded-full animate-pulse" />
              <span className="text-xs font-mono text-white">ACTIVE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Scene - zaberie 3 stĺpce */}
          <div className="lg:col-span-3 h-[600px] glass-effect rounded-2xl overflow-hidden">
            <NeuralNetworkScene neurons={neurons} />
          </div>

          {/* Sidebar - 1 stĺpec */}
          <div className="space-y-6">
            <AlgorithmPanel
              onRunAlgorithm={runAlgorithm}
              onStopAlgorithm={stopAlgorithm}
              isRunning={isAlgorithmRunning}
              currentAlgorithm={currentAlgorithm}
            />
            
            <ControlPanel
              mode={mode}
              onAddNeuron={addNeuron}
              onAddMultiple={addMultipleNeurons}
              onStartTraining={startTraining}
              onStopTraining={stopTraining}
              onReset={resetNetwork}
              disabled={isAlgorithmRunning}
            />
            
            <StatsDisplay stats={stats} />
          </div>
        </div>

        {/* Info sekcie dole */}
        <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-neuro-blue/10 to-transparent border border-neuro-blue/30 hover:border-neuro-blue/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-neuro-blue/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500" />
            <div className="relative space-y-2">
              <div className="inline-block px-2 py-0.5 bg-neuro-blue/20 rounded text-[10px] font-mono text-neuro-blue border border-neuro-blue/40">ALGORITHMS</div>
              <h3 className="text-sm font-bold text-white">5 vizualizácií</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Spusti predprogramované algoritmy a sleduj farebné zmeny neurónov 
                v reálnom čase. Automaticky vytvorí 30+ neurónov.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-neuro-purple/10 to-transparent border border-neuro-purple/30 hover:border-neuro-purple/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-neuro-purple/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500" />
            <div className="relative space-y-2">
              <div className="inline-block px-2 py-0.5 bg-neuro-purple/20 rounded text-[10px] font-mono text-neuro-purple border border-neuro-purple/40">LEARNING</div>
              <h3 className="text-sm font-bold text-white">Adaptívne učenie</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Spusti tréning a sleduj ako sa váhy spojení menia. Sieť sa učí, 
                ale dávaj pozor na overtraining a undertraining!
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-neuro-green/10 to-transparent border border-neuro-green/30 hover:border-neuro-green/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-neuro-green/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500" />
            <div className="relative space-y-2">
              <div className="inline-block px-2 py-0.5 bg-neuro-green/20 rounded text-[10px] font-mono text-neuro-green border border-neuro-green/40">GROWTH</div>
              <h3 className="text-sm font-bold text-white">Organický rast</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pridávaj neuróny manuálne a sleduj ako sa automaticky prepájajú 
                a vytvárajú komplexnú sieť.
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-neuro-orange/10 to-transparent border border-neuro-orange/30 hover:border-neuro-orange/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-neuro-orange/20 rounded-full blur-2xl group-hover:w-32 group-hover:h-32 transition-all duration-500" />
            <div className="relative space-y-2">
              <div className="inline-block px-2 py-0.5 bg-neuro-orange/20 rounded text-[10px] font-mono text-neuro-orange border border-neuro-orange/40">INTERACTIVE</div>
              <h3 className="text-sm font-bold text-white">3D Explorácia</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Rotuj, zoomuj a skúmaj neurónovú sieť z každého uhla. 
                Plne interaktívna Three.js scéna.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 mt-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xs text-gray-500 font-mono">
            <span className="text-white">NeuroBloom</span> · v1.0.0
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
            <span>React</span>
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>Three.js</span>
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimulationPage;
