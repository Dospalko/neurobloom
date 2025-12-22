import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, PerspectiveCamera, Environment, Stars, Sphere, Box } from "@react-three/drei";
import * as THREE from "three";

type ConnectionDef = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  strength: number; // 0-1 indicating signal quality/weight
  phase: number;
  color: THREE.Color;
};

// MUCH WIDER spacing between layers for better visibility
const LAYER_POSITIONS = {
  input: -30,
  hidden1: -10,
  hidden2: 10,
  output: 30
};

const InputGrid = ({ active, step }: { active: boolean; step: number }) => {
  const grid = useMemo(() => {
     const points = [];
     for(let i=0; i<144; i++) {
        const x = (i % 12) - 5.5;
        const y = -(Math.floor(i / 12) - 5.5);
        
        const col = i % 12;
        const row = Math.floor(i / 12);
        let isActive = false;
        if (col === 8 && row > 2 && row < 10) isActive = true;
        if (row === 7 && col > 3 && col < 9) isActive = true;
        if (col === 4 && row < 7 && row > 3) isActive = true;
        if (col === 5 && row === 3) isActive = true;

        points.push({ position: [x * 1.0, y * 1.0, 0], isActive });
     }
     return points;
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current && active) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[LAYER_POSITIONS.input, 0, 0]}>
      <Text position={[0, 9, 0]} fontSize={1.5} color="#00e5ff" outlineWidth={0.1} outlineColor="#000">
        VSTUP
      </Text>
      {grid.map((p, i) => (
         <Box key={i} args={[0.8, 0.8, 0.8]} position={p.position as [number, number, number]}>
            <meshStandardMaterial 
                color={p.isActive ? "#fbbf24" : "#0a0a15"} 
                emissive={p.isActive ? "#fbbf24" : "#000"}
                emissiveIntensity={active && p.isActive ? 3 : 0}
                roughness={0.2}
                metalness={0.9}
            />
         </Box>
      ))}
    </group>
  );
};

const HiddenLayers = ({ active, step }: { active: boolean; step: number }) => {
    const layers = [
      { count: 6, pos: LAYER_POSITIONS.hidden1, label: "SKRYTÉ 1" },
      { count: 6, pos: LAYER_POSITIONS.hidden2, label: "SKRYTÉ 2" }
    ];
    
    return (
        <>
          {layers.map((layer, layerIdx) => (
              <group key={layerIdx} position={[layer.pos, 0, 0]}>
                  <Text position={[0, 8, 0]} fontSize={1.5} color="#a855f7" outlineWidth={0.1} outlineColor="#000">
                    {layer.label}
                  </Text>
                  {Array.from({length: layer.count}).map((_, i) => (
                      <NeuronSphere 
                        key={i} 
                        position={[0, (i - layer.count/2) * 2.5 + 1.25, 0]} 
                        active={active}
                        highlight={step === 3}
                      />
                  ))}
                  {(step === 2 || step === 3) && (
                    <Sphere args={[8, 32, 32]} position={[0, 0, -3]}>
                      <meshBasicMaterial color="#a855f7" transparent opacity={0.06} />
                    </Sphere>
                  )}
              </group>
          ))}
        </>
    )
};

const NeuronSphere = ({ position, active, highlight }: { position: [number, number, number]; active: boolean; highlight: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && active) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[1]) * 0.15 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[0.8, 32, 32]} position={position}>
      <meshStandardMaterial 
        color={active ? "#a855f7" : "#1a1a2e"}
        emissive={active ? "#a855f7" : "#000"}
        emissiveIntensity={highlight ? 2 : (active ? 1 : 0)}
        roughness={0.1}
        metalness={0.95}
      />
    </Sphere>
  );
};

const OutputLayer = ({ active, step }: { active: boolean; step: number }) => {
    const outputs = [0.01, 0.02, 0.01, 0.01, 0.92, 0.01, 0.01, 0.00, 0.01, 0.00];
    
    return (
        <group position={[LAYER_POSITIONS.output, 0, 0]}>
            <Text position={[0, 9, 0]} fontSize={1.5} color="#06b6d4" outlineWidth={0.1} outlineColor="#000">
              VÝSTUP
            </Text>
            {outputs.map((val, i) => (
                <group key={i} position={[0, (i - 5) * 1.5 + 0.75, 0]}>
                    <Box args={[1, 1, 1]}>
                        <meshStandardMaterial 
                            color={i === 4 && active ? "#06b6d4" : "#0a0a15"}
                            emissive={i === 4 && active ? "#06b6d4" : "#000"}
                            emissiveIntensity={i === 4 && active ? 3 : 0}
                            roughness={0.2}
                            metalness={0.9}
                        />
                    </Box>
                    {/* Number label - MUCH MORE VISIBLE */}
                    <Text 
                      position={[5, 0, 5]} 
                      fontSize={1.2} 
                      color={i === 4 && active ? "#ffffff" : "#999"} 
                      outlineWidth={0.05}
                      outlineColor="#000"
                      anchorX="left"
                    >
                      {i}
                    </Text>
                    {active && (
                        <mesh position={[-4, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                            <cylinderGeometry args={[0.2, 0.2, val * 6, 16]} />
                            <meshStandardMaterial 
                              color={i === 4 ? "#06b6d4" : "#333"}
                              emissive={i === 4 ? "#06b6d4" : "#000"}
                              emissiveIntensity={i === 4 ? 1.5 : 0}
                            />
                        </mesh>
                    )}
                </group>
            ))}
            {step === 4 && (
              <Sphere args={[8, 32, 32]} position={[0, 0, -3]}>
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.08} />
              </Sphere>
            )}
        </group>
    )
}

// Build a reusable set of connections with strengths (stronger = thicker/brighter/faster signals)
const buildConnections = () => {
  const makeColor = (hex: string, strength: number) =>
    new THREE.Color(hex).lerp(new THREE.Color("#ffffff"), 0.2 * strength);

  const jitter = (range: number) => (Math.random() - 0.5) * range;

  const createSpan = (fromX: number, toX: number, count: number, colorHex: string, ySpread = 10, zSpread = 1): ConnectionDef[] =>
    Array.from({ length: count }).map(() => {
      const strength = Math.max(0.15, Math.pow(Math.random(), 1.3)); // more weak links, few strong
      return {
        start: new THREE.Vector3(fromX, jitter(ySpread), jitter(zSpread)),
        end: new THREE.Vector3(toX, jitter(ySpread), jitter(zSpread)),
        strength,
        phase: Math.random() * Math.PI * 2,
        color: makeColor(colorHex, strength),
      };
    });

  return [
    ...createSpan(LAYER_POSITIONS.input, LAYER_POSITIONS.hidden1, 34, "#fbbf24", 12, 1.2),
    ...createSpan(LAYER_POSITIONS.hidden1, LAYER_POSITIONS.hidden2, 28, "#a855f7", 12, 1.6),
    ...createSpan(LAYER_POSITIONS.hidden2, LAYER_POSITIONS.output, 34, "#06b6d4", 14, 2),
  ];
};

// Beautiful gradient connections with color coding and strength-aware thickness
const NetworkConnections = ({ step, connections }: { step: number; connections: ConnectionDef[] }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // seed colors
  useEffect(() => {
    if (!meshRef.current || !meshRef.current.instanceColor) return;
    connections.forEach((conn, i) => {
      meshRef.current!.setColorAt(i, conn.color);
    });
    meshRef.current.instanceColor.needsUpdate = true;
  }, [connections]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const active = step >= 2 && step <= 3;

    connections.forEach((conn, i) => {
      const direction = new THREE.Vector3().subVectors(conn.end, conn.start);
      const distance = direction.length();
      const midpoint = new THREE.Vector3().addVectors(conn.start, conn.end).multiplyScalar(0.5);

      dummy.position.copy(midpoint);
      dummy.lookAt(conn.end);
      dummy.rotateY(Math.PI / 2);

      const pulse = Math.sin(state.clock.elapsedTime * 2 + conn.phase) * 0.4 + 1;
      const baseThickness = 0.06 + conn.strength * 0.25;
      const thickness = active ? baseThickness * (1 + 0.35 * pulse) : baseThickness * 0.75;
      dummy.scale.set(thickness, distance, thickness);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, connections.length]}>
      <cylinderGeometry args={[1, 1, 1, 10]} />
      <meshStandardMaterial
        vertexColors
        emissive="#ffffff"
        emissiveIntensity={0.5}
        transparent
        opacity={step >= 2 ? 0.55 : 0.35}
        roughness={0.35}
      />
    </instancedMesh>
  );
};

// Enhanced Camera Controller
const CameraController = ({ step }: { step: number }) => {
    const { camera } = useThree();
    const targetPosRef = useRef(new THREE.Vector3(0, 0, 55));
    const targetLookRef = useRef(new THREE.Vector3(0, 0, 0));

    useFrame(() => {
        switch(step) {
          case 0: // Intro - very wide view
            targetPosRef.current.set(0, 5, 60);
            targetLookRef.current.set(0, 0, 0);
            break;
          case 1: // Input zoom - pull back more to see the whole grid
            targetPosRef.current.set(LAYER_POSITIONS.input, 1, 22);
            targetLookRef.current.set(LAYER_POSITIONS.input, 0, 0);
            break;
          case 2: // Weights - side view showing connections
            targetPosRef.current.set(-20, 8, 25);
            targetLookRef.current.set(-10, 0, 0);
            break;
          case 3: // Hidden layers
            targetPosRef.current.set(0, 5, 28);
            targetLookRef.current.set(0, 0, 0);
            break;
          case 4: // Output
            targetPosRef.current.set(LAYER_POSITIONS.output, 0, 18);
            targetLookRef.current.set(LAYER_POSITIONS.output, 0, 0);
            break;
        }

        camera.position.lerp(targetPosRef.current, 0.04);
        
        const currentTarget = new THREE.Vector3();
        camera.getWorldDirection(currentTarget);
        currentTarget.multiplyScalar(15).add(camera.position);
        currentTarget.lerp(targetLookRef.current, 0.04);
        camera.lookAt(currentTarget);
    });

    return null;
}

// Signals traveling along connections: strong connections push brighter/faster pulses
const DataFlowParticles = ({ step, connections }: { step: number; connections: ConnectionDef[] }) => {
  const count = 240;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => {
      const connIdx = Math.floor(Math.random() * connections.length);
      const strength = connections[connIdx]?.strength ?? 0.2;
      return {
        progress: Math.random(),
        speed: 0.0025 + Math.random() * 0.002 + strength * 0.006,
        offset: Math.random() * Math.PI * 2,
        connIdx,
      };
    });
  }, [connections]);

  useFrame((state) => {
    if (!mesh.current) return;

    const active = step >= 1 && step <= 3;

    particles.forEach((p, i) => {
      const conn = connections[p.connIdx];
      if (!conn) return;
      if (active) {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
      }

      const pos = new THREE.Vector3().lerpVectors(conn.start, conn.end, p.progress);

      dummy.position.copy(pos);

      const scale = active ? 0.14 + conn.strength * 0.3 : 0;
      dummy.scale.setScalar(scale);

      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
      const pulseColor = conn.color.clone().lerp(new THREE.Color("#ffffff"), 0.4);
      mesh.current!.setColorAt(i, pulseColor);
    });
    if (mesh.current.instanceMatrix) mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        vertexColors
        emissive="#ffffff"
        emissiveIntensity={1.2}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
};

// Gradient Background Component
const GradientBackground = () => {
  return (
    <mesh position={[0, 0, -50]} scale={[200, 100, 1]}>
      <planeGeometry />
      <shaderMaterial
        transparent
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
            vec3 colorTop = vec3(0.05, 0.05, 0.15);
            vec3 colorBottom = vec3(0.0, 0.0, 0.0);
            vec3 color = mix(colorBottom, colorTop, vUv.y);
            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
};

const Tutorial3DScene = ({ step }: { step: number }) => {
  const connections = useMemo(() => buildConnections(), []);

  return (
    <Canvas gl={{ antialias: true, alpha: false }}>
       <PerspectiveCamera makeDefault position={[0, 5, 60]} fov={55} />
       <color attach="background" args={["#000000"]} />
       <fog attach="fog" args={["#000000", 40, 100]} />
       
       <GradientBackground />
       
       {/* Enhanced Dramatic Lighting */}
       <ambientLight intensity={0.6} />
       <pointLight position={[LAYER_POSITIONS.input, 5, 10]} intensity={3} color="#fbbf24" distance={30} />
       <pointLight position={[LAYER_POSITIONS.hidden1, 5, 10]} intensity={2.5} color="#a855f7" distance={30} />
       <pointLight position={[LAYER_POSITIONS.hidden2, 5, 10]} intensity={2.5} color="#a855f7" distance={30} />
       <pointLight position={[LAYER_POSITIONS.output, 5, 10]} intensity={3} color="#06b6d4" distance={30} />
       <pointLight position={[0, 20, 20]} intensity={2} color="#ffffff" />
       <spotLight position={[0, 25, 15]} angle={0.5} penumbra={1} intensity={2} color="#ffffff" castShadow />
       
       <Stars radius={200} depth={80} count={12000} factor={7} saturation={0} fade speed={0.3} />
       
       <group>
          <NetworkConnections step={step} connections={connections} />
          <InputGrid active={step >= 1} step={step} />
          <HiddenLayers active={step >= 2} step={step} />
          <OutputLayer active={step >= 4} step={step} />
          <DataFlowParticles step={step} connections={connections} />
       </group>
       
       <CameraController step={step} />
       
       <Environment preset="night" />
    </Canvas>
  );
};

export default Tutorial3DScene;
