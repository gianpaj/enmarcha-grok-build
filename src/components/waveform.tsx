import { useEffect, useRef } from "react";
import type { WaveMode } from "@/lib/demo-call";

const STEPS = 88;

function voiceSample(p: number, mode: WaveMode): number {
  if (mode === "idle") {
    return Math.sin(p) * 0.42 + Math.sin(p * 1.8 + 0.4) * 0.16;
  }
  const gate = 0.38 + 0.62 * Math.pow(Math.max(0, Math.sin(p * 0.62)), 1.15);
  const vowel =
    Math.sin(p * 1.65) * 0.64 + Math.sin(p * 3.05 + 0.7) * 0.26 + Math.sin(p * 4.8) * 0.1;
  const tick = Math.sin(p * 0.62) > 0.78 ? Math.sin(p * 12.5) * 0.2 : 0;
  const sample = vowel * gate + tick;
  return mode === "think" ? sample * 0.62 : sample;
}

function curve(points: Array<[number, number]>): string {
  const first = points[0];
  let d = `M ${first[0].toFixed(1)} ${first[1].toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const xc = (a[0] + b[0]) / 2;
    const yc = (a[1] + b[1]) / 2;
    d += ` Q ${a[0].toFixed(1)} ${a[1].toFixed(1)} ${xc.toFixed(1)} ${yc.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
  return d;
}

export function Waveform({ mode }: { mode: WaveMode }) {
  const strokeRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    const stroke = strokeRef.current;
    const fill = fillRef.current;
    const svg = stroke?.ownerSVGElement;
    if (!stroke || !fill || !svg) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const voice = getComputedStyle(svg).getPropertyValue("--voice").trim() || "#1c6b4a";
    const ink = getComputedStyle(svg).getPropertyValue("--ink").trim() || "#1a1814";
    let time = 1.15;
    let raf = 0;
    let alive = true;

    const paint = () => {
      if (!alive) return;
      const current = reduced ? "idle" : modeRef.current;
      if (!reduced) {
        time += current === "speak" ? 0.055 : current === "think" ? 0.026 : 0.01;
      }
      const width = 1000;
      const height = 240;
      const mid = height / 2;
      const gain = height * (current === "speak" ? 0.46 : current === "think" ? 0.26 : 0.2);
      const upper: Array<[number, number]> = [];
      const lower: Array<[number, number]> = [];
      for (let i = 0; i < STEPS; i++) {
        const u = i / (STEPS - 1);
        const edge = Math.pow(Math.sin(u * Math.PI), 0.65);
        const spatial = current === "speak" ? 22 : current === "think" ? 14 : 7;
        const raw = voiceSample(time * 8 + u * spatial, current);
        const sample = Math.max(-1, Math.min(1, raw)) * edge;
        const x = u * width;
        const y = mid - sample * gain;
        upper.push([x, y]);
        lower.push([x, mid + (mid - y)]);
      }
      const speaking = current === "speak" || current === "think";
      stroke.setAttribute("d", curve(upper));
      stroke.setAttribute("stroke", speaking ? voice : ink);
      stroke.setAttribute("stroke-opacity", speaking ? "0.95" : "0.55");
      const back = [...lower].reverse();
      fill.setAttribute("d", `${curve(upper)} L ${back.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`);
      fill.setAttribute("fill", speaking ? voice : ink);
      fill.setAttribute("fill-opacity", speaking ? "0.18" : "0.1");
      if (!reduced) raf = requestAnimationFrame(paint);
    };

    paint();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <svg
      viewBox="0 0 1000 240"
      preserveAspectRatio="none"
      className="h-28 w-full sm:h-36"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="120"
        x2="1000"
        y2="120"
        stroke="var(--ink)"
        strokeOpacity="0.14"
        vectorEffect="non-scaling-stroke"
      />
      <path ref={fillRef} vectorEffect="non-scaling-stroke" />
      <path
        ref={strokeRef}
        fill="none"
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
