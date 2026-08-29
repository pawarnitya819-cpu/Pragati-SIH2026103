import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, RoundedBox } from "@react-three/drei";

// =========================================================
// 3D ROBOT HEAD SCENE (Pure Three.js Lighting - No Preset Errors)
// =========================================================
function RobotHead({ mousePos, isBlinking }) {
  const headGroupRef = useRef();
  const leftPupilRef = useRef();
  const rightPupilRef = useRef();

  useFrame(() => {
    if (headGroupRef.current) {
      headGroupRef.current.rotation.y += (mousePos.current.x * 0.4 - headGroupRef.current.rotation.y) * 0.1;
      headGroupRef.current.rotation.x += (-mousePos.current.y * 0.3 - headGroupRef.current.rotation.x) * 0.1;
    }

    if (leftPupilRef.current && rightPupilRef.current) {
      const targetX = mousePos.current.x * 0.12;
      const targetY = mousePos.current.y * 0.12;

      leftPupilRef.current.position.x += (targetX - leftPupilRef.current.position.x) * 0.2;
      leftPupilRef.current.position.y += (targetY - leftPupilRef.current.position.y) * 0.2;

      rightPupilRef.current.position.x += (targetX - rightPupilRef.current.position.x) * 0.2;
      rightPupilRef.current.position.y += (targetY - rightPupilRef.current.position.y) * 0.2;
    }
  });

  return (
    <group ref={headGroupRef}>
      {/* Head Outer Shell */}
      <RoundedBox args={[2.2, 1.9, 1.6]} radius={0.4} smoothness={8}>
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
      </RoundedBox>

      {/* Antenna Pole */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glowing Antenna Tip */}
      <Sphere args={[0.16, 16, 16]} position={[0, 1.45, 0]}>
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} />
      </Sphere>

      {/* Visor Screen Frame */}
      <RoundedBox args={[1.7, 1.2, 0.1]} radius={0.25} smoothness={6} position={[0, 0, 0.8]}>
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </RoundedBox>

      {/* Eyes Container */}
      {!isBlinking ? (
        <group position={[0, 0.1, 0.86]}>
          <Sphere args={[0.3, 32, 32]} position={[-0.45, 0, 0]}>
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </Sphere>
          <group position={[-0.45, 0, 0.22]} ref={leftPupilRef}>
            <Sphere args={[0.13, 16, 16]}>
              <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} />
            </Sphere>
          </group>

          <Sphere args={[0.3, 32, 32]} position={[0.45, 0, 0]}>
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
          </Sphere>
          <group position={[0.45, 0, 0.22]} ref={rightPupilRef}>
            <Sphere args={[0.13, 16, 16]}>
              <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} />
            </Sphere>
          </group>
        </group>
      ) : (
        <group position={[0, 0.1, 0.86]}>
          <RoundedBox args={[0.5, 0.05, 0.05]} radius={0.02} position={[-0.45, 0, 0]}>
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
          </RoundedBox>
          <RoundedBox args={[0.5, 0.05, 0.05]} radius={0.02} position={[0.45, 0, 0]}>
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
          </RoundedBox>
        </group>
      )}

      {/* Cheeks */}
      <Sphere args={[0.12, 16, 16]} position={[-0.65, -0.3, 0.82]}>
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} transparent opacity={0.5} />
      </Sphere>
      <Sphere args={[0.12, 16, 16]} position={[0.65, -0.3, 0.82]}>
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.6} transparent opacity={0.5} />
      </Sphere>
    </group>
  );
}

// =========================================================
// MAIN AI COPILOT WIDGET
// =========================================================
export default function AiCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  const mousePos = useRef({ x: 0, y: 0 });
  const idleTimer = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        mousePos.current = { x: 0, y: 0 };
      }, 700);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  useEffect(() => {
    let timeoutId, blinkTimeoutId;
    const scheduleBlink = () => {
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        blinkTimeoutId = setTimeout(() => setIsBlinking(false), 150);
        scheduleBlink();
      }, 3000 + Math.random() * 3000);
    };
    scheduleBlink();

    const handleClick = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    window.addEventListener("click", handleClick);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(blinkTimeoutId);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000]">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="absolute bottom-[75px] right-0 w-[330px] max-w-[90vw] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold">PRAGATI AI Copilot</p>
              <p className="text-[10px] text-slate-400">Infrastructure Intelligence Engine</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white text-lg font-bold">
              ×
            </button>
          </div>

          <div className="p-4 bg-slate-50 max-h-[380px] overflow-y-auto">
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 leading-relaxed mb-3 space-y-2">
              <p>👋 Hi! I'm the PRAGATI AI Copilot.</p>
              <p>
                <strong>PRAGATI</strong> (Pro-Active Governance and Timely Implementation) tracks big government
                infrastructure projects — like highways, railways, and power plants — across India.
              </p>
              <p>This chatbot is a preview build for evaluation — full AI features are coming in the next version.</p>
            </div>

            {!showRoadmap ? (
              <button
                onClick={() => setShowRoadmap(true)}
                className="w-full text-left bg-amber-100 hover:bg-amber-200/70 border border-amber-500/30 text-amber-700 text-xs font-bold px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                ⚡ Want to know what's coming in v2.0?
              </button>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 leading-relaxed space-y-2">
                <p className="font-bold text-slate-900 mb-1">Planned for v2.0:</p>
                <ul className="space-y-1.5">
                  <li>🗺️ <strong>Geospatial map</strong> — tap on your state or city to explore project data visually</li>
                  <li>🤖 <strong>A user-friendly AI chatbot</strong> — to help guide users through the platform</li>
                  <li>📊 <strong>Full AI-powered project analysis</strong></li>
                  <li>🌫️ <strong>Pollution & environmental impact analysis</strong></li>
                  <li>📅 <strong>Upcoming projects overview</strong> — track timelines and details of future developments</li>
                  <li>✨ ...and more coming soon</li>
                </ul>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-200">
            <input
              type="text"
              placeholder="AI Copilot offline during evaluation..."
              disabled
              className="w-full px-3 py-2 rounded-md border border-slate-300 bg-slate-100 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>
      )}

      {/* 3D BOT BUTTON CONTAINER */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        title="PRAGATI AI Copilot Preview"
        aria-label="PRAGATI AI Copilot"
        className="relative h-14 w-14 rounded-full bg-[#071a33] shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 overflow-hidden border border-slate-700 block"
      >
        <Canvas camera={{ position: [0, 0, 3.8], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={2.0} />
          <directionalLight position={[-5, -5, -2]} intensity={0.8} color="#0284c7" />

          <RobotHead mousePos={mousePos} isBlinking={isBlinking} />
        </Canvas>
      </button>
    </div>
  );
}