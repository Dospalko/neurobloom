import React, { useState, useCallback } from 'react';
import { ParticleCanvas } from '../components/particles/ParticleCanvas';
import { HandTracker } from '../components/particles/HandTracker';
import { Controls } from '../components/particles/Controls';
import { VoiceTracker } from '../components/particles/VoiceTracker';
import { InteractionMode, InteractionModeSelector } from '../components/particles/InteractionModeSelector';

export type ParticleTemplate = 'hearts' | 'flowers' | 'saturn' | 'buddha' | 'fireworks';

const ParticleSystemPage: React.FC = () => {
  const [tension, setTension] = useState(0);
  const [template, setTemplate] = useState<ParticleTemplate>('hearts');
  const [color, setColor] = useState('#ff0000');
  const [handPos, setHandPos] = useState({ x: 0.5, y: 0.5 });
  const [handVelocity, setHandVelocity] = useState(0);
  const [triggerCommand, setTriggerCommand] = useState<string | null>(null);
  
  // Stav režimu interakcie
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('camera');

  const handleTensionChange = useCallback((newTension: number) => {
    // Aktualizovať napätie iba ak je povolená kamera
    if (interactionMode === 'camera') {
        setTension(newTension);
    }
  }, [interactionMode]);

  const handleHandMove = useCallback((x: number, y: number, velocity: number) => {
      // Aktualizovať pozície iba ak je povolená kamera
      if (interactionMode === 'camera') {
          setHandPos({ x, y });
          setHandVelocity(velocity);
      } else {
          // Ak je vypnuté, len zrušiť rýchlosť pre zabránenie interakciám, ale ponechať pozíciu alebo nechať ustáliť
          setHandVelocity(0);
      }
  }, [interactionMode]);

  const handleVoiceCommand = useCallback((command: string) => {
    // Spracovať hlas iba ak je povolený
    if (interactionMode === 'voice') {
        setTriggerCommand(command);
        
        // Vyčistiť spúšťač po krátkom oneskorení, aby sa mohol znova spustiť
        setTimeout(() => setTriggerCommand(null), 1500);
          
        if (command === 'reset') {
            setTension(0);
        }
    }
  }, [interactionMode]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Vrstva 3D plátna */}
      <div className="absolute inset-0 z-0">
        <ParticleCanvas 
            tension={tension} 
            template={template} 
            color={color} 
            handPos={handPos}
            handVelocity={handVelocity}
            trigger={triggerCommand}
        />
      </div>

      {/* Vrstva UI */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Pomocný text pre režim */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-white/30 text-xs font-mono tracking-widest uppercase pointer-events-none">
             {interactionMode === 'camera' && "Ovládanie gestami rúk"}
             {interactionMode === 'voice' && "Ovládanie hlasom"}
        </div>
        
        {/* Vizuálny kurzor (viditeľný iba ak je aktívna interakcia kamerou) */}
        {(interactionMode === 'camera') && (
            <div 
                className="absolute w-6 h-6 rounded-full border-2 border-red-500 bg-red-500/30 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
                style={{ 
                    left: `${handPos.x * 100}%`, 
                    top: `${handPos.y * 100}%`,
                    opacity: handVelocity > 0.1 ? 1 : 0.5 // Brighten when moving
                }}
            />
        )}

        <div className="w-full h-full relative">
          
          {/* Výber režimu - Hore v strede */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
             <InteractionModeSelector mode={interactionMode} onChange={setInteractionMode} />
          </div>

          {/* Sledovanie hlasu - Vpravo hore (viditeľné ak je aktívne) */}
          {(interactionMode === 'voice') && (
               <VoiceTracker onCommand={handleVoiceCommand} />
          )}

          {/* Sledovanie rúk (vždy viditeľné pre náhľad, ale interaktívna logika je obmedzená) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 pointer-events-auto transition-opacity shadow-lg shadow-black/50">
             <HandTracker onTensionChange={handleTensionChange} onHandMove={handleHandMove} />
             {/* Prekrytie indikujúce iba zobrazenie, keď je vypnuté */}
             {interactionMode === 'voice' && (
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                     <span className="text-xs text-white/50 font-medium">Sledovanie vypnuté</span>
                 </div>
             )}
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
            <a href="/" className="hover:text-white transition-colors">← Späť</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleSystemPage;
