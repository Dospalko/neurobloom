import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

interface PlaygroundSceneProps {
  layers: number[]; // e.g. [2, 6, 1]
  activations: number[][]; // same shape as layers
  isTraining?: boolean;
}

type NodePos = { pos: THREE.Vector3; layer: number; index: number };
type Connection = { from: NodePos; to: NodePos; strength: number; phase: number };

const nodeColor = (activation: number) => {
  const base = new THREE.Color("#00d4ff");
  const hot = new THREE.Color("#ffb74a");
  return base.clone().lerp(hot, activation);
};

const SceneInner = ({ layers, activations, isTraining }: PlaygroundSceneProps) => {
  const nodes = useMemo<NodePos[]>(() => {
    const spacingX = 3.6;
    const maxLayerCount = Math.max(...layers);
    const positions: NodePos[] = [];

    layers.forEach((count, layerIdx) => {
      const x = (layerIdx - (layers.length - 1) / 2) * spacingX;
      for (let i = 0; i < count; i++) {
        const y = ((i - (count - 1) / 2) / Math.max(1, maxLayerCount - 1)) * 5.5;
        positions.push({ pos: new THREE.Vector3(x, y, 0), layer: layerIdx, index: i });
      }
    });
    return positions;
  }, [layers]);

  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    const next: Connection[] = [];
    layers.forEach((_, layerIdx) => {
      if (layerIdx === layers.length - 1) return;
      const currentNodes = nodes.filter((n) => n.layer === layerIdx);
      const nextNodes = nodes.filter((n) => n.layer === layerIdx + 1);
      currentNodes.forEach((from) => {
        nextNodes.forEach((to) => {
          const strength = Math.random() * 0.5 + 0.5;
          next.push({ from, to, strength, phase: Math.random() * Math.PI * 2 });
        });
      });
    });
    setConnections(next);
  }, [layers, nodes]);

  useFrame(({ clock }) => {
    if (!isTraining) return;
    const t = clock.elapsedTime;
    setConnections((prev) =>
      prev.map((c) => ({
        ...c,
        strength: Math.max(0.2, Math.min(1.1, c.strength + Math.sin(t + c.phase) * 0.005)),
      }))
    );
  });

  return (
    <>
      {/* connections */}
      {connections.map((conn, idx) => {
        const points = [conn.from.pos, conn.to.pos];
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        const opacity = 0.18 + conn.strength * 0.25;
        const color = conn.strength > 0.8 ? "#ffb74a" : "#2dd4ff";
        return (
          <primitive
            key={idx}
            object={new THREE.Line(
              geom,
              new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity,
              })
            )}
          />
        );
      })}

      {/* nodes */}
      {nodes.map((node) => {
        const activation = activations[node.layer]?.[node.index] ?? 0.3;
        const color = nodeColor(activation);
        return (
          <group key={`${node.layer}-${node.index}`} position={node.pos}>
            <mesh>
              <sphereGeometry args={[0.38, 20, 20]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.2 + activation * 2}
                metalness={0.15}
                roughness={0.35}
              />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.55, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.16 + activation * 0.22} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

const PlaygroundScene = ({ layers, activations, isTraining }: PlaygroundSceneProps) => {
  return (
    <Canvas camera={{ position: [0, 0, 12], fov: 55 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={["#0b0c10"]} />
      <ambientLight intensity={0.65} />
      <pointLight position={[10, 10, 10]} intensity={1.6} color="#00d4ff" />
      <pointLight position={[-8, -6, -6]} intensity={1.2} color="#b565ff" />
      <pointLight position={[0, 0, 8]} intensity={0.8} color="#ffb74a" />

      <SceneInner layers={layers} activations={activations} isTraining={isTraining} />

      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  );
};

export default PlaygroundScene;
