import { useState, useEffect } from 'react';
import { ALGORITHMS, AlgorithmType } from '../../algorithms/types';

interface AlgorithmInfoOverlayProps {
  currentAlgorithm: AlgorithmType | null;
  isRunning: boolean;
  progress: number;
  neuronsCreated: number;
  totalNeurons: number;
}

const AlgorithmInfoOverlay = ({ 
  currentAlgorithm, 
  isRunning, 
  progress,
  neuronsCreated,
  totalNeurons 
}: AlgorithmInfoOverlayProps) => {
  const [phase, setPhase] = useState<'preparing' | 'creating' | 'running' | 'complete'>('preparing');
  
  useEffect(() => {
    if (!isRunning) {
      setPhase('preparing');
      return;
    }
    
    if (neuronsCreated < totalNeurons) {
      setPhase('creating');
    } else if (progress < 0.95) {
      setPhase('running');
    } else {
      setPhase('complete');
    }
  }, [isRunning, neuronsCreated, totalNeurons, progress]);

  if (!currentAlgorithm || !isRunning) return null;

  const algorithm = ALGORITHMS.find(a => a.id === currentAlgorithm);
  if (!algorithm) return null;

  const phaseMessages = {
    preparing: 'Príprava simulácie...',
    creating: `Vytváranie neurónov: ${neuronsCreated}/${totalNeurons}`,
    running: 'Algoritmus beží - sleduj farebné zmeny!',
    complete: 'Algoritmus dokončený!'
  };

  const phaseColors = {
    preparing: 'text-neuro-blue',
    creating: 'text-neuro-purple',
    running: 'text-neuro-green',
    complete: 'text-neuro-orange'
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className="glass-effect rounded-2xl border border-white/20 p-6 min-w-[400px] max-w-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: algorithm.color }}
            />
            <h3 className="text-lg font-bold text-white">{algorithm.name}</h3>
          </div>
          <div className="px-3 py-1 bg-white/10 rounded-lg">
            <span className="text-xs font-mono text-white">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-2 bg-black/40 rounded-full overflow-hidden mb-4">
          <div 
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
            style={{ 
              width: `${progress * 100}%`,
              backgroundColor: algorithm.color,
              boxShadow: `0 0 20px ${algorithm.color}`
            }}
          />
        </div>

        {/* Status */}
        <div className="space-y-3">
          <div className={`text-sm font-semibold ${phaseColors[phase]}`}>
            {phaseMessages[phase]}
          </div>
          
          {phase === 'creating' && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex gap-1">
                <div className="w-1 h-3 bg-neuro-blue animate-pulse" />
                <div className="w-1 h-3 bg-neuro-purple animate-pulse delay-75" />
                <div className="w-1 h-3 bg-neuro-green animate-pulse delay-150" />
              </div>
              <span>Vytváranie sférickej formácie s automatickými spojeniami...</span>
            </div>
          )}

          {phase === 'running' && (
            <div className="text-xs text-gray-300 leading-relaxed">
              <span className="font-semibold" style={{ color: algorithm.color }}>
                ► Ako to funguje:
              </span>
              <br />
              {algorithm.description}
            </div>
          )}

          {phase === 'complete' && (
            <div className="flex items-center gap-2 text-xs text-neuro-green">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Algoritmus úspešne dokončený! Môžeš ho zastaviť alebo spustiť nový.</span>
            </div>
          )}
        </div>

        {/* Legend - len počas behu */}
        {phase === 'running' && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-[10px] text-gray-500 font-mono mb-2">LEGENDA FARIEB:</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neuro-blue" />
                <span className="text-[10px] text-gray-400">Input</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neuro-purple" />
                <span className="text-[10px] text-gray-400">Hidden</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neuro-green" />
                <span className="text-[10px] text-gray-400">Output</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgorithmInfoOverlay;
