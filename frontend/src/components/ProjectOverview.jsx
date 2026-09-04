import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html, RoundedBox } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";
import {
  FolderKanban,
  Coins,
  TrendingUp,
  Receipt,
  CheckCircle2,
  PlusCircle,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Info,
  Layers,
  Building2,
  Clock3,
  Flame,
  Radio,
  Sparkles,
} from "lucide-react";

// ============================================================================
// 1. DATASET DEFINITIONS (MoSPI PRAGATI Live Registry)
// ============================================================================

const SECTORS = ["Roads & Highways", "Railways", "Coal", "Oil & Gas", "ALL"];
const MINISTRIES = ["MoM", "DPIIT", "MoHFW", "DWR, RD & GR", "MoHUA"];

const CATEGORY_DATA = {
  // Sector-Wise
  "Roads & Highways": {
    label: "Roads & Highways",
    subtext: "Ministry of Road Transport and Highways (MoRTH)",
    timestamp: "As of July, 2026",
    metrics: {
      projectCount: 428,
      originalCost: 184520,
      revisedCost: 201340,
      expenditure: 142890,
      completedMonth: 14,
      newlyAdded: 6,
    },
    accentColor: "#F59E0B",
    theme: "highways",
  },
  "Railways": {
    label: "Railways",
    subtext: "Ministry of Railways · Dedicated Freight & DFC",
    timestamp: "As of July, 2026",
    metrics: {
      projectCount: 294,
      originalCost: 245100,
      revisedCost: 278900,
      expenditure: 198450,
      completedMonth: 9,
      newlyAdded: 4,
    },
    accentColor: "#3B82F6",
    theme: "railways",
  },
  "Coal": {
    label: "Coal",
    subtext: "Ministry of Coal · Commercial Mining & Thermal Rail",
    timestamp: "As of July, 2026",
    metrics: {
      projectCount: 118,
      originalCost: 68400,
      revisedCost: 74200,
      expenditure: 53100,
      completedMonth: 4,
      newlyAdded: 2,
    },
    accentColor: "#6B7280",
    theme: "coal",
  },
  "Oil & Gas": {
    label: "Oil & Gas",
    subtext: "MoPNG · Strategic Petroleum Reserves & Gas Grid",
    timestamp: "As of July, 2026",
    metrics: {
      projectCount: 162,
      originalCost: 195800,
      revisedCost: 214500,
      expenditure: 168200,
      completedMonth: 7,
      newlyAdded: 3,
    },
    accentColor: "#EF4444",
    theme: "oilgas",
  },
  "ALL": {
    label: "All National Infrastructure",
    subtext: "Unified PM GatiShakti National Master Plan (NMP)",
    timestamp: "As of July, 2026",
    metrics: {
      projectCount: 1840,
      originalCost: 1420000,
      revisedCost: 1585000,
      expenditure: 1120000,
      completedMonth: 58,
      newlyAdded: 24,
    },
    accentColor: "#E09900",
    theme: "all",
  },

  // Ministry-Wise
  "MoM": {
    label: "Ministry of Mines (MoM)",
    subtext: "Geological Exploration & Critical Mineral Blocks",
    timestamp: "As of July, 2026",
    metrics: {
      projectCount: 76,
      originalCost: 42100,
      revisedCost: 45800,
      expenditure: 31200,
      completedMonth: 3,
      newlyAdded: 1,
    },
    accentColor: "#D97706",
    theme: "coal",
  },
  "DPIIT": {
    label: "DPIIT",
    subtext: "Dept for Promotion of Industry & Internal Trade",
    timestamp: "As of July, 2026",
    metrics: {
      projectCount: 142,
      originalCost: 112400,
      revisedCost: 125900,
      expenditure: 89400,
      completedMonth: 8,
      newlyAdded: 5,
    },
    accentColor: "#10B981",
    theme: "dpiit",
  },
  "MoHFW": {
    label: "MoHFW",
    subtext: "Health & Family Welfare · AIIMS Infrastructure",
    timestamp: "As of July, 2026",
    metrics: {
      projectCount: 94,
      originalCost: 68900,
      revisedCost: 72400,
      expenditure: 54100,
      completedMonth: 5,
      newlyAdded: 2,
    },
    accentColor: "#06B6D4",
    theme: "mohfw",
  },
  "DWR, RD & GR": {
    label: "DWR, RD & GR",
    subtext: "Water Resources, River Development & Ganga Rejuvenation",
    timestamp: "As of July, 2026",
    metrics: {
      projectCount: 88,
      originalCost: 79200,
      revisedCost: 86400,
      expenditure: 62700,
      completedMonth: 4,
      newlyAdded: 2,
    },
    accentColor: "#0284C7",
    theme: "water",
  },
  "MoHUA": {
    label: "MoHUA",
    subtext: "Housing and Urban Affairs · Metro Rail & Smart Cities",
    timestamp: "As of July, 2026",
    metrics: {
      projectCount: 215,
      originalCost: 265000,
      revisedCost: 294000,
      expenditure: 215400,
      completedMonth: 12,
      newlyAdded: 7,
    },
    accentColor: "#8B5CF6",
    theme: "mohua",
  },
};

// ============================================================================
// 2. PROCEDURAL ISOMETRIC 3D MODELS (Production-grade WebGL Primitives)
// ============================================================================

/** Roads & Highways: Multi-lane elevated flyover with pillars and cars */
function HighwayModel() {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Overpass Bridge Deck */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.18, 1.2]} />
        <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Yellow Center Divider */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[4.0, 0.02, 0.06]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.6} />
      </mesh>
      {/* Guard rails */}
      <mesh position={[0, 1.1, 0.58]}>
        <boxGeometry args={[4.2, 0.22, 0.06]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.1, -0.58]}>
        <boxGeometry args={[4.2, 0.22, 0.06]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Bridge Columns */}
      {[-1.3, 0, 1.3].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.26, 0.9, 16]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.7, 0.1, 0.7]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Lower Ground Roadway */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[1.5, 0.08, 4.4]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>
      {/* Moving Vehicles (Stylized Low-poly) */}
      <group position={[0.8, 1.15, 0.28]}>
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.24, 0.28]} />
          <meshStandardMaterial color="#3B82F6" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0.28, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#FEF08A" emissive="#FEF08A" emissiveIntensity={1.5} />
        </mesh>
      </group>
      <group position={[-1.0, 1.15, -0.28]}>
        <mesh castShadow>
          <boxGeometry args={[0.65, 0.28, 0.32]} />
          <meshStandardMaterial color="#EF4444" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[-0.33, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  );
}

/** Railways: Train on tracks with overhead electrification (OHE) masts */
function RailwayModel() {
  return (
    <group position={[0, -0.3, 0]}>
      {/* Ballast / Embankment */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[4.4, 0.15, 1.6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {/* Steel Rails */}
      {[-0.25, 0.25].map((z, idx) => (
        <mesh key={idx} position={[0, 0.18, z]} castShadow>
          <boxGeometry args={[4.4, 0.06, 0.05]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* Sleepers (Ties) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[-2.0 + i * 0.31, 0.14, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.9]} />
          <meshStandardMaterial color="#78716C" roughness={0.8} />
        </mesh>
      ))}
      {/* Modern Vande Bharat Locomotive */}
      <group position={[0.2, 0.45, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.2, 0.45, 0.42]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.6} roughness={0.2} />
        </mesh>
        {/* Blue aerodynamic stripe */}
        <mesh position={[0, 0, 0.22]}>
          <boxGeometry args={[2.2, 0.12, 0.01]} />
          <meshStandardMaterial color="#1D4ED8" />
        </mesh>
        {/* Headlight */}
        <mesh position={[1.11, -0.05, 0]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#BAE6FD" emissive="#38BDF8" emissiveIntensity={2.5} />
        </mesh>
      </group>
      {/* OHE Catenary Masts */}
      {[-1.4, 1.4].map((x, i) => (
        <group key={i} position={[x, 0.8, -0.65]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
            <meshStandardMaterial color="#64748B" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.65, 0.35]}>
            <boxGeometry args={[0.04, 0.04, 0.7]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Oil & Gas: Offshore Rig with flare boom, storage spheres & derrick */
function OilRigModel() {
  return (
    <group position={[0, -0.3, 0]}>
      {/* Ocean Base Plate */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.08, 32]} />
        <meshStandardMaterial color="#0E7490" roughness={0.1} metalness={0.8} />
      </mesh>
      {/* Platform Stilt Legs */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x * 0.7, 0.5, z * 0.7]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 1.0, 12]} />
          <meshStandardMaterial color="#D97706" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {/* Yellow Main Deck */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.12, 1.8]} />
        <meshStandardMaterial color="#EAB308" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Drilling Derrick Tower */}
      <group position={[-0.3, 1.6, -0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.35, 1.2, 4]} />
          <meshStandardMaterial color="#DC2626" wireframe />
        </mesh>
      </group>
      {/* Spherical Gas Storage Tank */}
      <mesh position={[0.45, 1.3, 0.4]} castShadow>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Gas Flare Boom with Emissive Flame */}
      <group position={[0.9, 1.3, -0.7]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.03, 0.03, 0.9, 8]} />
          <meshStandardMaterial color="#64748B" metalness={0.7} />
        </mesh>
        <mesh position={[0.35, 0.35, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={3.0} />
        </mesh>
      </group>
    </group>
  );
}

/** Coal: Open Cast Mine rig with stepped excavation pits and haul truck */
function CoalMineModel() {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Terraced Open-Cast Pit Steps */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.4, 0.2, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <cylinderGeometry args={[1.7, 1.9, 0.25, 24]} />
        <meshStandardMaterial color="#1E293B" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.3, 0.25, 24]} />
        <meshStandardMaterial color="#0F172A" roughness={1.0} />
      </mesh>
      {/* Yellow Heavy Excavator */}
      <group position={[-0.4, 0.75, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.3, 0.35]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Boom Arm */}
        <mesh position={[0.3, 0.25, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.55, 0.08, 0.08]} />
          <meshStandardMaterial color="#D97706" />
        </mesh>
      </group>
      {/* Coal Haul Truck */}
      <group position={[0.5, 0.5, -0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.22, 0.26]} />
          <meshStandardMaterial color="#EA580C" metalness={0.4} />
        </mesh>
        <mesh position={[-0.1, 0.12, 0]}>
          <boxGeometry args={[0.3, 0.15, 0.24]} />
          <meshStandardMaterial color="#020617" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/** Urban / Smart Cities (MoHUA & ALL): Sleek glass skyscraper cluster */
function UrbanModel() {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Ground Plaza Base */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.1, 3.2]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
      </mesh>
      {/* Central Glass Tower */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.7, 2.6, 0.7]} />
        <meshStandardMaterial color="#0284C7" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Tower Rooftop Beacon */}
      <mesh position={[0, 2.75, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={3.0} />
      </mesh>
      {/* Surrounding High-Rises */}
      <mesh position={[-0.8, 0.9, -0.6]} castShadow>
        <boxGeometry args={[0.55, 1.7, 0.55]} />
        <meshStandardMaterial color="#0EA5E9" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.8, 0.7, 0.6]} castShadow>
        <boxGeometry args={[0.6, 1.3, 0.6]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.7, 0.5, 0.7]} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.5]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Green Tree Accents */}
      {[
        [0.8, -0.7],
        [1.1, -0.3],
        [-1.1, -0.2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.25, z]}>
          <coneGeometry args={[0.15, 0.4, 8]} />
          <meshStandardMaterial color="#10B981" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Water Resources (DWR): Reservoir dam with spillway */
function WaterDamModel() {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Mountain Base */}
      <mesh position={[-1.2, 0.6, 0]} castShadow>
        <coneGeometry args={[1.1, 1.4, 6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      <mesh position={[1.2, 0.6, 0]} castShadow>
        <coneGeometry args={[1.1, 1.4, 6]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      {/* Concrete Gravity Dam Wall */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.1, 0.5]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.6} />
      </mesh>
      {/* Water Reservoir (Top) */}
      <mesh position={[0, 0.9, -0.6]}>
        <boxGeometry args={[1.7, 0.1, 0.9]} />
        <meshStandardMaterial color="#0284C7" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Downstream River Flow */}
      <mesh position={[0, 0.05, 0.9]}>
        <boxGeometry args={[0.9, 0.05, 1.4]} />
        <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

/** Healthcare (MoHFW): Hospital campus with helipad */
function HospitalModel() {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Main Medical Block */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[1.8, 1.3, 1.2]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>
      {/* Red Cross Emblem */}
      <mesh position={[0, 0.9, 0.62]}>
        <boxGeometry args={[0.3, 0.08, 0.02]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 0.9, 0.62]}>
        <boxGeometry args={[0.08, 0.3, 0.02]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} />
      </mesh>
      {/* Helipad on Roof */}
      <mesh position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.04, 24]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Emergency Ambulance */}
      <group position={[0.7, 0.16, 0.9]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.22, 0.24]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={3.0} />
        </mesh>
      </group>
    </group>
  );
}

/** Dynamic 3D Model Switcher with GSAP Scale & Rotation Choreography */
function IsometricSceneContent({ theme, categoryKey }) {
  const modelGroupRef = useRef(null);

  // GSAP Pop and Spin Transition when category changes
  useEffect(() => {
    if (!modelGroupRef.current) return;

    const ctx = gsap.context(() => {
      // Exit animation
      gsap.to(modelGroupRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          // Enter spring pop
          gsap.fromTo(
            modelGroupRef.current.scale,
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 1, z: 1, duration: 0.65, ease: "back.out(1.8)" }
          );
          gsap.fromTo(
            modelGroupRef.current.rotation,
            { y: modelGroupRef.current.rotation.y + 1.2 },
            { y: modelGroupRef.current.rotation.y, duration: 0.65, ease: "power2.out" }
          );
        },
      });
    });

    return () => ctx.revert();
  }, [categoryKey]);

  // Subtle natural idle float
  useFrame((state) => {
    if (modelGroupRef.current) {
      modelGroupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.04;
    }
  });

  return (
    <group ref={modelGroupRef}>
      {theme === "highways" && <HighwayModel />}
      {theme === "railways" && <RailwayModel />}
      {theme === "oilgas" && <OilRigModel />}
      {theme === "coal" && <CoalMineModel />}
      {theme === "water" && <WaterDamModel />}
      {theme === "mohfw" && <HospitalModel />}
      {(theme === "mohua" || theme === "dpiit" || theme === "all") && <UrbanModel />}
    </group>
  );
}

// ============================================================================
// 3. ANIMATED NUMBER COUNTER (GSAP Powered)
// ============================================================================

function CountUpMetric({ value, prefix = "", suffix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetRef = useRef({ val: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(targetRef.current, {
        val: value,
        duration: 1.1,
        ease: "power2.out",
        onUpdate: () => {
          setDisplayValue(Math.round(targetRef.current.val));
        },
      });
    });
    return () => ctx.revert();
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

// ============================================================================
// 4. MAIN PROJECT OVERVIEW COMPONENT
// ============================================================================

export default function ProjectOverview() {
  // Navigation State
  const [viewMode, setViewMode] = useState("Sector-Wise"); // "Ministry-Wise" | "Sector-Wise"
  const [activeCategory, setActiveCategory] = useState("Roads & Highways");
  const [activeTooltip, setActiveTooltip] = useState(null);

  const categoryListRef = useRef(null);

  // Active Category Data
  const currentData = useMemo(() => {
    return CATEGORY_DATA[activeCategory] || CATEGORY_DATA["ALL"];
  }, [activeCategory]);

  // Handle Mode Change
  const handleViewModeSelect = (mode) => {
    setViewMode(mode);
    if (mode === "Sector-Wise") {
      setActiveCategory("Roads & Highways");
    } else {
      setActiveCategory("MoM");
    }
  };

  // Scroll Category List
  const scrollCategoryList = (direction) => {
    if (categoryListRef.current) {
      categoryListRef.current.scrollBy({
        top: direction === "up" ? -100 : 100,
        behavior: "smooth",
      });
    }
  };

  const activeCategories = viewMode === "Sector-Wise" ? SECTORS : MINISTRIES;

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
          TOP BAR: Segmented Control with Framer Motion layoutId
         ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-display font-extrabold text-xl text-navy-900">
              National Infrastructure Overview
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            PM GatiShakti Multi-Modal Connectivity Dashboard · MoSPI Central Registry
          </p>
        </div>

        {/* Segmented Pillar Switcher */}
        <div className="relative flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          {["Sector-Wise", "Ministry-Wise"].map((mode) => {
            const isActive = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleViewModeSelect(mode)}
                className={`relative px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-colors z-10 ${
                  isActive ? "text-white" : "text-slate-700 hover:text-navy-900"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="segmentedPillar"
                    className="absolute inset-0 bg-[#E09900] rounded-lg shadow-md -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* -------------------------------------------------------------
          MAIN 3-COLUMN LAYOUT: Sidebar + Metrics Card + 3D Viewport
         ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =============================================================
            LEFT COLUMN (3 Cols): Floating Vertical Category Selector
           ============================================================= */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col h-[580px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {viewMode} Categories
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => scrollCategoryList("up")}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition"
                title="Scroll Up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollCategoryList("down")}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition"
                title="Scroll Down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List items with active pill & scale pop */}
          <div
            ref={categoryListRef}
            className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar"
          >
            {activeCategories.map((catKey) => {
              const isActive = activeCategory === catKey;
              const catObj = CATEGORY_DATA[catKey] || {};

              return (
                <motion.button
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  whileHover={{ scale: isActive ? 1.0 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                    isActive
                      ? "bg-[#E09900] text-white shadow-md shadow-[#E09900]/25 font-bold"
                      : "bg-slate-50/80 hover:bg-slate-100 text-slate-700 font-medium"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-xs sm:text-sm truncate">{catKey}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? "text-amber-100" : "text-slate-400"
                      }`}
                    >
                      {catObj.metrics?.projectCount || 0} active projects
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isActive ? "translate-x-0.5 text-white" : "text-slate-300"
                    }`}
                  />
                </motion.button>
              );
            })}
          </div>

          {/* Bottom badge */}
          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>MoSPI Central Rep.</span>
            <span className="font-mono">SIH-2026</span>
          </div>
        </div>

        {/* =============================================================
            CENTER COLUMN (5 Cols): Central Data Card (2x3 Metrics Grid)
           ============================================================= */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[580px]">
          {/* Header Bar in Dark Navy (#0C1938) */}
          <div className="bg-[#0C1938] text-white p-5 border-b border-navy-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E09900] text-white uppercase tracking-wider mb-1">
                  Active Focus
                </span>
                <h2 className="text-lg sm:text-xl font-display font-black tracking-tight">
                  {currentData.label}
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-300 bg-white/10 px-2.5 py-1 rounded-md">
                {currentData.timestamp}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-1">
              {currentData.subtext}
            </p>
          </div>

          {/* 2x3 Grid Displaying 6 Metric Cards */}
          <div className="p-5 grid grid-cols-2 gap-4 flex-1 content-between">
            {/* Metric 1: Project Count */}
            <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 hover:bg-slate-50 transition relative group">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <FolderKanban className="h-4 w-4 text-[#E09900]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Project Count
                  </span>
                </div>
                <button
                  onMouseEnter={() => setActiveTooltip("count")}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-xl sm:text-2xl font-black text-navy-900 font-display">
                <CountUpMetric value={currentData.metrics.projectCount} suffix=" No." />
              </div>
              {activeTooltip === "count" && (
                <div className="absolute z-20 bottom-full left-2 mb-2 p-2 bg-slate-900 text-white text-[10px] rounded-md shadow-lg max-w-[180px]">
                  Total number of sanctioned infrastructure works currently registered.
                </div>
              )}
            </div>

            {/* Metric 2: Original Cost */}
            <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 hover:bg-slate-50 transition relative group">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-emerald-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Original Cost
                  </span>
                </div>
                <button
                  onMouseEnter={() => setActiveTooltip("origCost")}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-xl sm:text-2xl font-black text-navy-900 font-display">
                <CountUpMetric
                  value={currentData.metrics.originalCost}
                  prefix="₹"
                  suffix=" Cr"
                />
              </div>
              {activeTooltip === "origCost" && (
                <div className="absolute z-20 bottom-full left-2 mb-2 p-2 bg-slate-900 text-white text-[10px] rounded-md shadow-lg max-w-[180px]">
                  Approved baseline budget at time of CCEA / Cabinet Committee sanction.
                </div>
              )}
            </div>

            {/* Metric 3: Latest Revised Cost */}
            <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 hover:bg-slate-50 transition relative group">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-rose-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Revised Cost
                  </span>
                </div>
                <button
                  onMouseEnter={() => setActiveTooltip("revCost")}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-xl sm:text-2xl font-black text-navy-900 font-display">
                <CountUpMetric
                  value={currentData.metrics.revisedCost}
                  prefix="₹"
                  suffix=" Cr"
                />
              </div>
              {activeTooltip === "revCost" && (
                <div className="absolute z-20 bottom-full left-2 mb-2 p-2 bg-slate-900 text-white text-[10px] rounded-md shadow-lg max-w-[180px]">
                  Latest anticipated financial outlay including escalation and scope shifts.
                </div>
              )}
            </div>

            {/* Metric 4: Expenditure (Cumm.) */}
            <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 hover:bg-slate-50 transition relative group">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Expenditure
                  </span>
                </div>
                <button
                  onMouseEnter={() => setActiveTooltip("exp")}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-xl sm:text-2xl font-black text-navy-900 font-display">
                <CountUpMetric
                  value={currentData.metrics.expenditure}
                  prefix="₹"
                  suffix=" Cr"
                />
              </div>
              {activeTooltip === "exp" && (
                <div className="absolute z-20 bottom-full left-2 mb-2 p-2 bg-slate-900 text-white text-[10px] rounded-md shadow-lg max-w-[180px]">
                  Cumulative audited funds disbursed to executing contractors to date.
                </div>
              )}
            </div>

            {/* Metric 5: Completed During Month */}
            <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 hover:bg-slate-50 transition relative group">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Completed (Mo)
                  </span>
                </div>
                <button
                  onMouseEnter={() => setActiveTooltip("comp")}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-display">
                <CountUpMetric value={currentData.metrics.completedMonth} suffix=" No." />
              </div>
              {activeTooltip === "comp" && (
                <div className="absolute z-20 bottom-full left-2 mb-2 p-2 bg-slate-900 text-white text-[10px] rounded-md shadow-lg max-w-[180px]">
                  Milestones and packages verified 100% physically handed over this month.
                </div>
              )}
            </div>

            {/* Metric 6: Newly Added */}
            <div className="p-4 rounded-xl border border-gray-200 bg-slate-50/50 hover:bg-slate-50 transition relative group">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <PlusCircle className="h-4 w-4 text-indigo-500" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Newly Added
                  </span>
                </div>
                <button
                  onMouseEnter={() => setActiveTooltip("added")}
                  onMouseLeave={() => setActiveTooltip(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="text-xl sm:text-2xl font-black text-indigo-600 font-display">
                <CountUpMetric value={currentData.metrics.newlyAdded} suffix=" No." />
              </div>
              {activeTooltip === "added" && (
                <div className="absolute z-20 bottom-full left-2 mb-2 p-2 bg-slate-900 text-white text-[10px] rounded-md shadow-lg max-w-[180px]">
                  Fresh projects onboarded to the monitoring registry in the current cycle.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =============================================================
            RIGHT COLUMN (4 Cols): Interactive 3D Canvas (WebGL R3F)
           ============================================================= */}
        <div className="lg:col-span-4 bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden flex flex-col h-[580px] relative">
          {/* Viewport Floating Header */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-semibold flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-[#E09900] animate-pulse" />
              <span>360° Isometric Model</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950/60 backdrop-blur-md px-2 py-1 rounded">
              Auto-Rotate 2.5x
            </span>
          </div>

          {/* R3F 3D Canvas Engine */}
          <div className="w-full h-full">
            <Canvas
              shadows
              camera={{ position: [5, 4.5, 5], fov: 42 }}
              gl={{ antialias: true, alpha: true }}
            >
              {/* Scene Lighting Setup */}
              <ambientLight intensity={0.8} />
              <directionalLight
                position={[8, 12, 6]}
                intensity={1.4}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-near={0.5}
                shadow-camera-far={25}
                shadow-camera-left={-4}
                shadow-camera-right={4}
                shadow-camera-top={4}
                shadow-camera-bottom={-4}
              />
              <pointLight position={[-6, 4, -4]} intensity={0.6} color="#38BDF8" />

              {/* Realistic Contact Shadows onto Invisible Ground */}
              <ContactShadows
                position={[0, -0.6, 0]}
                opacity={0.55}
                scale={7}
                blur={1.8}
                far={4}
              />

              {/* Dynamic Isometric Model Assembly */}
              <Suspense
                fallback={
                  <Html center>
                    <div className="flex flex-col items-center gap-2 text-white">
                      <div className="w-6 h-6 border-2 border-[#E09900] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-mono text-slate-300">
                        Synthesizing Mesh…
                      </span>
                    </div>
                  </Html>
                }
              >
                <IsometricSceneContent
                  theme={currentData.theme}
                  categoryKey={activeCategory}
                />
              </Suspense>

              {/* 360-Degree Continuous OrbitControls with Damping */}
              <OrbitControls
                enableZoom={true}
                minDistance={4}
                maxDistance={14}
                autoRotate={true}
                autoRotateSpeed={2.5}
                enableDamping={true}
                dampingFactor={0.05}
                maxPolarAngle={Math.PI / 2.2} // Locked to clean isometric perspective
              />

              {/* Subtle Post-processing Bloom for glowing indicator lights */}
              <EffectComposer>
                <Bloom
                  luminanceThreshold={0.7}
                  luminanceSmoothing={0.9}
                  height={300}
                  intensity={0.6}
                />
              </EffectComposer>
            </Canvas>
          </div>

          {/* Viewport Floating Footer Controls Notice */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none text-[11px] text-slate-400 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
            <span>Drag to inspect angle</span>
            <span>Pinch / Scroll to zoom</span>
          </div>
        </div>
      </div>
    </div>
  );
}
