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
  
  // Memoize materials pre lepší výkon
  const material = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: neuron.color,
      emissive: neuron.color,
      metalness: 0.8,
      roughness: 0.2,
    }), 
  [neuron.color]);

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;

    // Pulzovanie podľa aktivácie (zjednodušené)
    const pulse = 1 + neuron.activation * 0.3;
    meshRef.current.scale.setScalar(pulse * 0.12); // Menšie neuróny

    // Jednoduchšia rotácia
    meshRef.current.rotation.y += 0.01 * neuron.health;

    // Glow efekt (len ak je aktivovaný)
    if (neuron.activation > 0.1) {
      const glowScale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      glowRef.current.scale.setScalar(glowScale * 0.2 * neuron.activation);
    } else {
      glowRef.current.scale.setScalar(0.01);
    }

    // Farba podľa zdravia
    const healthColor = neuron.color.clone();
    healthColor.lerp(new THREE.Color("#ff0000"), 1 - neuron.health);
    material.color = healthColor;
    material.emissive = healthColor;
    material.emissiveIntensity = neuron.activation * 2;
  });

  return (
    <group position={neuron.position}>
      {/* Hlavný neurón */}
      <mesh ref={meshRef} onClick={onClick} material={material}>
        <sphereGeometry args={[1, 16, 16]} />
      </mesh>

      {/* Glow efekt */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial
          color={neuron.color}
          transparent
          opacity={neuron.activation * 0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Vnútorné jadro (len pri vysokej aktivácii) */}
      {neuron.activation > 0.5 && (
        <mesh scale={0.5}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      )}
    </group>
  );
};

export default Neuron;
