import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera, Stars, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Neuron as NeuronType } from "../../simulation/types";
import Neuron from "./Neuron";
import Connection from "./Connection";

// Gradient pozadie component
const GradientBackground = () => {
  return (
    <mesh scale={50} position={[0, 0, -10]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        attach="material"
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            vec3 color1 = vec3(0.02, 0.02, 0.06); // Tmavo modrá
            vec3 color2 = vec3(0.06, 0.02, 0.08); // Tmavo fialová
            vec3 color3 = vec3(0.02, 0.06, 0.04); // Tmavo zelená
            
            float mixValue1 = smoothstep(0.0, 0.5, vUv.y);
            float mixValue2 = smoothstep(0.5, 1.0, vUv.y);
            
            vec3 gradient = mix(color1, color2, mixValue1);
            gradient = mix(gradient, color3, mixValue2 * 0.3);
            
            // Radiálny gradient od stredu
            float dist = distance(vUv, vec2(0.5, 0.5));
            gradient = mix(gradient, vec3(0.0), smoothstep(0.3, 0.8, dist) * 0.5);
            
            gl_FragColor = vec4(gradient, 1.0);
          }
        `}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

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
        <color attach="background" args={["#050510"]} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
        
        {/* Gradient pozadie */}
        <GradientBackground />
        
        {/* Farebné osvetlenie - nie biele! */}
        <ambientLight intensity={0.6} color="#8899ff" />
        <pointLight position={[10, 10, 10]} intensity={3} color="#4A9EFF" />
        <pointLight position={[-10, -10, -10]} intensity={2.5} color="#9B6AFF" />
        <pointLight position={[0, 15, 0]} intensity={2} color="#5FE88C" />
        <spotLight position={[0, 0, 20]} intensity={1.5} angle={0.5} penumbra={1} color="#FFB74A" />
        
        {/* Hviezdy a trblietavé čiastočky */}
        <Stars radius={100} depth={50} count={800} factor={2} fade speed={0.5} />
        <Sparkles
          count={100}
          size={2}
          scale={20}
          speed={0.3}
          opacity={0.4}
          color="#4A9EFF"
        />
        <Sparkles
          count={50}
          size={3}
          scale={15}
          speed={0.2}
          opacity={0.3}
          color="#9B6AFF"
        />
        
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
        
        {/* Fog pre atmosféru */}
        <fog attach="fog" args={["#050510", 25, 70]} />

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
