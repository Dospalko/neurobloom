import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ParticleTemplate } from '../../pages/ParticleSystemPage';

interface ParticleCanvasProps {
  tension: number;
  template: ParticleTemplate;
  color: string;
  handPos: { x: number, y: number };
  handVelocity: number;
}

const ParticleSystem: React.FC<ParticleCanvasProps> = ({ tension, template, color, handPos, handVelocity }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000; 

  // Physics state
  const physicsState = useMemo(() => ({
      velocities: new Float32Array(count * 3),
      currentPositions: new Float32Array(count * 3)
  }), [count]);

  // Generate target positions based on template
  const { targetPositions } = useMemo(() => {
    const targetPositions = new Float32Array(count * 3);
    
    // Helper to set position
    const setPos = (i: number, x: number, y: number, z: number) => {
      targetPositions[i * 3] = x;
      targetPositions[i * 3 + 1] = y;
      targetPositions[i * 3 + 2] = z;
    };

    for (let i = 0; i < count; i++) {
        let x = 0, y = 0, z = 0;
        
        if (template === 'hearts') {
            const t = Math.random() * Math.PI * 2;
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            z = (Math.random() - 0.5) * 10;
            x *= (0.5 + Math.random() * 0.5) * 0.2;
            y *= (0.5 + Math.random() * 0.5) * 0.2;
            z *= 0.2;
        } else if (template === 'flowers') {
            const k = 4; 
            const theta = Math.random() * Math.PI * 2;
            const r = Math.cos(k * theta) * 5 + (Math.random() * 2);
            x = r * Math.cos(theta);
            y = r * Math.sin(theta);
            z = (Math.random() - 0.5) * 5;
        } else if (template === 'saturn') {
            if (i < count * 0.3) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = 3;
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
            } else {
                const theta = Math.random() * Math.PI * 2;
                const r = 5 + Math.random() * 3;
                x = r * Math.cos(theta);
                z = r * Math.sin(theta);
                y = (Math.random() - 0.5) * 0.5;
                const tilt = Math.PI / 6;
                const yt = y * Math.cos(tilt) - z * Math.sin(tilt);
                const zt = y * Math.sin(tilt) + z * Math.cos(tilt);
                y = yt;
                z = zt;
            }
        } else if (template === 'buddha') {
            const r = Math.random();
            if (r < 0.3) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const rad = 1.5;
                x = rad * Math.sin(phi) * Math.cos(theta);
                y = rad * Math.sin(phi) * Math.sin(theta) + 3.5;
                z = rad * Math.cos(phi);
            } else if (r < 0.7) {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const rad = 2.5;
                x = rad * Math.sin(phi) * Math.cos(theta);
                y = rad * Math.sin(phi) * Math.sin(theta);
                z = rad * Math.cos(phi);
            } else {
                const theta = Math.random() * Math.PI * 2;
                const rad = 3.5;
                x = rad * Math.cos(theta) * Math.sqrt(Math.random());
                z = rad * Math.sin(theta) * Math.sqrt(Math.random());
                y = -2 + (Math.random() - 0.5);
            }
        } else if (template === 'fireworks') {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = Math.random() * 10;
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
        }
        setPos(i, x, y, z);
    }
    return { targetPositions };
  }, [template]);

  // Reset physics when template changes
  useEffect(() => {
      // Initialize current positions to target positions to avoid flying in from 0,0,0
      for(let i=0; i<count*3; i++) {
          physicsState.currentPositions[i] = targetPositions[i];
          physicsState.velocities[i] = 0;
      }
  }, [targetPositions, physicsState]);

  // Smooth velocity state
  const smoothedVelocity = useRef(0);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positionsAttribute = pointsRef.current.geometry.attributes.position;
    
    // Hand target in scene space
    const handTargetX = (handPos.x - 0.5) * 20;
    const handTargetY = -(handPos.y - 0.5) * 15;
    
    // Scale target based on tension
    const targetScale = 1.5 - (tension * 1.3);
    
    // Smooth out velocity input
    smoothedVelocity.current = THREE.MathUtils.lerp(smoothedVelocity.current, handVelocity, 0.1);
    
    // Velocity/Explosion factor
    const explosionForce = Math.min(smoothedVelocity.current * 3.0, 8.0); 

    // Physics Constants
    const springStrength = 0.05; // How fast they return to shape
    const damping = 0.90; // Friction (0-1)
    const noiseStrength = 0.02;

    for (let i = 0; i < count; i++) {
        const idx = i * 3;
        
        // 1. Calculate Target Position for this particle
        let tx = targetPositions[idx] * targetScale;
        let ty = targetPositions[idx + 1] * targetScale;
        let tz = targetPositions[idx + 2] * targetScale;

        // Apply global hand offset to target
        tx += handTargetX * 0.5;
        ty += handTargetY * 0.5;

        // 2. Calculate Forces
        const cx = physicsState.currentPositions[idx];
        const cy = physicsState.currentPositions[idx + 1];
        const cz = physicsState.currentPositions[idx + 2];

        // Spring force towards target
        let fx = (tx - cx) * springStrength;
        let fy = (ty - cy) * springStrength;
        let fz = (tz - cz) * springStrength;

        // Explosion Force (Push away from center relative to hand)
        // If explosion is high, add a massive force outwards from the shape center
        if (explosionForce > 0.5) {
            // Direction from center of shape (which is roughly handTargetX, handTargetY)
            // Or just use the particle's local position relative to shape center
            const localX = cx - handTargetX * 0.5;
            const localY = cy - handTargetY * 0.5;
            const localZ = cz;
            
            const distSq = localX*localX + localY*localY + localZ*localZ + 0.1;
            const dist = Math.sqrt(distSq);
            
            // Force is stronger closer to center? Or uniform?
            // Let's make it uniform push
            const push = explosionForce * 0.2 * (Math.random() + 0.5);
            
            fx += (localX / dist) * push;
            fy += (localY / dist) * push;
            fz += (localZ / dist) * push;
        }

        // Noise / Jitter
        if (tension > 0.8) {
             fx += (Math.random() - 0.5) * 0.1;
             fy += (Math.random() - 0.5) * 0.1;
             fz += (Math.random() - 0.5) * 0.1;
        }
        
        // Add gentle ambient noise
        fx += (Math.random() - 0.5) * noiseStrength;
        fy += (Math.random() - 0.5) * noiseStrength;
        fz += (Math.random() - 0.5) * noiseStrength;

        // 3. Update Velocity
        physicsState.velocities[idx] += fx;
        physicsState.velocities[idx + 1] += fy;
        physicsState.velocities[idx + 2] += fz;

        // 4. Apply Damping
        physicsState.velocities[idx] *= damping;
        physicsState.velocities[idx + 1] *= damping;
        physicsState.velocities[idx + 2] *= damping;

        // 5. Update Position
        physicsState.currentPositions[idx] += physicsState.velocities[idx];
        physicsState.currentPositions[idx + 1] += physicsState.velocities[idx + 1];
        physicsState.currentPositions[idx + 2] += physicsState.velocities[idx + 2];

        // 6. Write to Buffer
        positionsAttribute.setXYZ(
            i, 
            physicsState.currentPositions[idx], 
            physicsState.currentPositions[idx + 1], 
            physicsState.currentPositions[idx + 2]
        );
    }
    
    positionsAttribute.needsUpdate = true;
    
    // Rotate entire system slowly
    pointsRef.current.rotation.y += 0.002;
    // Tilt based on hand Y (smoothly)
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, (handPos.y - 0.5) * 0.5, 0.1);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={physicsState.currentPositions} // Initial render
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        color={color}
        size={0.15}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const ParticleCanvas: React.FC<ParticleCanvasProps> = (props) => {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.5} />
      <ParticleSystem {...props} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};
