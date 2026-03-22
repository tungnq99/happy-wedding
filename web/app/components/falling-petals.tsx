"use client";

import { useEffect, useRef } from "react";

type Petal = {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  color: string;
  swing: number;
  swingSpeed: number;
  swingAmt: number;
};

const COLORS = [
  "#f9a8b5",
  "#fbc4cd",
  "#f7c5d0",
  "#fcd5de",
  "#f7b8c4",
  "#fda4af",
  "#fecdd3",
];

function createPetal(canvasWidth: number, canvasHeight: number): Petal {
  const size = 6 + Math.random() * 10;
  return {
    x: Math.random() * canvasWidth,
    y: -size - Math.random() * canvasHeight * 0.4,
    size,
    speedY: 0.6 + Math.random() * 1.2,
    speedX: (Math.random() - 0.5) * 0.6,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 2,
    opacity: 0.5 + Math.random() * 0.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    swing: Math.random() * Math.PI * 2,
    swingSpeed: 0.01 + Math.random() * 0.02,
    swingAmt: 1 + Math.random() * 2,
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  // Heart-petal shape
  const s = p.size;
  ctx.moveTo(0, -s * 0.3);
  ctx.bezierCurveTo(s * 0.6, -s, s * 1.2, s * 0.2, 0, s);
  ctx.bezierCurveTo(-s * 1.2, s * 0.2, -s * 0.6, -s, 0, -s * 0.3);
  ctx.fill();
  ctx.restore();
}

export function FallingPetals() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const COUNT = 28;
    const petals: Petal[] = Array.from({ length: COUNT }, () =>
      createPetal(width, height)
    );

    let raf: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of petals) {
        p.swing += p.swingSpeed;
        p.x += p.speedX + Math.sin(p.swing) * p.swingAmt;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > height + p.size * 2) {
          // Reset to top
          Object.assign(p, createPetal(width, height), { y: -p.size * 2 });
        }

        drawPetal(ctx, p);
      }

      raf = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10"
      aria-hidden="true"
    />
  );
}
