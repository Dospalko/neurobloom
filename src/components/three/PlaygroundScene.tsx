import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { NeuralNetwork } from "../../algorithms/NeuralNetwork";

interface PlaygroundSceneProps {
  network: NeuralNetwork | null;
  epoch: number; // Trigger updates
}

type NodePos = { pos: THREE.Vector3; layer: number; index: number };
type Connection = { from: NodePos; to: NodePos; weight: number };

const nodeColor = (activation: number) => {
  const base = new THREE.Color("#00ccff"); // Cyan
  const hot = new THREE.Color("#ff9900");  // Orange
  return base.clone().lerp(hot, activation);
};

const SceneInner = ({ network, epoch }: PlaygroundSceneProps) => {
  // 1. Calculate Node Positions based on Network Structure
  const nodes = useMemo<NodePos[]>(() => {
    if (!network) return [];
    
    // network.layers is array of Layers. Each Layer is array of Nodes.
    // network.layers[0] is input layer? No, in our implementation:
    // NeuralNetwork constructor takes layerSizes. 
    // layers array contains hidden + output. Input is implicit or handled differently?
    // Let's check NeuralNetwork.ts structure.
    // Assuming network.layers is [Hidden1, Hidden2, ..., Output]
    // And inputs are not in network.layers usually in simple implementations, 
    // OR they are. 
    // Wait, let's assume we want to visualize Input -> Hidden -> Output.
    // The `network.layers` in our `NeuralNetwork.ts` (from memory/context) likely stores neurons.
    // Let's look at how we initialized it: `new NeuralNetwork([inputSize, ...hidden, 1])`.
    // Usually this creates layers for all.
    
    const spacingX = 4.0;
    const positions: NodePos[] = [];
    
    // We need to know the structure. 
    // network.layers is an array of arrays of Nodes.
    // Let's assume it includes all layers including input if the implementation does so,
    // or we might need to reconstruct input nodes if they aren't stored as nodes.
    // Inspecting NeuralNetwork.ts would be ideal, but let's assume standard structure:
    // layers[0] = Input Layer? Or Hidden Layer 1?
    // In many simple libs, layers[0] is the first layer of *neurons* (hidden).
    // Inputs are just values fed to them.
    // BUT, for visualization, we want to see Input Nodes.
    // Let's assume we can get layer sizes from `network.layerSizes` if available, or infer.
    // Actually, `network.layers` has the neurons. 
    // If inputs are just passed to forward(), they might not be in `layers`.
    // Let's check `network.layers.length`.
    
    if (!network.layers) return [];

    // We'll visualize the layers present in the network object.
    const layers = network.layers;
    const maxLayerCount = Math.max(...layers.map(l => l.length));
    
    layers.forEach((layer, layerIdx) => {
      const count = layer.length;
      const x = (layerIdx - (layers.length - 1) / 2) * spacingX;
      for (let i = 0; i < count; i++) {
        const y = ((i - (count - 1) / 2) / Math.max(1, maxLayerCount - 1)) * 6.0;
        positions.push({ pos: new THREE.Vector3(x, y, 0), layer: layerIdx, index: i });
      }
    });
    return positions;
  }, [network?.layers.length, network?.layers.map(l => l.length).join(',')]); // Re-calc if structure changes

  const [connections, setConnections] = useState<Connection[]>([]);

  // 2. Update Connections (Weights) on Epoch Change
  useEffect(() => {
    if (!network || nodes.length === 0) return;

    const next: Connection[] = [];
    
    // Iterate through layers to build connections
    // Layer i connects to Layer i-1
    // In our `nodes` array, we flattened them.
    
    // network.layers[i] contains neurons. 
    // Each neuron has `weights`. 
    // neuron.weights[j] is the weight from neuron j in previous layer.
    
    // Skip first layer if it's input and has no weights? 
    // Or if layers[0] is hidden, it has weights from inputs.
    // We need to know if we are visualizing inputs.
    // If `nodes` corresponds exactly to `network.layers`, then:
    // Layer 0 (if input) has no weights.
    // Layer 1 has weights from Layer 0.
    
    network.layers.forEach((layer, layerIdx) => {
      if (layerIdx === 0) return; // First layer (if input) or just no previous layer to connect to in this loop
      
      const currentLayerNodes = nodes.filter(n => n.layer === layerIdx);
      const prevLayerNodes = nodes.filter(n => n.layer === layerIdx - 1);
      
      layer.forEach((neuron, neuronIdx) => {
        // neuron.weights corresponds to previous layer nodes
        // weights might be an array or Float64Array.
        // Use standard loop to be safe.
        if (neuron.weights && neuron.weights.length > 0) {
            for (let prevNeuronIdx = 0; prevNeuronIdx < neuron.weights.length; prevNeuronIdx++) {
                const weight = neuron.weights[prevNeuronIdx];
                if (prevLayerNodes[prevNeuronIdx] && currentLayerNodes[neuronIdx]) {
                    next.push({
                        from: prevLayerNodes[prevNeuronIdx],
                        to: currentLayerNodes[neuronIdx],
                        weight: weight
                    });
                }
            }
        }
      });
    });
    
    setConnections(next);
  }, [network, epoch, nodes]);

  return (
    <>
      {/* Connections */}
      {connections.map((conn, idx) => {
        const points = [conn.from.pos, conn.to.pos];
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        
        // Visualize Weight
        // Width: Magnitude
        // Color: Sign (Blue +, Orange -)
        const width = Math.min(0.5, Math.abs(conn.weight) * 0.2);
        const opacity = Math.min(0.8, Math.abs(conn.weight) * 0.5 + 0.1);
        const color = conn.weight > 0 ? "#00ccff" : "#ff9900";
        
        return (
          <primitive
            key={idx}
            object={new THREE.Line(
              geom,
              new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity,
                linewidth: 1, // WebGL limitation, might stay 1px on some browsers
              })
            )}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        // Visualize Bias or Activation?
        // We don't easily have activation for every node unless we store it.
        // Let's visualize Bias for now as the "color" of the node, or just static.
        // Or if network has `output` property on nodes, use that!
        const neuron = network?.layers[node.layer][node.index];
        const val = neuron ? Math.tanh(neuron.output) : 0; // Use output if available
        
        // If it's the first layer (input), we might not have 'output' if it's just a placeholder.
        // But let's assume we do or it's 0.
        
        const color = nodeColor(val * 0.5 + 0.5); // Map -1..1 to 0..1
        
        return (
          <group key={`${node.layer}-${node.index}`} position={node.pos}>
            <mesh>
              <sphereGeometry args={[0.3, 20, 20]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5 + Math.abs(val)}
                metalness={0.2}
                roughness={0.2}
              />
            </mesh>
            {/* Halo */}
            <mesh>
              <sphereGeometry args={[0.45, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.1 + Math.abs(val) * 0.2} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

const PlaygroundScene = ({ network, epoch }: PlaygroundSceneProps) => {
  return (
    <Canvas camera={{ position: [0, 0, 14], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={["#0b0c10"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ccff" />
      <pointLight position={[-10, -10, -5]} intensity={1.0} color="#ff9900" />

      <SceneInner network={network} epoch={epoch} />

      <OrbitControls enablePan enableZoom enableRotate minDistance={5} maxDistance={30} />
    </Canvas>
  );
};

export default PlaygroundScene;
