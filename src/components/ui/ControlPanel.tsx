import { useState } from "react";
import { SimulationMode } from "../../simulation/types";

interface ControlPanelProps {
  mode: SimulationMode;
  onAddNeuron: (type: "input" | "hidden" | "output") => void;
  onAddMultiple?: (count: number, type: "input" | "hidden" | "output") => void;
  onStartTraining: () => void;
  onStopTraining: () => void;
  onReset: () => void;
  disabled?: boolean;
}

const ControlPanel = ({
  mode,
  onAddNeuron,
  onAddMultiple,
  onStartTraining,
  onStopTraining,
  onReset,
  disabled = false,
}: ControlPanelProps) => {
  const [bulkCount, setBulkCount] = useState(5);
  const [selectedType, setSelectedType] = useState<"input" | "hidden" | "output">("hidden");

  return (
    <div className="glass-effect rounded-2xl p-5 space-y-5 border border-white/10">
      <h3 className="text-lg font-bold text-white">Ovládací Panel</h3>
      
      {/* Bulk pridávanie neurónov */}
      {onAddMultiple && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Rýchle Pridanie</p>
          
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="50"
              value={bulkCount}
              onChange={(e) => setBulkCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-2 bg-white/5 border border-white/30 rounded-lg text-white focus:outline-none focus:border-neuro-blue focus:bg-white/10"
            />
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="flex-1 px-3 py-2 bg-white/5 border border-white/30 rounded-lg text-white focus:outline-none focus:border-neuro-blue focus:bg-white/10"
            >
              <option value="input" className="bg-neuro-dark">Vstup</option>
              <option value="hidden" className="bg-neuro-dark">Skrytý</option>
              <option value="output" className="bg-neuro-dark">Výstup</option>
            </select>
            
            <button
              onClick={() => onAddMultiple(bulkCount, selectedType)}
              disabled={disabled}
              className="px-4 py-2 bg-neuro-purple/30 border border-neuro-purple rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-neuro-purple/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + {bulkCount}
            </button>
          </div>
        </div>
      )}
      
      {/* Pridávanie neurónov */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Pridať Neurón</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onAddNeuron("input")}
            disabled={disabled}
            className="group relative px-3 py-3 bg-neuro-blue/10 hover:bg-neuro-blue/20 border border-neuro-blue/40 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-neuro-blue/0 group-hover:bg-neuro-blue/10 transition-all duration-300" />
            <div className="relative">
              <div className="text-[10px] text-neuro-blue font-bold mb-1">IN</div>
              <div className="w-4 h-4 border-2 border-neuro-blue rounded-full mx-auto" />
            </div>
          </button>
          
          <button
            onClick={() => onAddNeuron("hidden")}
            disabled={disabled}
            className="group relative px-3 py-3 bg-neuro-purple/10 hover:bg-neuro-purple/20 border border-neuro-purple/40 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-neuro-purple/0 group-hover:bg-neuro-purple/10 transition-all duration-300" />
            <div className="relative">
              <div className="text-[10px] text-neuro-purple font-bold mb-1">HID</div>
              <div className="flex gap-0.5 justify-center">
                <div className="w-2 h-2 border border-neuro-purple rounded-full" />
                <div className="w-2 h-2 border border-neuro-purple rounded-full" />
              </div>
            </div>
          </button>
          
          <button
            onClick={() => onAddNeuron("output")}
            disabled={disabled}
            className="group relative px-3 py-3 bg-neuro-green/10 hover:bg-neuro-green/20 border border-neuro-green/40 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-neuro-green/0 group-hover:bg-neuro-green/10 transition-all duration-300" />
            <div className="relative">
              <div className="text-[10px] text-neuro-green font-bold mb-1">OUT</div>
              <div className="w-4 h-4 border-2 border-neuro-green rounded-sm mx-auto" />
            </div>
          </button>
        </div>
      </div>
      
      {/* Trénovanie */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Tréning</p>
        <div className="grid grid-cols-2 gap-2">
          {mode !== "training" ? (
            <button
              onClick={onStartTraining}
              disabled={disabled}
              className="group relative col-span-2 px-5 py-2.5 bg-neuro-green/20 hover:bg-neuro-green/30 border border-neuro-green rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-neuro-green/0 group-hover:bg-neuro-green/10 transition-all duration-300" />
              <div className="relative flex items-center gap-2">
                <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-neuro-green border-b-4 border-b-transparent" />
                <span className="text-white">Inicializovať Tréning</span>
              </div>
            </button>
          ) : (
            <button
              onClick={onStopTraining}
              className="group relative col-span-2 px-5 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
              <div className="relative flex items-center gap-2">
                <div className="flex gap-0.5">
                  <div className="w-1 h-3 bg-red-500" />
                  <div className="w-1 h-3 bg-red-500" />
                </div>
                <span className="text-white">Zastaviť Tréning</span>
              </div>
            </button>
          )}
        </div>
      </div>
      
      {/* Reset */}
      <div className="space-y-2">
        <button
          onClick={onReset}
          disabled={disabled}
          className="group relative w-full px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg font-semibold text-sm text-gray-400 hover:text-white transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300" />
          <div className="relative flex items-center gap-2">
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v4M8 2C5.8 2 4 3.8 4 6c0 1.5.8 2.8 2 3.5M8 2c2.2 0 4 1.8 4 4 0 1.5-.8 2.8-2 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Reštartovať Sieť</span>
          </div>
        </button>
      </div>
      
      {/* Status indikátor */}
      <div className="pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              mode === "training" ? "bg-neuro-green animate-pulse" :
              mode === "idle" ? "bg-gray-400" :
              mode === "inference" ? "bg-neuro-blue animate-pulse" :
              "bg-red-400 animate-pulse"
            }`} />
            <span className="text-xs font-mono text-white capitalize">{mode}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
