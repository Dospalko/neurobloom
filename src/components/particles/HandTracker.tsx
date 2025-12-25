import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandTrackerProps {
  onTensionChange: (tension: number) => void;
  onHandMove: (x: number, y: number, velocity: number) => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onTensionChange, onHandMove }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const requestRef = useRef<number>();
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  
  // For velocity calculation
  const lastPositionRef = useRef<{x: number, y: number} | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const initHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        
        setLoading(false);
        startWebcam();
      } catch (err) {
        console.error("Error initializing hand landmarker:", err);
        setError("Failed to load hand tracking model.");
        setLoading(false);
      }
    };

    initHandLandmarker();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Camera access denied.");
    }
  };

  const predictWebcam = () => {
    if (!handLandmarkerRef.current || !videoRef.current) return;

    const currentTime = performance.now();
    // Throttle prediction to ~30fps (33ms) to save CPU
    if (currentTime - lastTimeRef.current < 33) {
        requestRef.current = requestAnimationFrame(predictWebcam);
        return;
    }

    if (lastVideoTimeRef.current !== videoRef.current.currentTime) {
      lastVideoTimeRef.current = videoRef.current.currentTime;
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, currentTime);
      
      if (results.landmarks && results.landmarks.length > 0) {
        let totalTension = 0;
        let avgX = 0;
        let avgY = 0;
        
        results.landmarks.forEach(landmarks => {
            // Tension Logic
            const wrist = landmarks[0];
            const tips = [4, 8, 12, 16, 20];
            
            let avgDist = 0;
            tips.forEach(tipIdx => {
                const tip = landmarks[tipIdx];
                const dist = Math.sqrt(
                    Math.pow(tip.x - wrist.x, 2) + 
                    Math.pow(tip.y - wrist.y, 2) + 
                    Math.pow(tip.z - wrist.z, 2)
                );
                avgDist += dist;
            });
            avgDist /= tips.length;
            
            const closedThreshold = 0.15;
            const openThreshold = 0.35;
            
            let handTension = (openThreshold - avgDist) / (openThreshold - closedThreshold);
            handTension = Math.max(0, Math.min(1, handTension));
            totalTension += handTension;

            // Position Logic (Centroid of wrist + middle finger knuckle + middle finger tip)
            // Using wrist (0) and middle finger mcp (9) is usually stable
            avgX += landmarks[9].x;
            avgY += landmarks[9].y;
        });
        
        const handCount = results.landmarks.length;
        const finalTension = totalTension / handCount;
        avgX /= handCount;
        avgY /= handCount;

        // Invert X because webcam is mirrored
        const finalX = 1 - avgX; 
        const finalY = avgY; // 0 is top, 1 is bottom

        // Velocity Calculation
        let velocity = 0;
        if (lastPositionRef.current) {
            const dx = finalX - lastPositionRef.current.x;
            const dy = finalY - lastPositionRef.current.y;
            const dt = (currentTime - lastTimeRef.current) / 1000; // seconds
            if (dt > 0) {
                const speed = Math.sqrt(dx*dx + dy*dy) / dt;
                velocity = speed;
            }
        }

        lastPositionRef.current = { x: finalX, y: finalY };
        lastTimeRef.current = currentTime;

        onTensionChange(finalTension);
        onHandMove(finalX, finalY, velocity);

      } else {
          onTensionChange(0);
          // Decay velocity if no hand found?
          onHandMove(0.5, 0.5, 0); 
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="relative w-full h-full bg-black">
      {loading && <div className="absolute inset-0 flex items-center justify-center text-white text-xs">Načítavam model...</div>}
      {error && <div className="absolute inset-0 flex items-center justify-center text-red-500 text-xs text-center p-2">{error === "Failed to load hand tracking model." ? "Nepodarilo sa načítať model sledovania rúk." : error === "Camera access denied." ? "Prístup ku kamere zamietnutý." : error}</div>}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover transform -scale-x-100" // Mirror effect
      />
    </div>
  );
};
