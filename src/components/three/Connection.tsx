import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Connection as ConnectionType } from "../../simulation/types";
import { Neuron } from "../../simulation/types";

interface ConnectionProps {
  connection: ConnectionType;
  neurons: Neuron[];
}

const Connection = ({ connection, neurons }: ConnectionProps) => {
  const lineRef = useRef<THREE.Line>(null);

  const { fromNeuron, toNeuron } = useMemo(() => {
    return {
      fromNeuron: neurons.find((n) => n.id === connection.from),
      toNeuron: neurons.find((n) => n.id === connection.to),
    };
  }, [connection, neurons]);

  useFrame((state) => {
    if (!lineRef.current || !fromNeuron || !toNeuron) return;

    // Update pozícií
    const positions = lineRef.current.geometry.attributes.position;
    positions.setXYZ(0, fromNeuron.position.x, fromNeuron.position.y, fromNeuron.position.z);
    positions.setXYZ(1, toNeuron.position.x, toNeuron.position.y, toNeuron.position.z);
    positions.needsUpdate = true;

    // Animácia opacity podľa aktivácie
    const material = lineRef.current.material as THREE.LineBasicMaterial;
    const avgActivation = (fromNeuron.activation + toNeuron.activation) / 2;
    material.opacity = 0.2 + avgActivation * connection.strength * 0.6;

    // Farba podľa váhy (+ modrá, - červená)
    const color = connection.weight > 0 
      ? new THREE.Color("#6fdfff") 
      : new THREE.Color("#ff6ddf");
    material.color = color;
  });

  if (!fromNeuron || !toNeuron) return null;

  const points = [fromNeuron.position, toNeuron.position];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial())} ref={lineRef}>
      <lineBasicMaterial
        attach="material"
        transparent
        opacity={0.3}
        color={connection.weight > 0 ? "#6fdfff" : "#ff6ddf"}
      />
    </primitive>
  );
};

export default Connection;
