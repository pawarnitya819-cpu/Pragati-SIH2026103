import { useEffect, useRef } from "react";

// Ambient particle field: dots drift continuously, and nearby dots get
// pushed away from the cursor, opening a "clear" halo that follows the
// mouse. Purely decorative — sits behind real content via z-index, and
// pointer-events are disabled so it never blocks clicks.
//
// Usage:
//   <div className="relative">
//     <ParticleBackground />
//     <div className="relative z-10"> ...your real content... </div>
//   </div>

const MAX_SPEED = 0.3;
const LINK_DISTANCE = 150;
const MOUSE_RADIUS = 170;
const MOUSE_PUSH = 0.08;
const DOT_RGB = "37, 99, 235";    // brighter blue
const LINE_RGB = "37, 99, 235";
// density = particles per this many square px of screen — lower = denser
const DENSITY = 4000;

export default function ParticleBackground({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;

             let width, height, particles, rafId;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      // canvas is position:fixed, so it should match the viewport,
      // not its parent element's box.
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const makeParticles = () => {
      const count = Math.min(500, Math.floor((width * height) / DENSITY));
      return Array.from({ length: count }, () => ({

        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * MAX_SPEED,
        vy: (Math.random() - 0.5) * MAX_SPEED,
        r: Math.random() * 1.6 + 1,
      }));
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * MOUSE_RADIUS * MOUSE_PUSH;
          p.y += Math.sin(angle) * force * MOUSE_RADIUS * MOUSE_PUSH;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DOT_RGB}, 0.75)`;
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DISTANCE) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${LINE_RGB}, ${(1 - dist / LINK_DISTANCE) * 0.35})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(step);
    };

    resize();
    particles = makeParticles();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    step();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
           className={`fixed inset-0 z-0 pointer-events-none ${className}`}
    />
  );
}