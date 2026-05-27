// Heat color computation — maps 0-100 score to thermal spectrum
function heatColor(score, spectrum, dark, alpha = 1) {
  if (!score || score < 1) return dark ? "transparent" : "transparent";
  // spectrum is array of hex like ["#1e3a8a", "#fde047", "#dc2626"]
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
  // dampen alpha based on score so cold lines are mostly transparent
  const a = alpha < 1 ? alpha * (0.25 + 0.75 * s) : 1;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

window.heatColor = heatColor;
