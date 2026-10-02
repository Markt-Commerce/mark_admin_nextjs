/**
 * The scalloped "cloud" edge between the brand panel and the form (reference
 * C): three layers of overlapping circles, the back two translucent and the
 * front one solid white so it merges into the form side. Deterministic, so
 * server and client render the same shape.
 */

const VIEW_W = 360;
const VIEW_H = 1400;

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function bubbles(seed: number, cx: [number, number], r: [number, number], step: number) {
  const rand = rng(seed);
  const out: Array<{ x: number; y: number; r: number }> = [];
  for (let y = -40; y < VIEW_H + 80; ) {
    const radius = r[0] + rand() * (r[1] - r[0]);
    out.push({ x: cx[0] + rand() * (cx[1] - cx[0]), y, r: radius });
    y += step * (0.55 + rand() * 0.6) + radius * 0.35;
  }
  return out;
}

// Fewer, larger scallops, as in the reference. Front bubbles are centred far
// enough right, and are big enough, to leave no gap against the white strip.
// Every circle stays inside the viewBox (centre minus radius >= 0) so no
// layer is clipped into a hard vertical line.
const BACK = bubbles(11, [240, 270], [110, 165], 210);
const MID = bubbles(29, [270, 298], [90, 140], 190);
const FRONT = bubbles(53, [325, 348], [72, 128], 170);

export function CloudEdge({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMaxYMid slice"
      className={className}
    >
      <g fill="#ffffff" fillOpacity="0.2">
        {BACK.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} />
        ))}
      </g>
      <g fill="#ffffff" fillOpacity="0.35">
        {MID.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} />
        ))}
      </g>
      <g fill="#ffffff">
        {FRONT.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} />
        ))}
        <rect x={VIEW_W - 36} y={0} width={36} height={VIEW_H} />
      </g>
    </svg>
  );
}
