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
  const [showInfo, setShowInfo] = useState(false);

  const handleAlgorithmClick = (algorithmId: AlgorithmType) => {
    setSelectedAlgorithm(algorithmId);
    setShowInfo(true);
  };

  const handleRun = () => {
    if (selectedAlgorithm) {
      onRunAlgorithm(selectedAlgorithm);
      setShowInfo(false);
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-5 space-y-4 border border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Algorithms</h3>
        {isRunning && (
          <button
            onClick={onStopAlgorithm}
            className="px-3 py-1 bg-red-500/20 border border-red-500 rounded-lg text-xs text-white hover:bg-red-500/30 transition-all"
          >
            Stop
          </button>
        )}
      </div>

      {/* Algorithm grid */}
      <div className="grid grid-cols-1 gap-2">
        {ALGORITHMS.map((algorithm) => {
          const isActive = currentAlgorithm === algorithm.id;
          const isSelected = selectedAlgorithm === algorithm.id;

          return (
            <button
              key={algorithm.id}
              onClick={() => handleAlgorithmClick(algorithm.id)}
              disabled={isRunning}
              className={`group relative p-3 rounded-lg border transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                isActive
                  ? 'bg-white/10 border-white/40'
                  : isSelected
                  ? 'bg-white/5 border-white/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Color indicator */}
                <div
                  className={`w-2 h-2 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                  style={{ backgroundColor: algorithm.color }}
                />
                
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">
                    {algorithm.name}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {algorithm.duration}s duration
                  </div>
                </div>

                {isActive && (
                  <div className="flex gap-0.5">
                    <div className="w-1 h-3 bg-white/60 animate-pulse" />
                    <div className="w-1 h-3 bg-white/60 animate-pulse delay-75" />
                    <div className="w-1 h-3 bg-white/60 animate-pulse delay-150" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info panel */}
      {showInfo && selectedAlgorithm && (
        <div className="relative overflow-hidden bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-xl p-4 space-y-3">
          <div
            className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30"
            style={{ backgroundColor: ALGORITHMS.find(a => a.id === selectedAlgorithm)?.color }}
          />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-bold text-white">
                {ALGORITHMS.find(a => a.id === selectedAlgorithm)?.name}
              </h4>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              {ALGORITHMS.find(a => a.id === selectedAlgorithm)?.description}
            </p>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="group relative w-full px-4 py-2.5 bg-white/10 border-2 border-white/30 rounded-lg font-semibold text-white text-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:border-white/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
              <div className="relative flex items-center gap-2">
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent" />
                <span>Run Algorithm</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
        <span className="text-gray-400">Visualization</span>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-white font-mono">{isRunning ? 'Running' : 'Idle'}</span>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmPanel;
