/** @jsxRuntime automatic */
/** @jsxImportSource react */
import { Text, useStdout } from "ink";
import { useEffect, useMemo, useRef, useState } from "react";
import figlet from "figlet";

const FALLBACK_TEXT = "SALVETRON";
const MAX_TEXT_LENGTH = 18;

const DURATION_MS = 4000;
const TICK_MS = 80;
const TWO_PI = Math.PI * 2;

// Glyphs are never swapped for block characters anymore — only color
// brightness is modulated, so the full name stays legible at every frame,
// including loop edges. The wave crest lightens the base color toward a
// slightly lighter shade (not pure white) instead of dimming it, for a
// glow/shine sweep.
const GLOW_MIX = 0.65;
const GLOW_LEVELS = 55;

export const LOGO_COLOR_PALETTE = [
  "#61DAFB", // React cyan (original brand color)
  "#FF6B6B", // coral red
  "#4ECDC4", // teal
  "#FFD93D", // gold
  "#A78BFA", // violet
  "#FF8C42", // orange
  "#52D17C", // emerald green
  "#F472B6", // pink
  "#38BDF8", // sky blue
  "#FACC15", // amber
] as const;

export function pickRandomColor(): string {
  return LOGO_COLOR_PALETTE[Math.floor(Math.random() * LOGO_COLOR_PALETTE.length)];
}

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

function buildArt(text: string) {
  // Truncated so longer project names don't blow past typical terminal
  // width and wrap mid-glyph.
  const safeText = text.slice(0, MAX_TEXT_LENGTH);
  const art = figlet
    .textSync(safeText, { font: "ANSI Shadow" })
    .split("\n")
    .filter((line) => line.trim().length > 0);

  // Guard against an empty `art` (e.g. blank input) collapsing Math.max to
  // -Infinity, which would propagate NaN into the wave frequency below.
  const maxWidth = Math.max(1, ...art.map((line) => line.length));

  // Several ripples across the full width so the wave never dims everything
  // at once (a single period close to maxWidth caused a visible gap
  // mid-animation).
  const waveFrequency = (TWO_PI * 3) / maxWidth;

  return { art, waveFrequency };
}

function render(t: number, rgb: Rgb, art: string[], waveFrequency: number): string {
  const [r, g, b] = rgb;
  const peak: Rgb = [
    lerp(r, 255, GLOW_MIX),
    lerp(g, 255, GLOW_MIX),
    lerp(b, 255, GLOW_MIX),
  ];

  const lines: string[] = [];
  for (let y = 0; y < art.length; y++) {
    const row = art[y];
    let line = "";
    let lastLevel = -1;
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === " ") {
        line += " ";
        continue;
      }
      const wave = Math.sin(x * waveFrequency + t) * 0.5 + 0.5;
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
  text?: string;
  color?: string;
}

export function AsciiLogo({ text = FALLBACK_TEXT, color = "#61DAFB" }: AsciiLogoProps) {
  const upperText = text.toUpperCase();
  const { art, waveFrequency } = useMemo(() => buildArt(upperText), [upperText]);
  const rgb = useMemo(() => hexToRgb(color), [color]);
  const [frame, setFrame] = useState(() => render(0, rgb, art, waveFrequency));
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
    // Render immediately so a text/color change doesn't leave a stale frame
    // on screen until the next tick.
    setFrame(render(0, rgb, art, waveFrequency));

    const id = setInterval(() => {
      if (isResizingRef.current) return;
      const pos = (Date.now() - start) % (DURATION_MS * 2);
      const linear =
        pos < DURATION_MS
          ? pos / DURATION_MS
          : 1 - (pos - DURATION_MS) / DURATION_MS;
      const eased = linear * linear * (3 - 2 * linear);
      setFrame(render(eased * TWO_PI, rgb, art, waveFrequency));
    }, TICK_MS);

    return () => clearInterval(id);
  }, [art, waveFrequency, rgb]);

  return <Text>{frame}</Text>;
}
