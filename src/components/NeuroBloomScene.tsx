import { MutableRefObject, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Points,
  PointMaterial,
  GradientTexture,
  Float,
  Html,
  PerformanceMonitor
} from "@react-three/drei";
import * as THREE from "three";

type NetworkSeed = {
  base: THREE.Vector3;
  offset: number;
  speed: number;
  amplitude: number;
  growthDelay: number;
};

type Connection = {
  a: number;
  b: number;
  phase: number;
  intensity: number;
};

const TOTAL_NEURONS = 420;
const TOTAL_CONNECTIONS = 260;

const generateSeeds = (count: number) =>
  Array.from({ length: count }, () => {
    const radius = 2.4 + Math.random() * 2.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return {
      base: new THREE.Vector3(x, y, z),
      offset: Math.random() * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.32,
      amplitude: 0.3 + Math.random() * 0.6,
      growthDelay: Math.random() * 18
    } satisfies NetworkSeed;
  });

const generateConnections = (count: number, nodeCount: number) =>
  Array.from({ length: count }, () => {
    const a = Math.floor(Math.random() * nodeCount);
    const b = (a + Math.floor(Math.random() * 28) + 1) % nodeCount;
    return {
      a,
      b,
      phase: Math.random() * Math.PI * 2,
      intensity: 0.3 + Math.random() * 0.7
    } satisfies Connection;
  });

const NetworkPoints = ({
  elapsed,
  seeds,
  onPositionUpdate
}: {
  elapsed: MutableRefObject<number>;
  seeds: NetworkSeed[];
  onPositionUpdate: (index: number, x: number, y: number, z: number) => void;
}) => {
  const positions = useMemo(() => new Float32Array(TOTAL_NEURONS * 3), []);
  const colors = useMemo(() => new Float32Array(TOTAL_NEURONS * 3), []);
  const pointsRef = useRef<THREE.Points>(null);
  const drawCount = useRef(24);
  const reusableColor = useMemo(() => new THREE.Color(), []);

  useFrame((state, delta) => {
    elapsed.current = state.clock.elapsedTime;

    const growthSpeed = 28;
    drawCount.current = Math.min(
      TOTAL_NEURONS,
      drawCount.current + Math.max(1, Math.floor(delta * growthSpeed))
    );

    const breathing = 0.22 + Math.sin(state.clock.elapsedTime * 0.6) * 0.08;

    for (let i = 0; i < drawCount.current; i += 1) {
      const { base, offset, speed, amplitude, growthDelay } = seeds[i];
      const phase = state.clock.elapsedTime * speed + offset;
      const growthFactor = Math.min(
        1,
        Math.max(0, (state.clock.elapsedTime - growthDelay) / 6)
      );
      const sway = Math.sin(phase) * amplitude * 0.35;
      const expansion = 1 + growthFactor * 0.35;
      const px = base.x * expansion + Math.sin(phase * 0.9) * breathing + sway;
      const py =
        base.y * expansion +
        Math.cos(phase * 1.1) * breathing * 0.7 +
        Math.sin(phase * 0.5) * 0.3;
      const pz =
        base.z * expansion +
        Math.sin(phase) * breathing * 0.8 +
        Math.cos(phase * 0.6) * 0.4;

      const idx = i * 3;
      positions[idx] = px;
      positions[idx + 1] = py;
      positions[idx + 2] = pz;

      const hue = 0.62 - growthFactor * 0.18 + Math.sin(phase) * 0.02;
      const lightness = 0.55 + Math.sin(phase * 0.5) * 0.1 + growthFactor * 0.12;
      reusableColor.setHSL(hue, 0.9, Math.min(0.8, Math.max(0.3, lightness)));
      colors[idx] = reusableColor.r;
      colors[idx + 1] = reusableColor.g;
      colors[idx + 2] = reusableColor.b;

      onPositionUpdate(i, px, py, pz);
    }

    if (pointsRef.current) {
      const geometry = pointsRef.current.geometry;
      geometry.setDrawRange(0, drawCount.current);
      const positionAttr = geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      positionAttr.array = positions;
      positionAttr.needsUpdate = true;

      const colorAttr = geometry.getAttribute("color") as THREE.BufferAttribute;
      if (colorAttr) {
        colorAttr.needsUpdate = true;
      } else {
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      }
    }
  });

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      stride={3}
      frustumCulled={false}
      rotation={[0, Math.PI * 0.2, 0]}
    >
      <PointMaterial transparent size={0.16} vertexColors depthWrite={false} />
    </Points>
  );
};

const NetworkConnections = ({
  elapsed,
  getPosition
}: {
  elapsed: MutableRefObject<number>;
  getPosition: (index: number) => THREE.Vector3 | undefined;
}) => {
  const connections = useMemo(
    () => generateConnections(TOTAL_CONNECTIONS, TOTAL_NEURONS),
    []
  );
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const linePositions = useMemo(
    () => new Float32Array(TOTAL_CONNECTIONS * 6),
    []
  );
  const opacities = useMemo(() => new Float32Array(TOTAL_CONNECTIONS), []);
  const drawCount = useRef(18);

  useFrame((_state, delta) => {
    drawCount.current = Math.min(
      connections.length,
      drawCount.current + Math.max(1, Math.floor(delta * 14))
    );

    for (let i = 0; i < drawCount.current; i += 1) {
      const { a, b, phase, intensity } = connections[i];

      const aPos = getPosition(a);
      const bPos = getPosition(b);
      const idx = i * 6;
      if (!aPos || !bPos) {
        opacities[i] = 0;
        linePositions[idx] = 0;
        linePositions[idx + 1] = 0;
        linePositions[idx + 2] = 0;
        linePositions[idx + 3] = 0;
        linePositions[idx + 4] = 0;
        linePositions[idx + 5] = 0;
        continue;
      }

      const activation =
        0.45 +
        Math.sin(elapsed.current * 1.1 + phase) * 0.35 +
        Math.random() * 0.1;

      opacities[i] = Math.min(1, Math.max(0.2, activation * intensity));

      linePositions[idx] = aPos.x;
      linePositions[idx + 1] = aPos.y;
      linePositions[idx + 2] = aPos.z;
      linePositions[idx + 3] = bPos.x;
      linePositions[idx + 4] = bPos.y;
      linePositions[idx + 5] = bPos.z;
    }

    if (geometryRef.current) {
      geometryRef.current.setDrawRange(0, drawCount.current * 2);
      const positionAttr = geometryRef.current.getAttribute(
        "position"
      ) as THREE.BufferAttribute;
      const opacityAttr = geometryRef.current.getAttribute(
        "opacity"
      ) as THREE.BufferAttribute;
      if (positionAttr) {
        positionAttr.needsUpdate = true;
      }
      if (opacityAttr) {
        opacityAttr.needsUpdate = true;
      }
    }
  });

  return (
    <lineSegments>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach={"attributes-position"}
          count={linePositions.length / 3}
          array={linePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach={"attributes-opacity"}
          count={opacities.length}
          array={opacities}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        vertexShader={lineVertexShader}
        fragmentShader={lineFragmentShader}
        uniforms={{
          uColorA: { value: new THREE.Color("#6fdfff") },
          uColorB: { value: new THREE.Color("#a06dff") }
        }}
      />
    </lineSegments>
  );
};

const lineVertexShader = /* glsl */ `
  attribute float opacity;
  varying float vOpacity;
  varying vec3 vPos;

  void main() {
    vOpacity = opacity;
    vPos = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const lineFragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying float vOpacity;
  varying vec3 vPos;

  void main() {
    float gradient = smoothstep(-3.0, 3.0, vPos.y);
    vec3 color = mix(uColorA, uColorB, gradient);
    gl_FragColor = vec4(color, vOpacity);
    if (gl_FragColor.a < 0.05) discard;
  }
`;

const ActivationPulse = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const scale = 6 + Math.sin(state.clock.elapsedTime * 0.8) * 0.6;
    if (meshRef.current) {
      meshRef.current.rotation.set(
        Math.sin(state.clock.elapsedTime * 0.2) * 0.15,
        Math.cos(state.clock.elapsedTime * 0.24) * 0.2,
        Math.sin(state.clock.elapsedTime * 0.18) * 0.1
      );
      meshRef.current.scale.setScalar(scale);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.06;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial transparent wireframe opacity={0.06} />
    </mesh>
  );
};

const NeuroNetwork = () => {
  const elapsed = useRef(0);
  const seeds = useMemo(() => generateSeeds(TOTAL_NEURONS), []);
  const seedPositions = useRef<THREE.Vector3[]>(
    Array.from({ length: TOTAL_NEURONS }, () => new THREE.Vector3())
  );
  const activeFlags = useRef<boolean[]>(
    Array.from({ length: TOTAL_NEURONS }, () => false)
  );

  const handlePositionUpdate = (index: number, x: number, y: number, z: number) => {
    seedPositions.current[index].set(x, y, z);
    activeFlags.current[index] = true;
  };

  const getPosition = (index: number) =>
    activeFlags.current[index] ? seedPositions.current[index] : undefined;

  return (
    <>
      <NetworkConnections elapsed={elapsed} getPosition={getPosition} />
      <Float floatIntensity={0.6} speed={1.8}>
        <NetworkPoints
          elapsed={elapsed}
          seeds={seeds}
          onPositionUpdate={handlePositionUpdate}
        />
      </Float>
      <ActivationPulse />
    </>
  );
};

const BackgroundField = () => (
  <mesh scale={14}>
    <sphereGeometry args={[1, 32, 32]} />
    <meshBasicMaterial side={THREE.BackSide}>
      <GradientTexture
        stops={[0, 0.6, 1]}
        colors={["#040510", "#111b34", "#48174c"]}
        size={32}
      />
    </meshBasicMaterial>
  </mesh>
);

const SceneLighting = () => (
  <>
    <ambientLight intensity={0.2} />
    <pointLight position={[0, 4, 6]} intensity={1.8} color="#8ecbff" />
    <pointLight position={[-6, -2, -4]} intensity={1.2} color="#7d40ff" />
    <spotLight
      position={[8, 8, 6]}
      angle={0.45}
      penumbra={0.3}
      intensity={0.8}
      color="#c7f8ff"
    />
  </>
);

const SceneOverlay = () => (
  <Html pointerEvents="none" center position={[0, -3, 0]}>
    <div className="scene-caption">
      uči sa · vyvíja · starne · adaptuje sa
    </div>
  </Html>
);

const NeuroBloomScene = () => (
  <Canvas
    camera={{ position: [0, 0, 9], fov: 55, near: 0.1, far: 40 }}
    gl={{ antialias: true }}
  >
    <color attach="background" args={["#050410"]} />
    <PerformanceMonitor />
    <SceneLighting />
    <BackgroundField />
    <NeuroNetwork />
    <SceneOverlay />
    <OrbitControls
      enablePan={false}
      enableZoom={false}
      autoRotate
      autoRotateSpeed={0.5}
    />
  </Canvas>
);

export default NeuroBloomScene;
