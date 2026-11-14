"use client";
import { useEffect, useRef } from "react";
import { modelScenario, type Scenario } from "@/lib/scenario";
import { flameParticle } from "@/lib/flame-motion";
// CPU projection of a three-dimensional luminous shell, for WebGL-disabled devices.
// Every point has real XYZ coordinates; this is an artistic model, not a measured field.
export default function CanvasFlame({
  scenario,
  paused,
  wireframe,
  resetKey,
  activityOverride,
  speed = 1,
}: {
  scenario: Scenario;
  paused: boolean;
  wireframe: boolean;
  resetKey: number;
  activityOverride?: number;
  speed?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const latest = useRef({
    scenario,
    paused,
    wireframe,
    resetKey,
    activityOverride,
    speed,
  });
  useEffect(() => {
    latest.current = {
      scenario,
      paused,
      wireframe,
      resetKey,
      activityOverride,
      speed,
    };
  }, [scenario, paused, wireframe, resetKey, activityOverride, speed]);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 0,
      height = 0,
      time = 0,
      last = performance.now(),
      frame = 0,
      yaw = 0.35,
      pitch = 0.18,
      zoom = 1,
      dragging = false,
      px = 0,
      py = 0,
      lastReset = latest.current.resetKey;
    const sprites = [
      "83,172,255",
      "129,224,255",
      "181,121,236",
      "255,144,72",
      "255,222,153",
    ].map((color) => {
      const s = document.createElement("canvas");
      s.width = s.height = 32;
      const c = s.getContext("2d")!;
      const g = c.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, `rgba(${color},.9)`);
      g.addColorStop(0.22, `rgba(${color},.4)`);
      g.addColorStop(0.55, `rgba(${color},.12)`);
      g.addColorStop(1, `rgba(${color},0)`);
      c.fillStyle = g;
      c.fillRect(0, 0, 32, 32);
      return s;
    });
    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio, 1.5);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    function project(x: number, y: number, z: number) {
      const xx = x * Math.cos(yaw) + z * Math.sin(yaw),
        zz = -x * Math.sin(yaw) + z * Math.cos(yaw);
      const yy = y * Math.cos(pitch) - zz * Math.sin(pitch),
        depth = y * Math.sin(pitch) + zz * Math.cos(pitch);
      const f = 4.5 / (4.5 - depth);
      const scale = Math.min(height * 0.28, width * 0.29) * zoom;
      return {
        x: width * 0.5 + xx * scale * f,
        y: height * 0.54 - yy * scale * f,
        z: depth,
        f,
      };
    }
    function line(points: number[][], color: string) {
      ctx!.beginPath();
      points.forEach((p, i) => {
        const q = project(p[0], p[1], p[2]);
        if (i === 0) ctx!.moveTo(q.x, q.y);
        else ctx!.lineTo(q.x, q.y);
      });
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 0.65;
      ctx!.stroke();
    }
    function draw(now: number) {
      frame = requestAnimationFrame(draw);
      const current = latest.current;
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!current.paused && document.visibilityState === "visible")
        time += delta * current.speed;
      if (lastReset !== current.resetKey) {
        yaw = 0.35;
        pitch = 0.18;
        zoom = 1;
        lastReset = current.resetKey;
      }
      const m = modelScenario(current.scenario);
      const activity = current.activityOverride ?? m.activity;
      const g = Math.sqrt(m.gravity);
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;
      for (let i = -5; i <= 5; i++) {
        line(
          [
            [i * 0.52, -1.35, -2.6],
            [i * 0.52, -1.35, 2.6],
          ],
          "#719c7e19",
        );
        line(
          [
            [-2.6, -1.35, i * 0.52],
            [2.6, -1.35, i * 0.52],
          ],
          "#719c7e19",
        );
      }
      for (const r of [1.2, 1.55, 1.9]) {
        const ring = Array.from({ length: 81 }, (_, i) => [
          Math.cos((i / 80) * Math.PI * 2) * r,
          -1.32,
          Math.sin((i / 80) * Math.PI * 2) * r,
        ]);
        line(ring, "#94bfa338");
      }
      line(
        [
          [0, -1.32, 0],
          [0, -0.95, 0],
        ],
        "#aac6ad66",
      );
      if (current.wireframe) {
        const corners = [
          [-1.35, -1.32, -1.35],
          [1.35, -1.32, -1.35],
          [1.35, 1.4, -1.35],
          [-1.35, 1.4, -1.35],
          [-1.35, -1.32, 1.35],
          [1.35, -1.32, 1.35],
          [1.35, 1.4, 1.35],
          [-1.35, 1.4, 1.35],
        ];
        for (const [a, b] of [
          [0, 1],
          [1, 2],
          [2, 3],
          [3, 0],
          [4, 5],
          [5, 6],
          [6, 7],
          [7, 4],
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7],
        ])
          line([corners[a], corners[b]], "#91bf9b33");
      }
      const glow = ctx!.createRadialGradient(
        width * 0.5,
        height * 0.52,
        5,
        width * 0.5,
        height * 0.52,
        height * 0.45,
      );
      glow.addColorStop(0, g > 0.5 ? "#e8651420" : "#307edb18");
      glow.addColorStop(1, "#367ce600");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, width, height);
      const pts = Array.from({ length: width < 350 ? 1400 : 2400 }, (_, i) => {
        const p = flameParticle(
          i,
          time,
          activity,
          m.gravity,
          current.scenario.airflow,
        );
        return { ...p, ...project(p.x, p.y, p.z) };
      }).sort((a, b) => a.z - b.z);
      ctx!.globalCompositeOperation = "lighter";
      for (const p of pts) {
        const size = p.size * p.f * 2.2 * Math.min(1, width / 320);
        ctx!.globalAlpha = p.alpha * (g > 0.45 ? 1.25 : 1.05);
        const index =
          g > 0.45
            ? p.life < 0.14
              ? 0
              : p.life < 0.45
                ? 4
                : 3
            : p.seed < 0.18
              ? 2
              : p.life < 0.42
                ? 1
                : 0;
        ctx!.drawImage(
          sprites[index],
          p.x - size,
          p.y - size,
          size * 2,
          size * 2,
        );
      }
      // Wisps are short segments moving through the same 3D field, not static latitude lines.
      ctx!.globalAlpha = 0.18;
      for (let i = 0; i < 72; i++) {
        const trail = Array.from({ length: 7 }, (_, j) => {
          const p = flameParticle(
            i * 29,
            time - j * 0.018,
            activity,
            m.gravity,
            current.scenario.airflow,
          );
          return [p.x, p.y, p.z];
        });
        const before = flameParticle(
          i * 29,
          time - 0.108,
          activity,
          m.gravity,
          current.scenario.airflow,
        );
        const after = flameParticle(
          i * 29,
          time,
          activity,
          m.gravity,
          current.scenario.airflow,
        );
        if (after.life > before.life)
          line(trail, g > 0.45 ? "#ffb264" : "#85d5ff");
      }
      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = "source-over";
      ctx!.fillStyle = "#8cab9377";
      ctx!.font = "7px Inter, sans-serif";
      ctx!.textAlign = "right";
    }
    const down = (e: PointerEvent) => {
      dragging = true;
      px = e.clientX;
      py = e.clientY;
      canvas!.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      yaw += (e.clientX - px) * 0.008;
      pitch = Math.max(-0.7, Math.min(0.8, pitch + (e.clientY - py) * 0.006));
      px = e.clientX;
      py = e.clientY;
    };
    const up = () => {
      dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom = Math.max(0.6, Math.min(1.5, zoom - e.deltaY * 0.001));
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("wheel", wheel, { passive: false });
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("wheel", wheel);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      className="cpu-flame"
      aria-label="Software-rendered 3D flame. Drag to orbit, scroll to zoom. WebGL unavailable on this device."
    />
  );
}
