import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Neuron as NeuronType } from "../../simulation/types";
import Neuron from "./Neuron";
import Connection from "./Connection";

interface NeuralNetworkSceneProps {
  neurons: NeuronType[];
  onNeuronClick?: (id: string) => void;
}

const NeuralNetworkScene = ({ neurons, onNeuronClick }: NeuralNetworkSceneProps) => {
  // Zozbieraj všetky spojenia
  const allConnections = neurons.flatMap((neuron) =>
    neuron.connections.map((conn) => ({ ...conn, neuronId: neuron.id }))
  );

  return (
    <div className="w-full h-full">
      <Canvas>
        <color attach="background" args={["#050410"]} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
        
        {/* Osvetlenie */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#6fdfff" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#a06dff" />
        <spotLight
          position={[0, 15, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          color="#ff6ddf"
        />
        
        {/* Environmentálne svetlo */}
        <Environment preset="night" />
        
        {/* Neuróny */}
        {neurons.map((neuron) => (
          <Neuron
            key={neuron.id}
            neuron={neuron}
            onClick={() => onNeuronClick?.(neuron.id)}
          />
        ))}
        
        {/* Spojenia */}
        {allConnections.map((conn) => (
          <Connection key={conn.id} connection={conn} neurons={neurons} />
        ))}
        
        {/* Pozadie sféra */}
        <mesh scale={30}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial
            color="#111b34"
            side={THREE.BackSide}
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* Kontroly */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          autoRotate={neurons.length > 1}
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};

export default NeuralNetworkScene;
