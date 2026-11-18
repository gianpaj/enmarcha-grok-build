import { useEffect, useRef } from "react";
import type { WaveMode } from "@/lib/demo-call";

const SAMPLES = 280;

function readColor(el: HTMLElement, name: string, fallback: string): string {
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  return value || fallback;
}

function withAlpha(color: string, alpha: number): string {
  const hex = color.match(/^#([\da-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

function voiceSample(phase: number, mode: WaveMode): number {
  if (mode === "idle") {
    return Math.sin(phase * 0.55) * 0.04 + Math.sin(phase * 1.15) * 0.018;
  }
  const pace = mode === "speak" ? 1 : 0.42;
  const p = phase * pace;
  const syllable = Math.pow(Math.max(0, Math.sin(p * 0.38)), 1.4);
  const vowel =
    Math.sin(p * 1.12) * 0.56 + Math.sin(p * 2.27 + 0.5) * 0.26 + Math.sin(p * 3.84) * 0.1;
  let sample = vowel * (0.18 + 0.82 * syllable);
  if (mode === "speak" && Math.sin(p * 0.38) > 0.86) {
    sample += Math.sin(p * 14.5) * 0.16;
  }
  return mode === "think" ? sample * 0.42 : sample;
}

type Props = {
  mode: WaveMode;
  generation: number;
};

export function Waveform({ mode, generation }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const buffer = new Float32Array(SAMPLES);
    let phase = 0;
    let raf = 0;
    let alive = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      if (!alive) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const pxW = Math.max(1, Math.floor(width * dpr));
      const pxH = Math.max(1, Math.floor(height * dpr));
      if (canvas.width !== pxW || canvas.height !== pxH) {
        canvas.width = pxW;
        canvas.height = pxH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const current = reduced ? "idle" : modeRef.current;
      const step = current === "speak" ? 0.34 : current === "think" ? 0.16 : 0.05;
      if (!reduced) {
        for (let k = 0; k < 2; k++) {
          phase += step;
          buffer.copyWithin(0, 1);
          buffer[SAMPLES - 1] = voiceSample(phase, current);
        }
      } else if (buffer[10] === 0) {
        for (let i = 0; i < SAMPLES; i++) buffer[i] = voiceSample(i * 0.2, "idle");
      }

      const voice = readColor(canvas, "--voice", "#1c6b4a");
      const ink = readColor(canvas, "--ink", "#1a1814");
      const speaking = current === "speak" || current === "think";
      const stroke = speaking ? voice : ink;
      const mid = height / 2;
      const gain = height * (current === "speak" ? 0.46 : current === "think" ? 0.28 : 0.22);

      ctx.beginPath();
      ctx.moveTo(0, mid);
      ctx.lineTo(width, mid);
      ctx.strokeStyle = withAlpha(ink, 0.14);
      ctx.lineWidth = 1;
      ctx.stroke();

      const point = (i: number, sign: number) => {
        const taper = Math.sin((i / (SAMPLES - 1)) * Math.PI);
        const x = (i / (SAMPLES - 1)) * width;
        const y = mid - sign * buffer[i] * taper * gain;
        return [x, y] as const;
      };

      const strokeTop = () => {
        ctx.beginPath();
        const first = point(0, 1);
        ctx.moveTo(first[0], first[1]);
        for (let i = 1; i < SAMPLES - 1; i++) {
          const a = point(i, 1);
          const b = point(i + 1, 1);
          ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
        }
        ctx.lineTo(point(SAMPLES - 1, 1)[0], point(SAMPLES - 1, 1)[1]);
      };

      ctx.beginPath();
      const origin = point(0, 1);
      ctx.moveTo(origin[0], origin[1]);
      for (let i = 1; i < SAMPLES - 1; i++) {
        const a = point(i, 1);
        const b = point(i + 1, 1);
        ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      }
      const end = point(SAMPLES - 1, 1);
      ctx.lineTo(end[0], end[1]);
      for (let i = SAMPLES - 2; i > 0; i--) {
        const a = point(i, -1);
        const b = point(i - 1, -1);
        ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      }
      ctx.closePath();
      ctx.fillStyle = withAlpha(stroke, speaking ? 0.16 : 0.06);
      ctx.fill();

      strokeTop();
      ctx.strokeStyle = withAlpha(stroke, speaking ? 0.95 : 0.38);
      ctx.lineWidth = 1.6;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [generation]);

  return (
    <div className="relative h-24 sm:h-32" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
