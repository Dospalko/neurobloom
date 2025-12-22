import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, OrbitControls, PerspectiveCamera, Stars, Sparkles, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Neuron as NeuronType } from "../../simulation/types";
import Neuron from "./Neuron";
import Connection from "./Connection";

// Gradient pozadie component
const GradientBackground = () => {
  const { camera } = useThree();
  const planeRef = useRef<THREE.Mesh>(null);
  const dir = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!planeRef.current) return;
    camera.getWorldDirection(dir);
    planeRef.current.position.copy(camera.position).addScaledVector(dir, 60);
    planeRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <mesh
      ref={planeRef}
      scale={140}
      frustumCulled={false}
      renderOrder={-10}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        attach="material"
        depthWrite={false}
        depthTest={false}
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

type HudData = {
  yawDisplay: number;    // -180 to 180 for readability
  yawContinuous: number; // unwrapped to keep cube rotation smooth
  pitch: number;
  distance: number;
};

// Track camera orientation/distance for HUD
const CameraTracker = ({ onChange }: { onChange: (data: HudData) => void }) => {
  const { camera } = useThree();
  const frame = useRef(0);
  const prev = useRef<HudData>({ yawDisplay: 0, yawContinuous: 0, pitch: 0, distance: 0 });
  const yawState = useRef({ raw: 0, accum: 0 });

  useFrame(() => {
    frame.current++;
    if (frame.current % 4 !== 0) return; // throttle updates

    const pos = camera.position;
    const distance = pos.length();
    const yawDisplay = Math.atan2(pos.x, pos.z) * THREE.MathUtils.RAD2DEG; // -180..180
    const pitch = Math.atan2(pos.y, Math.sqrt(pos.x * pos.x + pos.z * pos.z)) * THREE.MathUtils.RAD2DEG;

    // Unwrap yaw for continuous cube rotation (avoid jumps at +/-180)
    let deltaYaw = yawDisplay - yawState.current.raw;
    if (deltaYaw > 180) deltaYaw -= 360;
    if (deltaYaw < -180) deltaYaw += 360;
    yawState.current.accum += deltaYaw;
    yawState.current.raw = yawDisplay;

    const yawContinuous = yawState.current.accum;

    const next = { yawDisplay, yawContinuous, pitch, distance };
    const deltaYawDisp = Math.abs(next.yawDisplay - prev.current.yawDisplay);
    const deltaPitch = Math.abs(next.pitch - prev.current.pitch);
    const deltaDist = Math.abs(next.distance - prev.current.distance);

    if (deltaYawDisp < 0.1 && deltaPitch < 0.1 && deltaDist < 0.01) return;
    prev.current = next;
    onChange(next);
  });

  return null;
};

// Subtle reference grid to keep orientation while orbiting/zooming
const ReferenceGrid = () => {
  const gridRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const dir = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!gridRef.current) return;
    camera.getWorldDirection(dir);
    gridRef.current.position.copy(camera.position).addScaledVector(dir, 80);
    gridRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <Grid
      ref={gridRef}
      args={[200, 200]}
      cellSize={1}
      cellThickness={0.35}
      cellColor="#0d1a2c"
      sectionSize={8}
      sectionThickness={0.8}
      sectionColor="#1f3b63"
      fadeDistance={90}
      fadeStrength={1.1}
      infiniteGrid
      renderOrder={-5}
      frustumCulled={false}
      side={THREE.DoubleSide}
    />
  );
};

// Always-visible HUD cube showing orientation (front/back/top/bottom/left/right) and camera stats
const ScreenReference = ({ hud }: { hud: HudData }) => {
  const { yawDisplay, yawContinuous, pitch, distance } = hud;
  const size = 50;
  const cubeStyle: CSSProperties = {
    position: "relative",
    width: `${size}px`,
    height: `${size}px`,
    transformStyle: "preserve-3d",
    transform: `rotateX(${(-pitch).toFixed(2)}deg) rotateY(${yawContinuous.toFixed(2)}deg)`,
    transition: "transform 0.08s ease-out",
  };

  const faceBase: CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    letterSpacing: "0.08em",
    fontWeight: 600,
    color: "rgba(255,255,255,0.85)",
    textShadow: "0 1px 6px rgba(0,0,0,0.35)",
    backfaceVisibility: "hidden",
    background: "linear-gradient(145deg, rgba(28,42,74,0.75), rgba(16,24,42,0.85))",
  };

  return (
    <div className="pointer-events-none absolute top-6 right-6 flex items-start gap-4 text-[10px] font-mono text-gray-300">
      <div
        className="relative rounded-xl border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
        style={{ padding: "24px 20px", backgroundColor: "rgba(5,10,20,0.75)", backdropFilter: "blur(6px)" }}
      >
        <div style={{ width: `${size}px`, height: `${size}px`, perspective: "720px" }}>
          <div style={cubeStyle}>
            <div style={{ ...faceBase, transform: `translateZ(${size / 2}px)` }}>FRONT</div>
            <div style={{ ...faceBase, transform: `rotateY(180deg) translateZ(${size / 2}px)` }}>BACK</div>
            <div style={{ ...faceBase, transform: `rotateY(90deg) translateZ(${size / 2}px)` }}>RIGHT</div>
            <div style={{ ...faceBase, transform: `rotateY(-90deg) translateZ(${size / 2}px)` }}>LEFT</div>
            <div style={{ ...faceBase, transform: `rotateX(90deg) translateZ(${size / 2}px)` }}>TOP</div>
            <div style={{ ...faceBase, transform: `rotateX(-90deg) translateZ(${size / 2}px)` }}>BOTTOM</div>
          </div>
        </div>
        <div className="mt-8 space-y-2 leading-tight text-[11px] pr-1">
          <div className="uppercase tracking-[0.12em] text-[9px] text-gray-400">View ref</div>
          <div className="text-white">
            <span className="text-gray-400">Yaw:</span> {yawDisplay.toFixed(1)}°
          </div>
          <div className="text-white">
            <span className="text-gray-400">Pitch:</span> {pitch.toFixed(1)}°
          </div>
          <div className="text-white">
            <span className="text-gray-400">Distance:</span> {distance.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

interface NeuralNetworkSceneProps {
  neurons: NeuronType[];
  onNeuronClick?: (id: string) => void;
  highlightedNeuronId?: string | null;
  selectedNeuronId?: string | null;
}

const NeuralNetworkScene = ({
  neurons,
  onNeuronClick,
  highlightedNeuronId,
  selectedNeuronId,
}: NeuralNetworkSceneProps) => {
  // Zozbieraj všetky spojenia
  const allConnections = neurons.flatMap((neuron) =>
    neuron.connections.map((conn) => ({ ...conn, neuronId: neuron.id }))
  );
  const [hudStats, setHudStats] = useState<HudData>({ yawDisplay: 0, yawContinuous: 0, pitch: 0, distance: 15 });
  const hudRef = useRef(hudStats);
  const handleTrackerUpdate = useCallback((data: HudData) => {
    const prevData = hudRef.current;
    if (
      Math.abs(prevData.yawDisplay - data.yawDisplay) < 0.2 &&
      Math.abs(prevData.pitch - data.pitch) < 0.2 &&
      Math.abs(prevData.distance - data.distance) < 0.02
    ) {
      return;
    }
    hudRef.current = data;
    setHudStats(data);
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#050510"]} />
        <PerformanceMonitor />
        
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
        <CameraTracker onChange={handleTrackerUpdate} />
        
        {/* Gradient pozadie */}
        <GradientBackground />

        {/* Reference grid behind the network for spatial context */}
        <ReferenceGrid />
        
        {/* Jasné farebné osvetlenie */}
        <ambientLight intensity={0.7} color="#99BBFF" />
        <pointLight position={[10, 10, 10]} intensity={3.5} color="#00D4FF" />
        <pointLight position={[-10, -10, -10]} intensity={3} color="#B565FF" />
        <pointLight position={[0, 15, 0]} intensity={2.5} color="#00FF88" />
        <spotLight position={[0, 0, 20]} intensity={2} angle={0.5} penumbra={1} color="#FFB74A" />
        
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
            isHighlighted={highlightedNeuronId === neuron.id}
            isSelected={selectedNeuronId === neuron.id}
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
      
      <ScreenReference hud={hudStats} />
      
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
