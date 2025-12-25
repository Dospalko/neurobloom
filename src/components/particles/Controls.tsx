import React from 'react';
import { ParticleTemplate } from '../../pages/ParticleSystemPage';

interface ControlsProps {
  currentTemplate: ParticleTemplate;
  onTemplateChange: (template: ParticleTemplate) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
}

const TEMPLATES: { id: ParticleTemplate; label: string; icon: string }[] = [
  { id: 'hearts', label: 'Srdcia', icon: '♥' },
  { id: 'flowers', label: 'Kvety', icon: '✿' },
  { id: 'saturn', label: 'Saturn', icon: '🪐' },
  { id: 'buddha', label: 'Budha', icon: '🧘' },
  { id: 'fireworks', label: 'Ohňostroj', icon: '🎆' },
];

const COLORS = [
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
  '#ffffff', // White
  '#ff8800', // Orange
];

export const Controls: React.FC<ControlsProps> = ({
  currentTemplate,
  onTemplateChange,
  currentColor,
  onColorChange,
}) => {
  return (
    <div className="flex flex-col gap-4 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10">
      {/* Template Selector */}
      <div className="flex gap-2 justify-center">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onTemplateChange(t.id)}
            className={`
              flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-300
              ${currentTemplate === t.id 
                ? 'bg-white/20 scale-110 border border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                : 'bg-white/5 hover:bg-white/10 hover:scale-105 border border-transparent'}
            `}
            title={t.label}
          >
            <span className="text-2xl mb-1">{t.icon}</span>
            <span className="text-[10px] uppercase tracking-wider font-medium text-white/80">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Color Selector */}
      <div className="flex gap-3 justify-center items-center pt-2 border-t border-white/10">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className={`
              w-8 h-8 rounded-full transition-all duration-300
              ${currentColor === c 
                ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' 
                : 'hover:scale-110 opacity-80 hover:opacity-100'}
            `}
            style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}80` }}
            aria-label={`Select color ${c}`}
          />
        ))}
        
        {/* Custom Color Input */}
        <div className="relative group">
            <input 
                type="color" 
                value={currentColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-8 h-8 opacity-0 absolute inset-0 cursor-pointer"
            />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-500 border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-xs text-black font-bold">+</span>
            </div>
        </div>
      </div>
    </div>
  );
};
