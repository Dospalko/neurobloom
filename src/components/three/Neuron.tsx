import { useRef } from "react";
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

  useFrame((state) => {
    if (!meshRef.current || !glowRef.current) return;

    // Pulzovanie podľa aktivácie
    const pulse = 1 + neuron.activation * 0.3;
    meshRef.current.scale.setScalar(pulse * 0.15);

    // Rotácia podľa zdravia
    meshRef.current.rotation.y += 0.01 * neuron.health;

    // Glow efekt
    const glowScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    glowRef.current.scale.setScalar(glowScale * 0.25 * neuron.activation);

    // Farba podľa zdravia a aktivácie
    const healthColor = neuron.color.clone();
    healthColor.lerp(new THREE.Color("#ff0000"), 1 - neuron.health);
    (meshRef.current.material as THREE.MeshStandardMaterial).color =
      healthColor;
    (meshRef.current.material as THREE.MeshStandardMaterial).emissive =
      healthColor;
    (
      meshRef.current.material as THREE.MeshStandardMaterial
    ).emissiveIntensity = neuron.activation * 2;
  });

  return (
    <group position={neuron.position}>
      {/* Hlavný neurón */}
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={neuron.color}
          emissive={neuron.color}
          emissiveIntensity={neuron.activation}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Glow efekt */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={neuron.color}
          transparent
          opacity={neuron.activation * 0.3}
        />
      </mesh>

      {/* Vnútorné jadro */}
      <mesh scale={0.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
      </mesh>
    </group>
  );
};

export default Neuron;
