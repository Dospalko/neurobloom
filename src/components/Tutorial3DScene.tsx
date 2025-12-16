import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, PerspectiveCamera, Environment, Stars, Sphere, Box } from "@react-three/drei";
import * as THREE from "three";

// Positions for each layer (x-coordinates)
const LAYER_POSITIONS = {
  input: -12,
  hidden1: -4,
  hidden2: 4,
  output: 12
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

        points.push({ position: [x * 0.6, y * 0.6, 0], isActive });
     }
     return points;
  }, []);

  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current && active) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[LAYER_POSITIONS.input, 0, 0]}>
      <Text position={[0, 5, 0]} fontSize={0.7} color="#00e5ff" font="/fonts/inter-bold.woff">
        VSTUP
      </Text>
      {grid.map((p, i) => (
         <Box key={i} args={[0.45, 0.45, 0.45]} position={p.position as [number, number, number]}>
            <meshStandardMaterial 
                color={p.isActive ? "#fbbf24" : "#1a1a2e"} 
                emissive={p.isActive ? "#f59e0b" : "#000"}
                emissiveIntensity={active && p.isActive ? 1.5 : 0}
                roughness={0.3}
                metalness={0.7}
            />
         </Box>
      ))}
      {/* Glow effect for active layer */}
      {step === 1 && (
        <Sphere args={[8, 32, 32]} position={[0, 0, -2]}>
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.05} />
        </Sphere>
      )}
    </group>
  );
};

const HiddenLayers = ({ active, step }: { active: boolean; step: number }) => {
    const layers = [
      { count: 8, pos: LAYER_POSITIONS.hidden1 },
      { count: 6, pos: LAYER_POSITIONS.hidden2 }
    ];
    
    return (
        <>
          <Text position={[0, 5, 0]} fontSize={0.7} color="#a855f7" font="/fonts/inter-bold.woff">
            SPRACOVANIE
          </Text>
          {layers.map((layer, layerIdx) => (
              <group key={layerIdx} position={[layer.pos, 0, 0]}>
                  {Array.from({length: layer.count}).map((_, i) => (
                      <NeuronSphere 
                        key={i} 
                        position={[0, (i - layer.count/2) * 1.8 + 0.9, 0]} 
                        active={active}
                        highlight={step === 3}
                      />
                  ))}
                  {/* Layer glow */}
                  {step === 2 || step === 3 ? (
                    <Sphere args={[6, 32, 32]} position={[0, 0, -2]}>
                      <meshBasicMaterial color="#a855f7" transparent opacity={0.03} />
                    </Sphere>
                  ) : null}
              </group>
          ))}
        </>
    )
};

const NeuronSphere = ({ position, active, highlight }: { position: [number, number, number]; active: boolean; highlight: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && active) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[1]) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <Sphere ref={meshRef} args={[0.6, 32, 32]} position={position}>
      <meshStandardMaterial 
        color={active ? "#a855f7" : "#2a2a3e"}
        emissive={active ? "#7c3aed" : "#000"}
        emissiveIntensity={highlight ? 1.2 : (active ? 0.5 : 0)}
        roughness={0.2}
        metalness={0.9}
      />
    </Sphere>
  );
};

const OutputLayer = ({ active, step }: { active: boolean; step: number }) => {
    const outputs = [0.01, 0.02, 0.01, 0.01, 0.92, 0.01, 0.01, 0.00, 0.01, 0.00];
    
    return (
        <group position={[LAYER_POSITIONS.output, 0, 0]}>
            <Text position={[0, 5, 0]} fontSize={0.7} color="#06b6d4" font="/fonts/inter-bold.woff">
              VÝSTUP
            </Text>
            {outputs.map((val, i) => (
                <group key={i} position={[0, (i - 5) * 1.3 + 0.65, 0]}>
                    <Box args={[0.9, 0.9, 0.9]}>
                        <meshStandardMaterial 
                            color={i === 4 && active ? "#06b6d4" : "#1a1a2e"}
                            emissive={i === 4 && active ? "#0891b2" : "#000"}
                            emissiveIntensity={i === 4 && active ? 2 : 0}
                            roughness={0.3}
                            metalness={0.8}
                        />
                    </Box>
                    <Text position={[2, 0, 0]} fontSize={0.5} color={i === 4 && active ? "#fff" : "#666"}>
                      {i}
                    </Text>
                    {/* Confidence bar */}
                    {active && (
                        <mesh position={[-3, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                            <cylinderGeometry args={[0.15, 0.15, val * 4, 16]} />
                            <meshStandardMaterial 
                              color={i === 4 ? "#06b6d4" : "#444"}
                              emissive={i === 4 ? "#0891b2" : "#000"}
                              emissiveIntensity={i === 4 ? 0.8 : 0}
                            />
                        </mesh>
                    )}
                </group>
            ))}
            {step === 4 && (
              <Sphere args={[6, 32, 32]} position={[0, 0, -2]}>
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} />
              </Sphere>
            )}
        </group>
    )
}

// Network Connections - visible lines between layers
const NetworkConnections = ({ step }: { step: number }) => {
  const linesRef = useRef<THREE.LineSegments>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  const connections = useMemo(() => {
    const conns = [];
    // Input to Hidden1 (sample connections)
    for (let i = 0; i < 20; i++) {
      conns.push({
        start: [LAYER_POSITIONS.input, (Math.random() - 0.5) * 6, 0],
        end: [LAYER_POSITIONS.hidden1, (Math.random() - 0.5) * 8, 0],
        phase: Math.random() * Math.PI * 2
      });
    }
    // Hidden1 to Hidden2
    for (let i = 0; i < 15; i++) {
      conns.push({
        start: [LAYER_POSITIONS.hidden1, (Math.random() - 0.5) * 8, 0],
        end: [LAYER_POSITIONS.hidden2, (Math.random() - 0.5) * 6, 0],
        phase: Math.random() * Math.PI * 2
      });
    }
    // Hidden2 to Output
    for (let i = 0; i < 20; i++) {
      conns.push({
        start: [LAYER_POSITIONS.hidden2, (Math.random() - 0.5) * 6, 0],
        end: [LAYER_POSITIONS.output, (Math.random() - 0.5) * 10, 0],
        phase: Math.random() * Math.PI * 2
      });
    }
    return conns;
  }, []);

  useFrame((state) => {
    if (!geometryRef.current) return;
    
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const colors = geometryRef.current.attributes.color?.array as Float32Array;
    
    connections.forEach((conn, i) => {
      const idx = i * 6; // 2 vertices per line, 3 coords each
      positions[idx] = conn.start[0];
      positions[idx + 1] = conn.start[1];
      positions[idx + 2] = conn.start[2];
      positions[idx + 3] = conn.end[0];
      positions[idx + 4] = conn.end[1];
      positions[idx + 5] = conn.end[2];
      
      // Animate color/opacity based on step
      if (colors) {
        const pulse = Math.sin(state.clock.elapsedTime * 2 + conn.phase) * 0.3 + 0.7;
        const active = step >= 2 && step <= 3;
        const intensity = active ? pulse * 0.5 : 0.1;
        
        // Cyan color
        colors[idx * 2] = 0;
        colors[idx * 2 + 1] = intensity;
        colors[idx * 2 + 2] = intensity;
        colors[idx * 2 + 3] = 0;
        colors[idx * 2 + 4] = intensity;
        colors[idx * 2 + 5] = intensity;
      }
    });
    
    geometryRef.current.attributes.position.needsUpdate = true;
    if (geometryRef.current.attributes.color) {
      geometryRef.current.attributes.color.needsUpdate = true;
    }
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={connections.length * 2}
          array={new Float32Array(connections.length * 6)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={connections.length * 2}
          array={new Float32Array(connections.length * 6)}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.6} />
    </lineSegments>
  );
};

// Enhanced Camera Controller with better easing
const CameraController = ({ step }: { step: number }) => {
    const { camera } = useThree();
    const targetPosRef = useRef(new THREE.Vector3(0, 0, 28));
    const targetLookRef = useRef(new THREE.Vector3(0, 0, 0));

    useFrame(() => {
        // Set target based on step
        switch(step) {
          case 0: // Intro - wide view
            targetPosRef.current.set(0, 2, 28);
            targetLookRef.current.set(0, 0, 0);
            break;
          case 1: // Input zoom
            targetPosRef.current.set(LAYER_POSITIONS.input, 0, 10);
            targetLookRef.current.set(LAYER_POSITIONS.input, 0, 0);
            break;
          case 2: // Weights - between input and hidden
            targetPosRef.current.set(-8, 3, 12);
            targetLookRef.current.set(-4, 0, 0);
            break;
          case 3: // Hidden layers
            targetPosRef.current.set(0, 2, 14);
            targetLookRef.current.set(0, 0, 0);
            break;
          case 4: // Output
            targetPosRef.current.set(LAYER_POSITIONS.output, 0, 10);
            targetLookRef.current.set(LAYER_POSITIONS.output, 0, 0);
            break;
        }

        // Smooth camera movement with easing
        camera.position.lerp(targetPosRef.current, 0.03);
        
        // Create a virtual "lookAt" point and interpolate towards it
        const currentTarget = new THREE.Vector3();
        camera.getWorldDirection(currentTarget);
        currentTarget.multiplyScalar(10).add(camera.position);
        currentTarget.lerp(targetLookRef.current, 0.03);
        camera.lookAt(currentTarget);
    });

    return null;
}

// Enhanced data flow particles with path following
const DataFlowParticles = ({ step }: { step: number }) => {
    const count = 150;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const particles = useMemo(() => {
        return Array.from({length: count}).map(() => ({
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.003,
            offset: Math.random() * Math.PI * 2,
            pathIdx: Math.floor(Math.random() * 3) // 0: input->h1, 1: h1->h2, 2: h2->output
        }));
    }, []);

    useFrame((state) => {
        if (!mesh.current) return;
        
        const active = step >= 1 && step <= 3;
        
        particles.forEach((p, i) => {
            if (active) {
                p.progress += p.speed;
                if (p.progress > 1) p.progress = 0;
            }
            
            // Calculate position along path
            let x, y, z;
            if (p.pathIdx === 0) {
                x = THREE.MathUtils.lerp(LAYER_POSITIONS.input, LAYER_POSITIONS.hidden1, p.progress);
                y = Math.sin(p.progress * Math.PI + p.offset) * 2;
            } else if (p.pathIdx === 1) {
                x = THREE.MathUtils.lerp(LAYER_POSITIONS.hidden1, LAYER_POSITIONS.hidden2, p.progress);
                y = Math.sin(p.progress * Math.PI + p.offset) * 1.5;
            } else {
                x = THREE.MathUtils.lerp(LAYER_POSITIONS.hidden2, LAYER_POSITIONS.output, p.progress);
                y = Math.sin(p.progress * Math.PI + p.offset) * 2.5;
            }
            z = Math.sin(state.clock.elapsedTime + p.offset) * 0.5;
            
            dummy.position.set(x, y, z);
            
            const s = active ? (0.12 + Math.sin(p.progress * Math.PI) * 0.05) : 0;
            dummy.scale.setScalar(s);
            
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
        </instancedMesh>
    );
};

const Tutorial3DScene = ({ step }: { step: number }) => {
  return (
    <Canvas gl={{ antialias: true, alpha: false }}>
       <PerspectiveCamera makeDefault position={[0, 2, 28]} fov={50} />
       <color attach="background" args={["#0a0a15"]} />
       
       {/* Lighting */}
       <ambientLight intensity={0.3} />
       <pointLight position={[15, 10, 15]} intensity={1.5} color="#00e5ff" />
       <pointLight position={[-15, -5, 10]} intensity={1} color="#a855f7" />
       <spotLight position={[0, 15, 10]} angle={0.3} penumbra={1} intensity={0.8} color="#ffffff" />
       
       <Stars radius={150} depth={60} count={8000} factor={5} saturation={0} fade speed={0.5} />
       
       <group>
          <NetworkConnections step={step} />
          <InputGrid active={step >= 1} step={step} />
          <HiddenLayers active={step >= 2} step={step} />
          <OutputLayer active={step >= 4} step={step} />
          <DataFlowParticles step={step} />
       </group>
       
       <CameraController step={step} />
       
       <Environment preset="night" />
    </Canvas>
  );
};

export default Tutorial3DScene;
