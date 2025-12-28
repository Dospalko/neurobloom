import React, { useEffect, useRef } from 'react';
import { NeuralNetwork } from '../../algorithms/NeuralNetwork';
import { FeatureId } from '../../pages/PlaygroundPage';

interface NeuronPreviewProps {
  network: NeuralNetwork;
  targetNode: { layer: number; index: number };
  width?: number;
  height?: number;
  activeFeatures: Record<FeatureId, boolean>;
  featureFuncs: { id: FeatureId; func: (x: number, y: number) => number }[];
}

const NeuronPreview: React.FC<NeuronPreviewProps> = ({ network, targetNode, width = 60, height = 60, activeFeatures, featureFuncs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Vykresliť hranicu rozhodovania (Teplotná mapa) pre konkrétny neurón
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;
    
    const scaleX = 12 / width;
    const scaleY = 12 / height;
    const activeFuncs = featureFuncs.filter(f => activeFeatures[f.id]).map(f => f.func);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cx = (x * scaleX) - 6;
        const cy = -((y * scaleY) - 6);

        const inputs = activeFuncs.length > 0 
            ? activeFuncs.map(fn => fn(cx, cy))
            : [cx, cy];

        // Spustiť forward pass na aktualizáciu stavu
        network.forward(inputs);
        
        // Získať výstup konkrétneho neurónu
        // Bezpečnostná kontrola
        let val = 0;
        if (network.layers[targetNode.layer] && network.layers[targetNode.layer][targetNode.index]) {
             // Použiť výstup priamo. Možno je to pred-aktivácia alebo po-aktivácia v závislosti od implementácie.
             // Zvyčajne pre vizualizáciu chceme po-aktiváciu.
             // Keďže sme zavolali forward(), vlastnosť .output je aktualizovaná.
             // Poznámka: forward() vracia finálny výstup, ale aktualizuje všetky uzly ako vedľajší efekt.
             val = network.layers[targetNode.layer][targetNode.index].output;
             
             // Ak toto nie je výstupná vrstva, aplikovať tanh vizualizáciu?
             // Vlastne, node.output je UŽ aktivovaný v metóde forward() v NeuralNetwork.ts:
             // node.output = this.applyActivation(sum);
             // Takže 'val' je už v rozsahu [-1, 1] (približne, ak tanh)
        }

        const idx = (y * width + x) * 4;
        
        // Mapa farieb: -1 (Oranžová) do 1 (Modrá)
        // Rozsah môže vyžadovať orezanie ak sa používa ReLU atď, ale predpokladajme Tanh pre vizuálne pekné výsledky
        // alebo orezať pre robustnosť.
        const clampedVal = Math.max(-1, Math.min(1, val));
        
        let r, g, b;
        if (clampedVal < 0) {
            const intensity = Math.abs(clampedVal);
            r = 255;
            g = 255 + (153 - 255) * intensity;
            b = 255 + (0 - 255) * intensity;
        } else {
            const intensity = Math.abs(clampedVal);
            r = 255 + (0 - 255) * intensity;
            g = 255 + (204 - 255) * intensity;
            b = 255;
        }
        
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255; // Plná nepriehľadnosť
      }
    }
    ctx.putImageData(imageData, 0, 0);

  }, [network, targetNode, width, height, activeFeatures, featureFuncs]); 

  return (
    <div className="flex flex-col items-center bg-black/80 p-2 rounded border border-white/20 shadow-xl backdrop-blur-md">
        <span className="text-[10px] text-white/50 mb-1 uppercase tracking-wider">
            {targetNode.layer === 0 ? "Vstup" : targetNode.layer === network.layers.length -1 ? "Výstup" : `Vrstva ${targetNode.layer}`} - N{targetNode.index + 1}
        </span>
        <canvas 
            ref={canvasRef} 
            width={width} 
            height={height} 
            className="w-[60px] h-[60px] rounded border border-white/10"
        />
    </div>
  );
};

export default NeuronPreview;
