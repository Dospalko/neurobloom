import { SimulationMode } from "../../simulation/types";

interface ControlPanelProps {
  mode: SimulationMode;
  onAddNeuron: (type: "input" | "hidden" | "output") => void;
  onStartTraining: () => void;
  onStopTraining: () => void;
  onReset: () => void;
  disabled?: boolean;
}

const ControlPanel = ({
  mode,
  onAddNeuron,
  onStartTraining,
  onStopTraining,
  onReset,
  disabled = false,
}: ControlPanelProps) => {
  return (
    <div className="glass-effect rounded-2xl p-6 space-y-6">
      <h3 className="text-xl font-bold gradient-text">Ovládanie</h3>
      
      {/* Pridávanie neurónov */}
      <div className="space-y-3">
        <p className="text-sm text-gray-400 uppercase tracking-wide">Pridať neurón</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAddNeuron("input")}
            disabled={disabled}
            className="px-4 py-3 bg-neuro-cyan/20 hover:bg-neuro-cyan/30 border border-neuro-cyan/50 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-xs text-neuro-cyan font-semibold">INPUT</div>
            <div className="text-2xl">📥</div>
          </button>
          
          <button
            onClick={() => onAddNeuron("hidden")}
            disabled={disabled}
            className="px-4 py-3 bg-neuro-purple/20 hover:bg-neuro-purple/30 border border-neuro-purple/50 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-xs text-neuro-purple font-semibold">HIDDEN</div>
            <div className="text-2xl">🧠</div>
          </button>
          
          <button
            onClick={() => onAddNeuron("output")}
            disabled={disabled}
            className="px-4 py-3 bg-neuro-pink/20 hover:bg-neuro-pink/30 border border-neuro-pink/50 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-xs text-neuro-pink font-semibold">OUTPUT</div>
            <div className="text-2xl">📤</div>
          </button>
        </div>
      </div>
      
      {/* Trénovanie */}
      <div className="space-y-3">
        <p className="text-sm text-gray-400 uppercase tracking-wide">Trénovanie</p>
        <div className="grid grid-cols-2 gap-2">
          {mode !== "training" ? (
            <button
              onClick={onStartTraining}
              disabled={disabled}
              className="col-span-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">▶️</span>
              <span>Spustiť tréning</span>
            </button>
          ) : (
            <button
              onClick={onStopTraining}
              className="col-span-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 animate-pulse"
            >
              <span className="text-xl">⏸️</span>
              <span>Zastaviť tréning</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Reset */}
      <div className="space-y-3">
        <button
          onClick={onReset}
          disabled={disabled}
          className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl">🔄</span>
          <span>Resetovať sieť</span>
        </button>
      </div>
      
      {/* Status indikátor */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              mode === "training" ? "bg-green-400 animate-pulse" :
              mode === "idle" ? "bg-gray-400" :
              mode === "inference" ? "bg-blue-400 animate-pulse" :
              "bg-red-400 animate-pulse"
            }`} />
            <span className="text-sm font-mono text-white capitalize">{mode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
