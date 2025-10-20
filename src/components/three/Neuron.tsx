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
  
  // Svetlejšie a žiarivejšie materiály
  const material = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: neuron.color,
      emissive: neuron.color,
      emissiveIntensity: 2.5, // Zvýšená intenzita
      metalness: 0.5,
      roughness: 0.1,
    }), 
  [neuron.color]);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current || !outerGlowRef.current) return;

    // Väčšie pulzovanie podľa aktivácie
    const pulse = 1 + neuron.activation * 0.5;
    meshRef.current.scale.setScalar(pulse * 0.25); // VÄČŠIE neuróny!

    // Rotácia
    meshRef.current.rotation.y += 0.01 * neuron.health;

    // Vnútorný glow - vždy viditeľný
    const glowScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    glowRef.current.scale.setScalar(glowScale * 0.35 * (0.5 + neuron.activation * 0.5));

    // Vonkajší glow - pre lepšiu viditeľnosť
    const outerGlowScale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    outerGlowRef.current.scale.setScalar(outerGlowScale * 0.5);

    // Svetlejšia farba podľa zdravia
    const healthColor = neuron.color.clone().multiplyScalar(1.5); // Svetlejšia
    healthColor.lerp(new THREE.Color("#ff6666"), 1 - neuron.health);
    material.color = healthColor;
    material.emissive = healthColor;
    material.emissiveIntensity = 2 + neuron.activation * 2;
  });

  return (
    <group position={neuron.position}>
      {/* Vonkajší glow - pre lepšiu viditeľnosť */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={neuron.color}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Vnútorný glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={neuron.color}
          transparent
          opacity={0.4 + neuron.activation * 0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Hlavný neurón */}
      <mesh ref={meshRef} onClick={onClick} material={material}>
        <sphereGeometry args={[1, 20, 20]} />
      </mesh>

      {/* Svetlé jadro - vždy viditeľné */}
      <mesh scale={0.6}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial 
          color="#ffffff" 
          opacity={0.7 + neuron.activation * 0.3} 
          transparent 
        />
      </mesh>
    </group>
  );
};

export default Neuron;
