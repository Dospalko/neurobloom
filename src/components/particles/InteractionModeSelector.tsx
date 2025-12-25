import React from 'react';

export type InteractionMode = 'camera' | 'voice';

interface InteractionModeSelectorProps {
  mode: InteractionMode;
  onChange: (mode: InteractionMode) => void;
}

export const InteractionModeSelector: React.FC<InteractionModeSelectorProps> = ({ mode, onChange }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
      <button
        onClick={() => onChange('camera')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          mode === 'camera' 
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        📷 Kamera
      </button>
      
      <div className="w-px h-4 bg-white/10" />
      
      <button
        onClick={() => onChange('voice')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          mode === 'voice' 
            ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
      >
        🎙️ Hlas
      </button>
    </div>
  );
};
