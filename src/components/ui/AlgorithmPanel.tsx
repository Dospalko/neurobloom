import { useState } from 'react';
import { ALGORITHMS, AlgorithmType } from '../../algorithms/types';

interface AlgorithmPanelProps {
  onRunAlgorithm: (algorithmId: AlgorithmType) => void;
  onStopAlgorithm: () => void;
  isRunning: boolean;
  currentAlgorithm: AlgorithmType | null;
}

const AlgorithmPanel = ({ 
  onRunAlgorithm, 
  onStopAlgorithm, 
  isRunning,
  currentAlgorithm 
}: AlgorithmPanelProps) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType | null>(null);

  const handleAlgorithmClick = (algorithmId: AlgorithmType) => {
    setSelectedAlgorithm(algorithmId);
  };

  const handleRun = () => {
    if (selectedAlgorithm) {
      onRunAlgorithm(selectedAlgorithm);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-mono">Visual algorithms</p>
          <h3 className="text-md font-bold text-white">Preset motions</h3>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <button
              onClick={onStopAlgorithm}
              className="px-3 py-1.5 rounded-lg border border-red-500/60 text-xs text-red-200 hover:bg-red-500/10 transition"
            >
              Stop
            </button>
          )}
          <button
            onClick={handleRun}
            disabled={!selectedAlgorithm || isRunning}
            className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-semibold text-white hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Run
          </button>
        </div>
      </div>

      {/* Zoznam algoritmov */}
      <div className="space-y-2">
        {ALGORITHMS.map((algorithm) => {
          const isActive = currentAlgorithm === algorithm.id;
          const isSelected = selectedAlgorithm === algorithm.id;

          return (
            <button
              key={algorithm.id}
              onClick={() => handleAlgorithmClick(algorithm.id)}
              disabled={isRunning}
              className={`w-full flex items-center gap-3 rounded-xl px-1 py-1 border transition text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'border-white/80 bg-white/25'
                  : isSelected
                  ? 'border-white/80 bg-white/25'
                  : 'border-white/10 bg-white/5 hover:border-white/25'
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold" style={{ backgroundColor: `${algorithm.color}1f` }}>
                <span style={{ color: algorithm.color }}>FX</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{algorithm.name}</div>
              </div>
              <div className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`} style={{ backgroundColor: algorithm.color }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AlgorithmPanel;
