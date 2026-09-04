import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";

function ProjectSphere({ project, index, totalProjects }) {
  const meshRef = useRef(null);
  const [x, y, z] = useMemo(() => {
    // Distribute projects in a spherical pattern
    const angle = (index / totalProjects) * Math.PI * 2;
    const height = (index / totalProjects) * 8 - 4;
    const radius = 6 + (index % 3) * 2;
    return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
  }, [index, totalProjects]);

  const riskScore = project.risk_score || 0;
  let color;
  if (riskScore < 25) color = new THREE.Color(0x15803d); // Green
  else if (riskScore < 55) color = new THREE.Color(0xd97706); // Yellow
  else color = new THREE.Color(0xdc2626); // Red

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.002;
    }
  });

  return (
    <group position={[x, y, z]}>
      <Sphere ref={meshRef} args={[0.6, 32, 32]} castShadow>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} wireframe={false} />
      </Sphere>
    </group>
  );
}

export default function Project3DShowcase({ projects }) {
  const displayProjects = useMemo(() => projects.slice(0, 50), [projects]); // Limit to 50 for performance

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-navy-900 rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={0.8} castShadow />
        <pointLight position={[-10, -10, 5]} intensity={0.3} />

        {displayProjects.map((project, index) => (
          <ProjectSphere key={project.id} project={project} index={index} totalProjects={displayProjects.length} />
        ))}

        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          enableZoom={true}
          enablePan={true}
          minDistance={10}
          maxDistance={50}
        />

        <fog attach="fog" args={["#0f172a", 15, 60]} />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-sm rounded-lg p-3 text-xs text-white">
        <p className="font-semibold mb-2">Risk Level:</p>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
            <span>On Track</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Critical</span>
          </div>
        </div>
      </div>

      {/* Info text */}
      <div className="absolute top-4 left-4 text-xs text-slate-300">
        <p>Showing {displayProjects.length} of {projects.length} projects</p>
        <p className="text-[10px] text-slate-400 mt-1">Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
}
