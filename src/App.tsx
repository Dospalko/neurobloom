import { useEffect } from "react";
import NeuralNetworkScene from "./components/three/NeuralNetworkScene";
import ControlPanel from "./components/ui/ControlPanel";
import StatsDisplay from "./components/ui/StatsDisplay";
import { useNeuralNetwork } from "./hooks/useNeuralNetwork";
import "./styles/global.css";

const App = () => {
  const {
    neurons,
    mode,
    stats,
    addNeuron,
    startTraining,
    stopTraining,
    resetNetwork,
    initializeNetwork,
  } = useNeuralNetwork();

  // Inicializuj sieť s prvým neurónom
  useEffect(() => {
    if (neurons.length === 0) {
      initializeNetwork();
    }
  }, [neurons.length, initializeNetwork]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-neuro-blue via-neuro-dark to-black">
      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">NeuroBloom</h1>
            <p className="text-sm text-gray-400 mt-1">Simulácia živej neurónovej siete</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Live Simulation</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-mono text-gray-300">Online</span>
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
            <ControlPanel
              mode={mode}
              onAddNeuron={addNeuron}
              onStartTraining={startTraining}
              onStopTraining={stopTraining}
              onReset={resetNetwork}
              disabled={false}
            />
            
            <StatsDisplay stats={stats} />
          </div>
        </div>

        {/* Info sekcie dole */}
        <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-effect rounded-2xl p-6 space-y-3">
            <div className="text-3xl">🌱</div>
            <h3 className="text-lg font-bold text-neuro-cyan">Organický rast</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Začni s jedným neurónom a sleduj, ako rastie sieť. Každý neurón starne, 
              mení farbu a zdravie sa postupne degraduje.
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-6 space-y-3">
            <div className="text-3xl">🎓</div>
            <h3 className="text-lg font-bold text-neuro-purple">Učenie sa</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Spusti tréning a sleduj ako sa váhy spojení menia. Sieť sa učí, 
              ale dávaj pozor na overtraining a undertraining!
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-6 space-y-3">
            <div className="text-3xl">💀</div>
            <h3 className="text-lg font-bold text-neuro-pink">Starnutie</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Neuróny časom starnú a ich zdravie klesá. Príliš veľa trénovania 
              urýchli degradáciu - ako v živej prírode!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 mt-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          <p>© 2025 NeuroBloom · Experimentálna vizualizácia AI · React + Three.js + TypeScript</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
