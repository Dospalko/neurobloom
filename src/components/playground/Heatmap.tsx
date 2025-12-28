import React, { useEffect, useRef } from 'react';
import { NeuralNetwork, Point } from '../../algorithms/NeuralNetwork';
import { FeatureId } from '../../pages/PlaygroundPage';

interface HeatmapProps {
  network: NeuralNetwork;
  data: Point[];
  width?: number;
  height?: number;
  epoch: number;
  activeFeatures: Record<FeatureId, boolean>;
  featureFuncs: { id: FeatureId; func: (x: number, y: number) => number }[];
}

const Heatmap: React.FC<HeatmapProps> = ({ network, data, width = 300, height = 300, epoch, activeFeatures, featureFuncs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Vykresliť hranicu rozhodovania (Teplotná mapa)
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;
    
    // Škála: -6 až 6
    const scaleX = 12 / width;
    const scaleY = 12 / height;

    // Filtrovať aktívne funkcie raz
    const activeFuncs = featureFuncs.filter(f => activeFeatures[f.id]).map(f => f.func);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Mapovať pixel na súradnicu
        const cx = (x * scaleX) - 6;
        const cy = -((y * scaleY) - 6); // Invertovať Y pre štandardný kartézsky systém

        // Transform input based on features
        const inputs = activeFuncs.length > 0 
            ? activeFuncs.map(fn => fn(cx, cy))
            : [cx, cy]; // Záloha ak nie sú žiadne vlastnosti (nemalo by sa stať pri správnej logike)

        const output = network.forward(inputs);

        const idx = (y * width + x) * 4;
        
        // Mapa farieb: -1 (Oranžová) do 1 (Modrá)
        const val = Math.tanh(output); 
        
        let r, g, b;
        if (val < 0) {
            // Oranžová: #ff9900 (Jasná oranžová)
            // Biela: 255, 255, 255
            const intensity = Math.abs(val);
            // Interpolovať medzi Bielou a Jasnou oranžovou
            // Vlastne, zvyčajne je lepšie ísť z neutrálneho pozadia do farby
            // Ale TF Playground ide z Bielej (pri 0) do Farby (pri +/-1)
            // Spravme to výraznejšie.
            
            // Cieľ: 255, 153, 0 (#ff9900)
            r = 255;
            g = 255 + (153 - 255) * intensity;
            b = 255 + (0 - 255) * intensity;
        } else {
            // Modrá: #00ccff (Neon Azúrová)
            // Cieľ: 0, 204, 255 (#00ccff)
            const intensity = Math.abs(val);
            r = 255 + (0 - 255) * intensity;
            g = 255 + (204 - 255) * intensity;
            b = 255;
        }
        
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        // Zvýšiť alfu pre lepšiu viditeľnosť
        pixels[idx + 3] = 180 + Math.abs(val) * 75; 
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // 2. Vykresliť dátové body
    data.forEach(p => {
        const px = (p.x + 6) / scaleX;
        const py = (-p.y + 6) / scaleY;

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        // Obrys pre kontrast
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        // Výplň
        ctx.fillStyle = p.label > 0 ? '#00ccff' : '#ff9900';
        ctx.fill();
    });

  }, [network, data, width, height, epoch, activeFeatures, featureFuncs]); 

  return (
    <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="w-full h-full"
    />
  );
};

export default Heatmap;
