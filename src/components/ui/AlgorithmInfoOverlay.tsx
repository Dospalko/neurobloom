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
    <div className="absolute top-6 left-6 z-20 pointer-events-none max-w-[calc(100%-3rem)]">
      <div className="glass-effect rounded-2xl border border-white/20 p-5 w-full sm:w-[380px] backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: algorithm.color }}
            />
            <h3 className="text-base font-bold text-white">{algorithm.name}</h3>
          </div>
          <div className="px-2.5 py-0.5 bg-white/10 rounded-lg">
            <span className="text-xs font-mono text-white">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-3">
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
        <div className="space-y-2">
          <div className={`text-xs font-semibold ${phaseColors[phase]}`}>
            {phaseMessages[phase]}
          </div>
          
          {phase === 'creating' && (
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-2.5 bg-neuro-blue animate-pulse" />
                <div className="w-0.5 h-2.5 bg-neuro-purple animate-pulse delay-75" />
                <div className="w-0.5 h-2.5 bg-neuro-green animate-pulse delay-150" />
              </div>
              <span>Sférická formácia + spojenia...</span>
            </div>
          )}

          {phase === 'running' && (
            <div className="text-[11px] text-gray-300 leading-relaxed">
              <span className="font-semibold" style={{ color: algorithm.color }}>
                ► Ako to funguje:
              </span>
              <br />
              {algorithm.description}
            </div>
          )}

          {phase === 'complete' && (
            <div className="flex items-center gap-2 text-[11px] text-neuro-green">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                <path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Dokončené! Môžeš zastaviť alebo spustiť nový.</span>
            </div>
          )}
        </div>

        {/* Legend - len počas behu */}
        {phase === 'running' && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-[9px] text-gray-500 font-mono mb-1.5">TYPY NEURÓNOV:</div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-neuro-blue" />
                <span className="text-[9px] text-gray-400">Input</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-neuro-purple" />
                <span className="text-[9px] text-gray-400">Hidden</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-neuro-green" />
                <span className="text-[9px] text-gray-400">Output</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgorithmInfoOverlay;
