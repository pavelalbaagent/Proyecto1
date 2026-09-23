const TAU = Math.PI * 2;

function createRng(seed = 1) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGeometry(seed = 137) {
  const random = createRng(seed);
  const curves = [];
  const curveCount = 30;
  const pointsPerCurve = 190;

  for (let curveIndex = 0; curveIndex < curveCount; curveIndex += 1) {
    const normalized = curveIndex / Math.max(1, curveCount - 1);
    const phase = random() * TAU;
    const turns = 0.8 + random() * 1.65;
    const frequency = 1.4 + random() * 3.4;
    const amplitude = 0.012 + random() * 0.035;
    const twist = -0.8 + random() * 1.6;
    const radiusBias = 0.08 + normalized * 0.84;
    const phaseSpeed = (-0.12 + random() * 0.24) * (0.75 + normalized);
    const weight = curveIndex % 7 === 0 ? 1.4 : 1;

    const points = new Array(pointsPerCurve);

    for (let pointIndex = 0; pointIndex < pointsPerCurve; pointIndex += 1) {
      points[pointIndex] = {
        u: pointIndex / (pointsPerCurve - 1),
        x: 0,
        y: 0,
        radius: 0,
        angle: 0,
      };
    }

    curves.push({
      index: curveIndex,
      normalized,
      phase,
      turns,
      frequency,
      amplitude,
      twist,
      radiusBias,
      phaseSpeed,
      weight,
      points,
    });
  }

  return { curves };
}

export function updateGeometry(geometry, { width, height, centerX, centerY, minDimension, time }, forces) {
  const maxRadius = minDimension * 0.49;

  for (const curve of geometry.curves) {
    const animatedPhase = curve.phase + time * curve.phaseSpeed;

    for (const point of curve.points) {
      const u = point.u;
      const angle =
        animatedPhase +
        u * TAU * curve.turns +
        Math.sin(u * TAU * 2 + animatedPhase) * curve.twist * 0.08;

      const ringWave =
        Math.sin(u * TAU * curve.frequency + animatedPhase * 0.7) *
        curve.amplitude;

      const secondaryWave =
        Math.sin(u * TAU * (curve.frequency * 0.5 + 0.7) - animatedPhase * 1.3) *
        0.009;

      const radius =
        maxRadius * (curve.radiusBias + ringWave + secondaryWave) +
        Math.sin(time * 0.28 + curve.index) * minDimension * 0.004;

      let x = centerX + Math.cos(angle) * radius;
      let y = centerY + Math.sin(angle) * radius;

      for (const force of forces) {
        const dx = x - force.x;
        const dy = y - force.y;
        const distanceSquared = dx * dx + dy * dy;
        const sigmaSquared = force.radius * force.radius;
        const falloff = sigmaSquared > 0
          ? Math.exp(-distanceSquared / (sigmaSquared * 1.65))
          : 0;

        if (falloff < 0.001) {
          continue;
        }

        const ripple =
          0.55 +
          0.45 *
            Math.sin(
              Math.sqrt(distanceSquared) * 0.035 -
                force.age * 5.5 +
                curve.index * 0.11,
            );

        const influence =
          falloff *
          force.strength *
          ripple *
          (0.28 + 0.72 * force.life);

        const tangentialX = -dy;
        const tangentialY = dx;
        const distance = Math.max(1, Math.sqrt(distanceSquared));
        const nx = dx / distance;
        const ny = dy / distance;

        x += nx * influence * force.radial + (tangentialX / distance) * influence * force.swirl;
        y += ny * influence * force.radial + (tangentialY / distance) * influence * force.swirl;
      }

      const edgePull = Math.max(0, Math.abs(x - centerX) / (width * 0.52) - 0.68);
      if (edgePull > 0) {
        x -= (x - centerX) * edgePull * 0.045;
        y -= (y - centerY) * edgePull * 0.045;
      }

      point.x = x;
      point.y = y;
      point.radius = Math.max(0, radius);
      point.angle = angle;
    }
  }
}

export function getCurveColor(index, total) {
  const ratio = index / Math.max(1, total - 1);
  const palette = [
    "#1d1d1b",
    "#3d5afe",
    "#c9514a",
    "#2d8a7a",
    "#b57c1f",
  ];

  const paletteIndex = Math.floor(ratio * palette.length) % palette.length;
  return palette[paletteIndex];
}
