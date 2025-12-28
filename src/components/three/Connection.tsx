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
  // Vytvoriť stabilnú inštanciu Line
  const line = useMemo(() => new THREE.Line(), []);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  const { fromNeuron, toNeuron } = useMemo(() => {
    return {
      fromNeuron: neurons.find((n) => n.id === connection.from),
      toNeuron: neurons.find((n) => n.id === connection.to),
    };
  }, [connection, neurons]);

  // Počiatočné pozície
  const initialPoints = useMemo(() => {
    if (!fromNeuron || !toNeuron) return [new THREE.Vector3(), new THREE.Vector3()];
    return [fromNeuron.position, toNeuron.position];
  }, [fromNeuron, toNeuron]);

  // Inicializovať geometriu raz
  useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(initialPoints);
    line.geometry = geometry;
    line.material = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0.5,
      linewidth: 2,
      color: connection.weight > 0 ? "#6FB5FF" : "#B589FF"
    });
  }, [line, initialPoints, connection.weight]);

  useFrame((state) => {
    if (!fromNeuron || !toNeuron) return;

    // Aktualizovať pozície priamo na buffer atribúte
    const positions = line.geometry.attributes.position;
    if (positions) {
      positions.setXYZ(0, fromNeuron.position.x, fromNeuron.position.y, fromNeuron.position.z);
      positions.setXYZ(1, toNeuron.position.x, toNeuron.position.y, toNeuron.position.z);
      positions.needsUpdate = true;
    }

    // Plynulé zmeny opacity
    const material = line.material as THREE.LineBasicMaterial;
    const avgActivation = (fromNeuron.activation + toNeuron.activation) / 2;
    
    // Pulzný efekt toku signálu
    const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.5 + 0.5; // Rýchlejší pulz
    const flowEffect = avgActivation > 0.3 ? pulse * avgActivation * 0.4 : 0;
    
    material.opacity = 0.3 + avgActivation * connection.strength * 0.5 + flowEffect;

    // Jemné farebné prechody
    const baseColor = connection.weight > 0 
      ? new THREE.Color("#00D4FF")
      : new THREE.Color("#B565FF");
    
    const activeColor = baseColor.clone().multiplyScalar(1 + avgActivation * 0.5);
    material.color.copy(activeColor);
  });

  if (!fromNeuron || !toNeuron) return null;

  return <primitive object={line} />;
};

export default Connection;
