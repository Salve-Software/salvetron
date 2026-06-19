import { Text, useStdout } from "ink";
import { useEffect, useMemo, useRef, useState } from "react";
import figlet from "figlet";

const ART = figlet
  .textSync("REACT NATIVE CLI", { font: "ANSI Shadow" })
  .split("\n")
  .filter((line) => line.trim().length > 0);

const MAX_WIDTH = Math.max(...ART.map((line) => line.length));

const DURATION_MS = 4000;
const TICK_MS = 80;
const TWO_PI = Math.PI * 2;

// Several ripples across the full width so the wave never dims everything
// at once (a single period close to MAX_WIDTH caused a visible gap
// mid-animation).
const WAVE_FREQUENCY = (TWO_PI * 3) / MAX_WIDTH;

// Glyphs are never swapped for block characters anymore — only color
// brightness is modulated, so the full name stays legible at every frame,
// including loop edges. The wave crest lightens the base color toward a
// slightly lighter shade (not pure white) instead of dimming it, for a
// glow/shine sweep.
const GLOW_MIX = 0.45;
const GLOW_LEVELS = 20;

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return [r, g, b];
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

const RESET = "[39m";

function ansiColor([r, g, b]: Rgb): string {
  return `[38;2;${r};${g};${b}m`;
}

function render(t: number, rgb: Rgb): string {
  const [r, g, b] = rgb;
  const peak: Rgb = [
    lerp(r, 255, GLOW_MIX),
    lerp(g, 255, GLOW_MIX),
    lerp(b, 255, GLOW_MIX),
  ];

  const lines: string[] = [];
  for (let y = 0; y < ART.length; y++) {
    const row = ART[y];
    let line = "";
    let lastLevel = -1;
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === " ") {
        line += " ";
        continue;
      }
      const wave = Math.sin(x * WAVE_FREQUENCY + t) * 0.5 + 0.5;
      const verticalWave = Math.sin(y * 0.5 + t * 0.8) * 0.5 + 0.5;
      const glow = wave * 0.6 + verticalWave * 0.4;
      const level = Math.round(glow * GLOW_LEVELS);
      if (level !== lastLevel) {
        const factor = level / GLOW_LEVELS;
        line += ansiColor([
          lerp(r, peak[0], factor),
          lerp(g, peak[1], factor),
          lerp(b, peak[2], factor),
        ]);
        lastLevel = level;
      }
      line += ch;
    }
    line += RESET;
    lines.push(line);
  }
  return lines.join("\n");
}

interface AsciiLogoProps {
  color?: string;
}

export function AsciiLogo({ color = "#61DAFB" }: AsciiLogoProps) {
  const rgb = useMemo(() => hexToRgb(color), [color]);
  const [frame, setFrame] = useState(() => render(0, rgb));
  const { stdout } = useStdout();
  const isResizingRef = useRef(false);

  useEffect(() => {
    if (!stdout) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handler = () => {
      isResizingRef.current = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        isResizingRef.current = false;
      }, 150);
    };
    stdout.on("resize", handler);
    return () => {
      clearTimeout(timer);
      stdout.off("resize", handler);
    };
  }, [stdout]);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      if (isResizingRef.current) return;
      const pos = (Date.now() - start) % (DURATION_MS * 2);
      const linear =
        pos < DURATION_MS
          ? pos / DURATION_MS
          : 1 - (pos - DURATION_MS) / DURATION_MS;
      const eased = linear * linear * (3 - 2 * linear);
      setFrame(render(eased * TWO_PI, rgb));
    }, TICK_MS);

    return () => clearInterval(id);
  }, [rgb]);

  return <Text>{frame}</Text>;
}
