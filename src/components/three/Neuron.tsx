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
    if (!meshRef.current || !glowRef.current || !outerGlowRef.current) return;

    // Väčšie pulzovanie podľa aktivácie
    const pulse = 1 + neuron.activation * 0.8;
    meshRef.current.scale.setScalar(pulse * 0.25);

    // Rotácia
    meshRef.current.rotation.y += 0.01 * neuron.health;

    // Vnútorný glow - silnejší pri aktivácii
    const glowScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    glowRef.current.scale.setScalar(glowScale * 0.35 * (0.5 + neuron.activation * 0.5));

    // Vonkajší glow - výraznejší
    const outerGlowScale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    outerGlowRef.current.scale.setScalar(outerGlowScale * 0.5 * (1 + neuron.activation * 0.5));

    // Výraznejšia farba - nikdy nie biela!
    const activeColor = neuron.color.clone().multiplyScalar(1.8 + neuron.activation * 0.5);
    const healthColor = activeColor.clone();
    healthColor.lerp(new THREE.Color("#ff4444"), 1 - neuron.health);
    
    material.color = healthColor;
    material.emissive = healthColor;
    material.emissiveIntensity = 3 + neuron.activation * 3; // Ešte silnejšie!
  });

  return (
    <group position={neuron.position}>
      {/* Vonkajší glow - farebný a výrazný */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={neuron.color.clone().multiplyScalar(1.5)}
          transparent
          opacity={0.2 + neuron.activation * 0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Vnútorný glow - intenzívna farba */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={neuron.color.clone().multiplyScalar(1.8)}
          transparent
          opacity={0.5 + neuron.activation * 0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Hlavný neurón */}
      <mesh ref={meshRef} onClick={onClick} material={material}>
        <sphereGeometry args={[1, 20, 20]} />
      </mesh>

      {/* Svetlé jadro - žiarivá farba namiesto bielej */}
      <mesh scale={0.6}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial 
          color={neuron.color.clone().multiplyScalar(2)} 
          opacity={0.8 + neuron.activation * 0.2} 
          transparent 
        />
      </mesh>
    </group>
  );
};

export default Neuron;
