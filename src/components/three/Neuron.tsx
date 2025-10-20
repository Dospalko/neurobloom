import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Neuron as NeuronType } from "../../simulation/types";

interface NeuronProps {
  neuron: NeuronType;
  onClick?: () => void;
}

const Neuron = ({ neuron, onClick }: NeuronProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const activeRingRef = useRef<THREE.Mesh>(null);
  
  // Výrazné farebné materiály - nie biele!
  const material = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: neuron.color.clone().multiplyScalar(1.5),
      emissive: neuron.color.clone().multiplyScalar(1.2),
      emissiveIntensity: 3, // Silná intenzita
      metalness: 0.3,
      roughness: 0.2,
    }), 
  [neuron.color]);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current || !outerGlowRef.current || !activeRingRef.current) return;

    // Jemné, plynulé zmeny veľkosti
    const isActive = neuron.activation > 0.5;
    const pulse = 1 + neuron.activation * 0.6;
    meshRef.current.scale.setScalar(pulse * 0.25);

    // Pomalá, plynulá rotácia
    meshRef.current.rotation.y += 0.01 * neuron.health;

    // Vnútorný glow - jemné pulzovanie
    const glowPulse = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    glowRef.current.scale.setScalar(
      glowPulse * 0.35 * (0.5 + neuron.activation * 0.5)
    );

    // Vonkajší glow - veľmi jemné
    const outerGlowScale = 1 + Math.sin(state.clock.elapsedTime * 1) * 0.15;
    outerGlowRef.current.scale.setScalar(
      outerGlowScale * 0.6 * (1 + neuron.activation * 0.4)
    );

    // Plynulé prechody farieb bez dramatických skokov
    const baseMultiplier = 1.8 + neuron.activation * 0.7;
    const activeColor = neuron.color.clone().multiplyScalar(baseMultiplier);
    
    const healthColor = activeColor.clone();
    healthColor.lerp(new THREE.Color("#ff4444"), 1 - neuron.health);
    
    material.color = healthColor;
    material.emissive = healthColor;
    material.emissiveIntensity = 3 + neuron.activation * 4;
    
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
      {/* Vonkajší glow - jemný */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={neuron.color.clone().multiplyScalar(1.6)}
          transparent
          opacity={0.2 + neuron.activation * 0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Vnútorný glow - príjemná žiara */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={neuron.color.clone().multiplyScalar(2)}
          transparent
          opacity={0.4 + neuron.activation * 0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Hlavný neurón */}
      <mesh ref={meshRef} onClick={onClick} material={material}>
        <sphereGeometry args={[1, 20, 20]} />
      </mesh>

      {/* Jemné jadro */}
      <mesh scale={0.6}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial 
          color={neuron.color.clone().multiplyScalar(2.2)} 
          opacity={0.7 + neuron.activation * 0.2} 
          transparent
        />
      </mesh>

      {/* Jemný kruh pri vysokej aktivácii */}
      <mesh ref={activeRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.95, 1.05, 32]} />
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
