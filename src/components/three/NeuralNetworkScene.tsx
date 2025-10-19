import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, Stars } from "@react-three/drei";
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
      <Canvas
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        dpr={[1, 2]} // Pixel ratio pre lepší výkon
      >
        <color attach="background" args={["#050410"]} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
        
        {/* Osvetlenie - zjednodušené */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#6fdfff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#a06dff" />
        
        {/* Hviezdy na pozadí */}
        <Stars radius={100} depth={50} count={1000} factor={2} fade speed={0.5} />
        
        {/* Neuróny */}
        {neurons.map((neuron) => (
          <Neuron
            key={neuron.id}
            neuron={neuron}
            onClick={() => onNeuronClick?.(neuron.id)}
          />
        ))}
        
        {/* Spojenia - len ak nie je príliš veľa */}
        {allConnections.length < 500 && allConnections.map((conn) => (
          <Connection key={conn.id} connection={conn} neurons={neurons} />
        ))}
        
        {/* Pozadie sféra */}
        <mesh scale={30}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#111b34"
            side={THREE.BackSide}
            transparent
            opacity={0.2}
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
          autoRotateSpeed={neurons.length > 20 ? 0.5 : 0.3}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* Info overlay */}
      {neurons.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4">
            <div className="text-6xl">🧠</div>
            <p className="text-xl text-gray-400">Pridaj neuróny pre začiatok</p>
          </div>
        </div>
      )}
      
      {/* Performance warning */}
      {neurons.length > 100 && (
        <div className="absolute top-4 left-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 text-sm text-yellow-300">
          ⚠️ Vysoký počet neurónov môže spomaliť výkon
        </div>
      )}
    </div>
  );
};

export default NeuralNetworkScene;
