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

    // 1. Draw Decision Boundary (Heatmap)
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;
    
    // Scale: -6 to 6
    const scaleX = 12 / width;
    const scaleY = 12 / height;

    // Filter active functions once
    const activeFuncs = featureFuncs.filter(f => activeFeatures[f.id]).map(f => f.func);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Map pixel to coordinate
        const cx = (x * scaleX) - 6;
        const cy = -((y * scaleY) - 6); // Invert Y for standard cartesian

        // Transform input based on features
        const inputs = activeFuncs.length > 0 
            ? activeFuncs.map(fn => fn(cx, cy))
            : [cx, cy]; // Fallback if no features (shouldn't happen if logic is correct)

        const output = network.forward(inputs);

        const idx = (y * width + x) * 4;
        
        // Color map: -1 (Orange) to 1 (Blue)
        const val = Math.tanh(output); 
        
        let r, g, b;
        if (val < 0) {
            // Orange: #ff9900 (Bright Orange)
            // White: 255, 255, 255
            const intensity = Math.abs(val);
            // Interpolate between White and Bright Orange
            // Actually, usually it's better to go from a neutral background to the color
            // But TF Playground goes from White (at 0) to Color (at +/-1)
            // Let's make it punchier.
            
            // Target: 255, 153, 0 (#ff9900)
            r = 255;
            g = 255 + (153 - 255) * intensity;
            b = 255 + (0 - 255) * intensity;
        } else {
            // Blue: #00ccff (Neon Cyan)
            // Target: 0, 204, 255 (#00ccff)
            const intensity = Math.abs(val);
            r = 255 + (0 - 255) * intensity;
            g = 255 + (204 - 255) * intensity;
            b = 255;
        }
        
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        // Increase alpha for better visibility
        pixels[idx + 3] = 180 + Math.abs(val) * 75; 
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // 2. Draw Data Points
    data.forEach(p => {
        const px = (p.x + 6) / scaleX;
        const py = (-p.y + 6) / scaleY;

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        // Stroke for contrast
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        // Fill
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
