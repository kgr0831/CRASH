export const SPECTRUMS: Record<string, string[]> = {
  classic: ["#1e3a8a", "#2563eb", "#facc15", "#f97316", "#dc2626"],
  infrared: ["#1c1917", "#7c2d12", "#f97316", "#fde047", "#fef9c3"],
  coolhot: ["#06b6d4", "#84cc16", "#facc15", "#ef4444"],
  bipolar: ["#2563eb", "#a5b4fc", "#fca5a5", "#dc2626"],
  night: ["#1e1b4b", "#7c3aed", "#ec4899", "#fb7185"],
};

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function heatColor(
  score: number,
  spectrum: string[],
  dark: boolean,
  alpha = 1
): string {
  if (!score || score < 1) return "transparent";
  const s = Math.max(0, Math.min(100, score)) / 100;
  const n = spectrum.length - 1;
  const idx = s * n;
  const lo = Math.floor(idx);
  const hi = Math.min(n, lo + 1);
  const t = idx - lo;
  const c1 = hexToRgb(spectrum[lo]);
  const c2 = hexToRgb(spectrum[hi]);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  const a = alpha < 1 ? alpha * (0.25 + 0.75 * s) : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
