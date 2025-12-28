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
  trigger?: string | null;
}

const ParticleSystem: React.FC<ParticleCanvasProps> = ({ tension, template, color, handPos, handVelocity, trigger }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000; 

  // Stav fyziky
  const physicsState = useMemo(() => ({
      velocities: new Float32Array(count * 3),
      currentPositions: new Float32Array(count * 3)
  }), [count]);

  // Generovať cieľové pozície na základe šablóny
  const { targetPositions } = useMemo(() => {
    const targetPositions = new Float32Array(count * 3);
    
    // Pomocník na nastavenie pozície
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

  // Resetovať fyziku pri zmene šablóny
  useEffect(() => {
      // Inicializovať aktuálne pozície na cieľové pozície, aby sa predišlo príletu z 0,0,0
      for(let i=0; i<count*3; i++) {
          physicsState.currentPositions[i] = targetPositions[i];
          physicsState.velocities[i] = 0;
      }
  }, [targetPositions, physicsState]);

  // Stav plynulej rýchlosti
  const smoothedVelocity = useRef(0);
  
  // Správa stavu spúšťača
  const triggerRef = useRef<{ type: string | null, time: number }>({ type: null, time: 0 });

  useEffect(() => {
    if (trigger) {
        triggerRef.current = { type: trigger, time: Date.now() };
    }
  }, [trigger]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positionsAttribute = pointsRef.current.geometry.attributes.position;
    
    // Cieľ ruky v priestore scény
    const handTargetX = (handPos.x - 0.5) * 20;
    const handTargetY = -(handPos.y - 0.5) * 15;
    
    // Škálovať cieľ na základe napätia
    const targetScale = 1.5 - (tension * 1.3);
    
    // Vyhladiť vstup rýchlosti
    smoothedVelocity.current = THREE.MathUtils.lerp(smoothedVelocity.current, handVelocity, 0.1);
    
    // Skontrolovať aktívny spúšťač (trvanie 1 sekunda)
    const timeSinceTrigger = Date.now() - triggerRef.current.time;
    const isTriggerActive = triggerRef.current.type === 'fireball' && timeSinceTrigger < 1000;
    
    // Faktor rýchlosti/výbuchu
    // Kombinovať rýchlosť ruky ALEBO silu spúšťača
    let explosionForce = Math.min(smoothedVelocity.current * 3.0, 8.0); 
    
    if (isTriggerActive) {
        // Vytvoriť efekt tlakovej vlny na základe času
        const wave = 1 - (timeSinceTrigger / 1000); // 1.0 až na 0.0
        explosionForce = Math.max(explosionForce, wave * 15.0); // Masívna sila pre ohnivú guľu
    }

    // Fyzikálne konštanty
    const springStrength = 0.05; // Ako rýchlo sa vrátia do tvaru
    const damping = 0.90; // Trenie (0-1)
    const noiseStrength = 0.02;

    for (let i = 0; i < count; i++) {
        const idx = i * 3;
        
        // 1. Vypočítať cieľovú pozíciu pre túto časticu
        let tx = targetPositions[idx] * targetScale;
        let ty = targetPositions[idx + 1] * targetScale;
        let tz = targetPositions[idx + 2] * targetScale;

        // Aplikovať globálny posun ruky na cieľ
        tx += handTargetX * 0.5;
        ty += handTargetY * 0.5;

        // 2. Vypočítať sily
        const cx = physicsState.currentPositions[idx];
        const cy = physicsState.currentPositions[idx + 1];
        const cz = physicsState.currentPositions[idx + 2];

        // Sila pružiny smerom k cieľu
        let fx = (tx - cx) * springStrength;
        let fy = (ty - cy) * springStrength;
        let fz = (tz - cz) * springStrength;

        // Sila výbuchu (Odtlačiť od stredu relatívne k ruke)
        // Ak je výbuch silný, pridať masívnu silu smerom von zo stredu tvaru
        if (explosionForce > 0.5) {
            // Smer zo stredu tvaru (čo je zhruba handTargetX, handTargetY)
            // Alebo použiť lokálnu pozíciu častice relatívne k stredu tvaru
            const localX = cx - handTargetX * 0.5;
            const localY = cy - handTargetY * 0.5;
            const localZ = cz;
            
            const distSq = localX*localX + localY*localY + localZ*localZ + 0.1;
            const dist = Math.sqrt(distSq);
            
            // Sila je silnejšia bližšie k stredu? Alebo rovnomerná?
            // Urobme to ako rovnomerné tlačenie
            const push = explosionForce * 0.2 * (Math.random() + 0.5);
            
            fx += (localX / dist) * push;
            fy += (localY / dist) * push;
            fz += (localZ / dist) * push;
        }

        // Šum / Chvenie
        if (tension > 0.8) {
             fx += (Math.random() - 0.5) * 0.1;
             fy += (Math.random() - 0.5) * 0.1;
             fz += (Math.random() - 0.5) * 0.1;
        }
        
        // Pridať jemný okolitý šum
        fx += (Math.random() - 0.5) * noiseStrength;
        fy += (Math.random() - 0.5) * noiseStrength;
        fz += (Math.random() - 0.5) * noiseStrength;

        // 3. Aktualizovať rýchlosť
        physicsState.velocities[idx] += fx;
        physicsState.velocities[idx + 1] += fy;
        physicsState.velocities[idx + 2] += fz;

        // 4. Aplikovať tlmenie
        physicsState.velocities[idx] *= damping;
        physicsState.velocities[idx + 1] *= damping;
        physicsState.velocities[idx + 2] *= damping;

        // 5. Aktualizovať pozíciu
        physicsState.currentPositions[idx] += physicsState.velocities[idx];
        physicsState.currentPositions[idx + 1] += physicsState.velocities[idx + 1];
        physicsState.currentPositions[idx + 2] += physicsState.velocities[idx + 2];

        // 6. Zapísať do buffra
        positionsAttribute.setXYZ(
            i, 
            physicsState.currentPositions[idx], 
            physicsState.currentPositions[idx + 1], 
            physicsState.currentPositions[idx + 2]
        );
    }
    
    positionsAttribute.needsUpdate = true;
    
    // Pomaly otáčať celý systém
    pointsRef.current.rotation.y += 0.002;
    // Nakloniť na základe Y ruky (plynule)
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, (handPos.y - 0.5) * 0.5, 0.1);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={physicsState.currentPositions} // Počiatočný render
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
      {/* Tmavé pozadie pre lepší kontrast */}
      <color attach="background" args={['#050510']} />
      <ambientLight intensity={0.5} />
      <ParticleSystem {...props} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};
