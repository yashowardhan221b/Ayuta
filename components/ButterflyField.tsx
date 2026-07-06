"use client";

import { useEffect, useRef } from "react";

const SPRITES = [
  "/monarch-1.webp",
  "/monarch-2.webp",
  "/monarch-3.webp",
  "/monarch-4.webp",
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);

interface B {
  x: number; y: number; vx: number; vy: number;
  size: number; flap: number; phase: number; img: HTMLImageElement;
}

// Real monarch cut-outs drifting as a flock. `count` scales with lifetime hours.
export default function ButterflyField({ count = 16 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      document.body.classList.contains("reduce-fx");

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = window.innerWidth * DPR;
      H = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: -9999, y: -9999, active: false };
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX * DPR;
      pointer.y = e.clientY * DPR;
      pointer.active = true;
    };
    const onLeave = () => (pointer.active = false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    let cleanup = () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };

    // preload sprites, then start
    let loaded = 0;
    const imgs: HTMLImageElement[] = SPRITES.map((src) => {
      const im = new Image();
      im.src = src;
      im.onload = () => {
        loaded++;
        if (loaded === SPRITES.length) start(imgs);
      };
      im.onerror = () => {
        loaded++;
        if (loaded === SPRITES.length) start(imgs.filter((i) => i.naturalWidth > 0));
      };
      return im;
    });

    function start(sprites: HTMLImageElement[]) {
      if (!ctx || sprites.length === 0) return;
      const n = Math.max(6, Math.min(40, Math.round(count)));
      const flock: B[] = Array.from({ length: n }, () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.5, 0.5) * DPR, vy: rand(-0.5, 0.5) * DPR,
        size: rand(38, 92) * DPR, flap: rand(0.12, 0.26),
        phase: rand(0, Math.PI * 2),
        img: sprites[Math.floor(Math.random() * sprites.length)],
      }));

      const draw = (b: B) => {
        const asp = b.img.naturalHeight / b.img.naturalWidth || 0.8;
        const w = b.size;
        const h = w * asp;
        const flapX = 0.5 + 0.5 * Math.abs(Math.sin(b.phase)); // wing flap squash
        const heading = Math.atan2(b.vy, b.vx) + Math.PI / 2;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(heading);
        ctx.scale(flapX, 1);
        ctx.shadowColor = "rgba(251,146,60,0.5)";
        ctx.shadowBlur = 10 * DPR;
        ctx.drawImage(b.img, -w / 2, -h / 2, w, h);
        ctx.restore();
      };

      if (reduce) {
        ctx.clearRect(0, 0, W, H);
        for (const b of flock) { b.phase = 0.7; draw(b); }
        return;
      }

      let t = 0, raf = 0, running = true;
      const step = (b: B) => {
        b.vx += Math.sin(t * 0.7 + b.phase) * 0.02 * DPR;
        b.vy += Math.cos(t * 0.5 + b.phase) * 0.02 * DPR;
        if (pointer.active) {
          const dx = b.x - pointer.x, dy = b.y - pointer.y;
          const d2 = dx * dx + dy * dy, R = 150 * DPR;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 1.0 * DPR;
            b.vx += (dx / d) * f;
            b.vy += (dy / d) * f;
          }
        }
        b.vy -= 0.003 * DPR;
        b.vx *= 0.986; b.vy *= 0.986;
        const sp = Math.hypot(b.vx, b.vy), max = 1.7 * DPR;
        if (sp > max) { b.vx = (b.vx / sp) * max; b.vy = (b.vy / sp) * max; }
        b.x += b.vx; b.y += b.vy; b.phase += b.flap;
        const m = 90 * DPR;
        if (b.x < -m) b.x = W + m;
        if (b.x > W + m) b.x = -m;
        if (b.y < -m) b.y = H + m;
        if (b.y > H + m) b.y = -m;
      };
      const frame = () => {
        if (!running) return;
        t += 0.016;
        ctx.clearRect(0, 0, W, H);
        for (const b of flock) { step(b); draw(b); }
        raf = requestAnimationFrame(frame);
      };
      frame();

      const onVis = () => {
        if (document.hidden) { running = false; cancelAnimationFrame(raf); }
        else if (!running) { running = true; frame(); }
      };
      document.addEventListener("visibilitychange", onVis);

      cleanup = () => {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("visibilitychange", onVis);
      };
    }

    return () => cleanup();
  }, [count]);

  return (
    <canvas ref={ref} aria-hidden className="fixed inset-0 -z-10 pointer-events-none" />
  );
}
