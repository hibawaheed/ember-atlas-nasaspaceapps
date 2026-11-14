// Procedural art, not a fluid solver. All quantities below are visual units.
// Shared deterministic particles make software rendering reproducible and testable.
const fract = (n: number) => n - Math.floor(n);
function seedsFor(i: number) {
  return [
    fract(Math.sin(i * 127.1 + 19.7) * 43758.5453),
    fract(Math.sin(i * 269.5 + 7.1) * 18363.237),
  ] as const;
}
const seeds = Array.from({ length: 2400 }, (_, i) => seedsFor(i));
export function flameParticle(
  i: number,
  time: number,
  activity: number,
  gravity: number,
  flow: number,
) {
  const [seed, seed2] = seeds[i] ?? seedsFor(i);
  const speed = 0.23 + activity * 0.22 + seed * 0.14;
  const life = fract(seed2 + time * speed);
  const g = Math.sqrt(gravity);
  const radius = 0.64 + activity * 0.53;
  const angle = i * 2.39996323 + time * (0.23 + flow * 0.012);
  const vertical = 1 - 2 * seed;
  const horizontal = Math.sqrt(1 - vertical * vertical);
  const swirl = Math.sin(vertical * 7 + angle * 2 - time * 2.1);
  const envelope = radius * (0.62 + life * 0.48 + swirl * 0.075);
  const sx = Math.cos(angle) * horizontal * envelope;
  const sz = Math.sin(angle) * horizontal * envelope;
  const sy = vertical * envelope + Math.sin(angle * 3 + time * 2.4) * 0.06;
  // In gravity, rising packets taper and curl into an asymmetric flame tip.
  const plumeRadius =
    (0.47 + activity * 0.18) * Math.pow(1 - life, 0.75) * Math.sqrt(seed);
  const plumeY = -0.85 + life * (2.05 + activity * 0.7);
  const curl = Math.sin(life * 8 - time * 3.3 + seed2 * 3) * 0.22 * life;
  const px = Math.cos(angle) * plumeRadius + curl + flow * 0.007 * life;
  const pz =
    Math.sin(angle) * plumeRadius +
    Math.cos(life * 6 - time * 2.3) * 0.1 * life;
  return {
    x: sx * (1 - g) + px * g + flow * 0.008 * sy * (1 - g),
    y: sy * (1 - g) + plumeY * g,
    z: sz * (1 - g) + pz * g,
    life,
    seed,
    alpha: Math.pow(Math.sin(life * Math.PI), 0.7) * (0.26 + activity * 0.28),
    size: (3 + activity * 3.5) * (0.65 + seed2 * 0.6) * (1 - life * 0.32),
  };
}
