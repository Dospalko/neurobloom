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
  
  // Interaction Mode State
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('both');

  const handleTensionChange = useCallback((newTension: number) => {
    // Only update tension if camera is allowed
    if (interactionMode === 'camera' || interactionMode === 'both') {
        setTension(newTension);
    }
  }, [interactionMode]);

  const handleHandMove = useCallback((x: number, y: number, velocity: number) => {
      // Only update positions if camera is allowed
      if (interactionMode === 'camera' || interactionMode === 'both') {
          setHandPos({ x, y });
          setHandVelocity(velocity);
      } else {
          // If disabled, just kill velocity to prevent interactions, but keep position or let it settle
          setHandVelocity(0);
      }
  }, [interactionMode]);

  const handleVoiceCommand = useCallback((command: string) => {
    // Only process voice if voice is allowed
    if (interactionMode === 'voice' || interactionMode === 'both') {
        setTriggerCommand(command);
        
        // Clear trigger after a short delay so it can be re-triggered
        setTimeout(() => setTriggerCommand(null), 1500);
          
        if (command === 'reset') {
            setTension(0);
        }
    }
  }, [interactionMode]);

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
            trigger={triggerCommand}
        />
      </div>

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* Helper text for mode */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-white/30 text-xs font-mono tracking-widest uppercase pointer-events-none">
             {interactionMode === 'camera' && "Control with Hand Gestures"}
             {interactionMode === 'voice' && "Control with Voice Commands"}
             {interactionMode === 'both' && "Control with Hand or Voice"}
        </div>
        
        {/* Visual Cursor (Only visible if camera interaction is active) */}
        {(interactionMode === 'camera' || interactionMode === 'both') && (
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
          
          {/* Mode Selector - Top Center */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
             <InteractionModeSelector mode={interactionMode} onChange={setInteractionMode} />
          </div>

          {/* Voice Tracker - Top Right (Visible if active) */}
          {(interactionMode === 'voice' || interactionMode === 'both') && (
               <VoiceTracker onCommand={handleVoiceCommand} />
          )}

          {/* Hand Tracker (Always visible for feed, but interactive logic is gated) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 pointer-events-auto transition-opacity shadow-lg shadow-black/50">
             <HandTracker onTensionChange={handleTensionChange} onHandMove={handleHandMove} />
             {/* Overlay to indicate it's just a view when disabled */}
             {interactionMode === 'voice' && (
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                     <span className="text-xs text-white/50 font-medium">Tracking Disabled</span>
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
            <a href="/" className="hover:text-white transition-colors">← Back</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticleSystemPage;
