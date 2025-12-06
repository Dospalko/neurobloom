import React, { useState, useCallback } from 'react';
import { ParticleCanvas } from '../components/particles/ParticleCanvas';
import { HandTracker } from '../components/particles/HandTracker';
import { Controls } from '../components/particles/Controls';

export type ParticleTemplate = 'hearts' | 'flowers' | 'saturn' | 'buddha' | 'fireworks';

const ParticleSystemPage: React.FC = () => {
  const [tension, setTension] = useState(0);
  const [template, setTemplate] = useState<ParticleTemplate>('hearts');
  const [color, setColor] = useState('#ff0000');
  const [handPos, setHandPos] = useState({ x: 0.5, y: 0.5 });
  const [handVelocity, setHandVelocity] = useState(0);

  const handleTensionChange = useCallback((newTension: number) => {
    setTension(newTension);
  }, []);

  const handleHandMove = useCallback((x: number, y: number, velocity: number) => {
      // Smooth out position updates slightly if needed, but raw is fine for now
      setHandPos({ x, y });
      setHandVelocity(velocity);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <ParticleCanvas 
            tension={tension} 
            template={template} 
            color={color} 
            handPos={handPos}
            handVelocity={handVelocity}
        />
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Visual Cursor */}
        <div 
            className="absolute w-6 h-6 rounded-full border-2 border-red-500 bg-red-500/30 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style={{ 
                left: `${handPos.x * 100}%`, 
                top: `${handPos.y * 100}%`,
                opacity: handVelocity > 0.1 ? 1 : 0.5 // Brighten when moving
            }}
        />

        <div className="w-full h-full relative">
          {/* Hand Tracker (Hidden or Small Preview) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 pointer-events-auto">
             <HandTracker onTensionChange={handleTensionChange} onHandMove={handleHandMove} />
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <Controls 
              currentTemplate={template} 
              onTemplateChange={setTemplate}
              currentColor={color}
              onColorChange={setColor}
            />
          </div>
          
          <div className="absolute top-4 left-4 text-white/50 pointer-events-auto">
            <a href="/" className="hover:text-white transition-colors">← Back</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleSystemPage;
