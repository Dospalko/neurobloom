import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Neuron as NeuronType } from "../../simulation/types";

interface NeuronProps {
  neuron: NeuronType;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const Neuron = ({ neuron, onClick, isHighlighted = false, isSelected = false }: NeuronProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const activeRingRef = useRef<THREE.Mesh>(null);
  
  // Znovupoužiteľné objekty na zabránenie GC
  const tempColor = useMemo(() => new THREE.Color(), []);
  const targetColor = useMemo(() => new THREE.Color(), []);

  // Výrazné farebné materiály - nie biele!
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: neuron.color.clone().multiplyScalar(2.2),
        emissive: neuron.color.clone().multiplyScalar(1.8),
        emissiveIntensity: 4.5, // zvýšiť viditeľnosť voči osvetleniu scény
        metalness: 0.25,
        roughness: 0.15,
      }),
    [neuron.color]
  );

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current || !outerGlowRef.current || !activeRingRef.current) return;

    // Jemné, plynulé zmeny veľkosti
    const isActive = neuron.activation > 0.5;
    const pulse = 1 + neuron.activation * 0.6;
    const highlightBoost = isSelected ? 1.3 : isHighlighted ? 1.15 : 1;
    meshRef.current.scale.setScalar(pulse * 0.25 * highlightBoost);

    // Pomalá, plynulá rotácia
    meshRef.current.rotation.y += 0.01 * neuron.health;

    // Vnútorný glow - jemné pulzovanie
    const glowPulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    glowRef.current.scale.setScalar(glowPulse * 0.42 * (0.55 + neuron.activation * 0.6) * highlightBoost);

    // Vonkajší glow - veľmi jemné
    const outerGlowScale = 1 + Math.sin(state.clock.elapsedTime * 1) * 0.15;
    outerGlowRef.current.scale.setScalar(outerGlowScale * 0.8 * (1 + neuron.activation * 0.45) * highlightBoost);

    // Plynulé prechody farieb bez dramatických skokov
    const baseMultiplier = 2.4 + neuron.activation * 0.9;
    
    // Použiť copy namiesto clone
    targetColor.copy(neuron.color).multiplyScalar(baseMultiplier);
    
    // Efekt záblesku pre vysokú aktiváciu (spustenie)
    if (neuron.activation > 0.7) {
        tempColor.setHex(0xffffff);
        targetColor.lerp(tempColor, (neuron.activation - 0.7) * 2.5);
    }
    
    tempColor.setHex(0xff4444);
    targetColor.lerp(tempColor, 1 - neuron.health);
    
    material.color.copy(targetColor);
    material.emissive.copy(targetColor);
    material.emissiveIntensity = (3 + neuron.activation * 4) * (isSelected ? 1.2 : isHighlighted ? 1.1 : 1);
    
    // Jemný kruh pri vysokej aktivácii
    if (activeRingRef.current) {
      const ringScale = isActive 
        ? 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
        : 0;
      activeRingRef.current.scale.setScalar(ringScale * 1.1);
      
      const ringMaterial = activeRingRef.current.material as THREE.MeshBasicMaterial;
      ringMaterial.opacity = isActive ? neuron.activation * 0.4 : 0;
    }
  });

  return (
    <group position={neuron.position}>
      {/* Vonkajší glow - jemný - Redukovaná geometria */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color={neuron.color.clone().multiplyScalar(2.1)}
          transparent
          opacity={0.32 + neuron.activation * 0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Vnútorný glow - príjemná žiara - Redukovaná geometria */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color={neuron.color.clone().multiplyScalar(2.6)}
          transparent
          opacity={0.55 + neuron.activation * 0.35}
          depthWrite={false}
        />
      </mesh>

      {/* Hlavný neurón - Štandardná geometria */}
      <mesh ref={meshRef} onClick={onClick} material={material}>
        <sphereGeometry args={[1, 16, 16]} />
      </mesh>

      {/* Jemné jadro - Redukovaná geometria */}
      <mesh scale={0.6}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial 
          color={neuron.color.clone().multiplyScalar(3)} 
          opacity={0.85 + neuron.activation * 0.2} 
          transparent
        />
      </mesh>

      {/* Jemný kruh pri vysokej aktivácii */}
      <mesh ref={activeRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.05, 24]} />
        <meshBasicMaterial
          color={neuron.color.clone().multiplyScalar(2)}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export default Neuron;
