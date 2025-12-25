import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NeuralNetwork } from "../../algorithms/NeuralNetwork";

interface PlaygroundSceneProps {
  network: NeuralNetwork | null;
  epoch: number; // Trigger updates
  featureLabels: string[];
  scenarioLabel?: string;
  onNodeHover?: (node: { layer: number; index: number; x: number; y: number } | null) => void;
}

type NodePos = { id: string; pos: THREE.Vector3; layer: number; index: number; label?: string };
type Connection = { id: string; from: NodePos; to: NodePos; weight: number; sourceOutput: number; destOutput: number; label: string };

const nodeColor = (activation: number) => {
  const base = new THREE.Color("#00ccff"); // Cyan
  const hot = new THREE.Color("#ff9900");  // Orange
  return base.clone().lerp(hot, activation);
};

const SceneInner = ({ network, epoch, featureLabels, scenarioLabel, onNodeHover }: PlaygroundSceneProps) => {
  const [hoveredConn, setHoveredConn] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const sanitizeLabel = useCallback((label: string) => {
    return label
      .replace(/₀/g, "0")
      .replace(/₁/g, "1")
      .replace(/₂/g, "2")
      .replace(/₃/g, "3")
      .replace(/₄/g, "4")
      .replace(/₅/g, "5")
      .replace(/₆/g, "6")
      .replace(/₇/g, "7")
      .replace(/₈/g, "8")
      .replace(/₉/g, "9");
  }, []);

  // 1. Calculate Node Positions based on Network Structure
  const nodes = useMemo<NodePos[]>(() => {
    if (!network?.layers?.length) return [];

    const spacingX = 4.0;
    const positions: NodePos[] = [];

    // We'll visualize the layers present in the network object.
    const layers = network.layers;
    const maxLayerCount = Math.max(...layers.map(l => l.length));
    
    layers.forEach((layer, layerIdx) => {
      const count = layer.length;
      const x = (layerIdx - (layers.length - 1) / 2) * spacingX;
      for (let i = 0; i < count; i++) {
        const y = ((i - (count - 1) / 2) / Math.max(1, maxLayerCount - 1)) * 6.0;
        const rawLabel =
          layerIdx === 0
            ? featureLabels[i] ?? `Input ${i + 1}`
            : layerIdx === layers.length - 1
            ? `Output ${i + 1}`
            : `H${layerIdx}-${i + 1}`;
        const label = sanitizeLabel(rawLabel);
        positions.push({ id: `${layerIdx}_${i}`, pos: new THREE.Vector3(x, y, 0), layer: layerIdx, index: i, label });
      }
    });
    return positions;
  }, [network, featureLabels, sanitizeLabel]);

  const [connections, setConnections] = useState<Connection[]>([]);

  // 2. Update Connections (Weights) on Epoch Change
  useEffect(() => {
    if (!network || nodes.length === 0) return;

    const next: Connection[] = [];

    // Build a map from node id to position for quick lookup
    const posMap = new Map<string, NodePos>();
    nodes.forEach((n) => posMap.set(n.id, n));

    // Use network.links (source/dest) so we respect the real connectivity
    network.links.forEach((link) => {
      const from = posMap.get(link.source.id);
      const to = posMap.get(link.dest.id);
      if (!from || !to) return;
      const srcLabel = from.label ?? `L${from.layer}N${from.index + 1}`;
      const dstLabel = to.label ?? `L${to.layer}N${to.index + 1}`;
      const label = scenarioLabel ? `${srcLabel} -> ${dstLabel} • ${scenarioLabel}` : `${srcLabel} -> ${dstLabel}`;
      next.push({
        id: `${from.id}-${to.id}`,
        from,
        to,
        weight: link.weight,
        sourceOutput: link.source.output ?? 0,
        destOutput: link.dest.output ?? 0,
        label,
      });
    });

    setConnections(next);
  }, [network, epoch, nodes, scenarioLabel]);

  return (
    <>
      {/* Connections */}
      {connections.map((conn, idx) => {
        const weightAbs = Math.abs(conn.weight);
        const baseColor = new THREE.Color(conn.weight >= 0 ? "#00ccff" : "#ff9900");
        // widen contrast: weak = darker/thinner, strong = brighter/thicker
        const strongMix = Math.min(0.45, weightAbs * 0.6);
        const color = baseColor.clone().lerp(new THREE.Color("#ffffff"), strongMix).getStyle();

        const weightWidth = 0.2 + weightAbs * 4; // bigger spread
        const lineWidth = Math.min(8, Math.max(1, weightWidth));
        const opacity = Math.min(0.95, 0.15 + weightAbs * 0.7);
        const midPoint = conn.from.pos
          .clone()
          .add(conn.to.pos)
          .multiplyScalar(0.5)
          .add(new THREE.Vector3(0, 0.2, 0.05));

        return (
          <group
            key={conn.id ?? `${conn.label}-${idx}`}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredConn(conn.id);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredConn((current) => (current === conn.id ? null : current));
            }}
          >
            <Line
              points={[conn.from.pos.clone(), conn.to.pos.clone()]}
              color={color}
              transparent
              opacity={opacity}
              lineWidth={lineWidth}
              depthWrite={false}
              dashed={false}
              toneMapped={false}
            />
          </group>
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
          <group
            key={`${node.layer}-${node.index}`}
            position={node.pos}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredNode(node.id);
              onNodeHover?.({ layer: node.layer, index: node.index, x: e.clientX, y: e.clientY });
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredNode((current) => (current === node.id ? null : current));
              onNodeHover?.(null);
            }}
          >
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
            {hoveredNode === node.id && node.label && (
              <Text
                position={[0, 0.7, 0]}
                fontSize={0.35}
                color="#e5e7eb"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="black"
              >
                {node.label}
              </Text>
            )}
          </group>
        );
      })}
    </>
  );
};

const PlaygroundScene = ({ network, epoch, featureLabels, scenarioLabel, onNodeHover }: PlaygroundSceneProps) => {
  return (
    <Canvas camera={{ position: [0, 0, 14], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={["#0b0c10"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#00ccff" />
      <pointLight position={[-10, -10, -5]} intensity={1.0} color="#ff9900" />

      <SceneInner 
        network={network} 
        epoch={epoch} 
        featureLabels={featureLabels} 
        scenarioLabel={scenarioLabel} 
        onNodeHover={onNodeHover}
      />

      <OrbitControls enablePan enableZoom enableRotate minDistance={5} maxDistance={30} />
    </Canvas>
  );
};

export default PlaygroundScene;
