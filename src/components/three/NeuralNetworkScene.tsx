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
        dpr={[1, 2]}
      >
        <color attach="background" args={["#0A0A0A"]} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
        
        {/* Silnejšie osvetlenie pre lepšiu viditeľnosť */}
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={2.5} color="#4A9EFF" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#9B6AFF" />
        <pointLight position={[0, 15, 0]} intensity={1.5} color="#5FE88C" />
        
        {/* Hviezdy na pozadí - jemnejšie */}
        <Stars radius={100} depth={50} count={500} factor={1.5} fade speed={0.3} />
        
        {/* Neuróny */}
        {neurons.map((neuron) => (
          <Neuron
            key={neuron.id}
            neuron={neuron}
            onClick={() => onNeuronClick?.(neuron.id)}
          />
        ))}
        
        {/* Spojenia - vždy viditeľné */}
        {allConnections.length < 500 && allConnections.map((conn) => (
          <Connection key={conn.id} connection={conn} neurons={neurons} />
        ))}
        
        {/* Pozadie sféra - tmavšie pre lepší kontrast */}
        <mesh scale={30}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color="#000000"
            side={THREE.BackSide}
            transparent
            opacity={0.5}
          />
        </mesh>
        
        {/* Fog pre hĺbku */}
        <fog attach="fog" args={["#0A0A0A", 20, 60]} />

        {/* Kontroly */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={40}
          autoRotate={neurons.length > 1}
          autoRotateSpeed={neurons.length > 20 ? 0.5 : 0.3}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
      
      {/* Info overlay */}
      {neurons.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3 bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="w-16 h-16 mx-auto border-2 border-neuro-blue/50 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-neuro-purple/50 rounded-full" />
            </div>
            <p className="text-lg text-white font-semibold">Add neurons to start</p>
            <p className="text-sm text-gray-400">Use the control panel on the right</p>
          </div>
        </div>
      )}
      
      {/* Performance warning */}
      {neurons.length > 100 && (
        <div className="absolute top-4 left-4 bg-yellow-500/20 border border-yellow-400 rounded-lg px-3 py-2 text-xs text-white font-mono backdrop-blur-sm">
          <span className="text-yellow-400 font-bold">WARNING:</span> High neuron count may affect performance
        </div>
      )}
    </div>
  );
};

export default NeuralNetworkScene;
