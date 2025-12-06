import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import * as THREE from "three";

const PulsingCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.2);
      meshRef.current.rotation.x = t * 0.5;
      meshRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere args={[1, 64, 64]} ref={meshRef}>
        <MeshDistortMaterial
          color="#00ccff"
          emissive="#0044aa"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.8}
          distort={0.4}
          speed={2}
        />
      </Sphere>
    </Float>
  );
};

const LoadingScene = () => {
  return (
    <div className="w-full h-full absolute inset-0 bg-neuro-dark">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ccff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ff9900" />
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <PulsingCore />
      </Canvas>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="mt-32 text-center">
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase animate-pulse">NeuroBloom</h2>
          <div className="w-48 h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-neuro-cyan animate-loading-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface LoadingScreenProps {
  onFinished: () => void;
}

const LoadingScreen = ({ onFinished }: LoadingScreenProps) => {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => {
        setVisible(false);
        onFinished();
      }, 500); // Wait for fade out
    }, 2500); // Show for 2.5 seconds

    return () => clearTimeout(timer);
  }, [onFinished]);

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 transition-opacity duration-500 ease-in-out"
      style={{ opacity }}
    >
      <LoadingScene />
    </div>
  );
};

export default LoadingScreen;
