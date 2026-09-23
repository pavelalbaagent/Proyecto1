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

export const DEFAULT_PARAMETERS = {
  text: "",
  seed: 137,
  density: 30,
  symmetry: 5,
  twist: 1,
  frequency: 2.4,
  warp: 0.14,
  speed: 1,
  paletteShift: 0,
};

function createNonlinearSystem(seed) {
  const random = createRng(seed ^ 0xa341316c);

  return {
    iterations: 2 + Math.floor(random() * 2),
    a: 1.05 + random() * 1.15,
    b: 1.05 + random() * 1.15,
    c: 1.05 + random() * 1.15,
    d: 1.05 + random() * 1.15,
  };
}

export function createGeometry(
  seed = DEFAULT_PARAMETERS.seed,
  parameters = DEFAULT_PARAMETERS,
) {
  const random = createRng(seed);
  const curves = [];
  const curveCount = parameters.density;
  const pointsPerCurve = 150;

  for (let curveIndex = 0; curveIndex < curveCount; curveIndex += 1) {
    const normalized = curveIndex / Math.max(1, curveCount - 1);
    const phase = random() * TAU;
    const turns =
      0.6 +
      random() * 1.2 +
      parameters.symmetry * 0.055;
    const frequency =
      parameters.frequency * (0.72 + random() * 0.58);
    const amplitude =
      0.008 +
      random() * 0.022 +
      parameters.warp * 0.035;
    const twist =
      (-0.8 + random() * 1.6) * parameters.twist;
    const radiusBias = 0.08 + normalized * 0.84;
    const phaseSpeed =
      (-0.10 + random() * 0.20) *
      parameters.speed *
      (0.75 + normalized);
    const weight = curveIndex % 7 === 0 ? 1.45 : 1;

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

  return {
    seed,
    parameters,
    nonlinear: createNonlinearSystem(seed),
    curves,
  };
}

function nonlinearTransform(x, y, system, phase) {
  let nextX = x;
  let nextY = y;

  for (let iteration = 0; iteration < system.iterations; iteration += 1) {
    const transformedX =
      Math.sin(system.a * nextY + phase) -
      Math.cos(system.b * nextX - phase * 0.5);
    const transformedY =
      Math.sin(system.c * nextX - phase * 0.35) -
      Math.cos(system.d * nextY + phase);

    nextX = nextX * 0.64 + transformedX * 0.36;
    nextY = nextY * 0.64 + transformedY * 0.36;
  }

  return {
    x: Math.max(-1.4, Math.min(1.4, nextX)),
    y: Math.max(-1.4, Math.min(1.4, nextY)),
  };
}

function superformula(angle, symmetry, warp) {
  const m = symmetry;
  const a = 1;
  const b = 1;
  const n1 = 0.9 + warp * 1.6;
  const n2 = 2 + warp * 5;
  const n3 = 2 + warp * 5;

  const termA = Math.pow(
    Math.abs(Math.cos((m * angle) / 4) / a),
    n2,
  );
  const termB = Math.pow(
    Math.abs(Math.sin((m * angle) / 4) / b),
    n3,
  );
  const denominator = Math.pow(
    Math.max(0.0001, termA + termB),
    1 / n1,
  );

  return Math.max(0.28, Math.min(1.55, 1 / denominator));
}

export function updateGeometry(
  geometry,
  { width, centerX, centerY, minDimension, time },
  forces,
) {
  const maxRadius = minDimension * 0.49;
  const parameters = geometry.parameters;
  const system = geometry.nonlinear;

  for (const curve of geometry.curves) {
    const animatedPhase =
      curve.phase +
      time * curve.phaseSpeed +
      Math.sin(time * 0.18 + curve.index) * parameters.warp * 0.16;

    for (const point of curve.points) {
      const u = point.u;
      const baseAngle =
        animatedPhase +
        u * TAU * curve.turns +
        Math.sin(u * TAU * 2 + animatedPhase) *
          curve.twist *
          0.08;

      const radialShape =
        superformula(
          baseAngle,
          parameters.symmetry,
          parameters.warp,
        );

      const ringWave =
        Math.sin(
          u * TAU * curve.frequency +
            animatedPhase * 0.7,
        ) *
        curve.amplitude;

      const secondaryWave =
        Math.sin(
          u * TAU * (curve.frequency * 0.5 + 0.7) -
            animatedPhase * 1.3,
        ) *
        (0.006 + parameters.warp * 0.012);

      const baseRadius =
        maxRadius *
        (curve.radiusBias + ringWave + secondaryWave) *
        radialShape;

      const normalizedX =
        Math.cos(baseAngle) *
        (0.5 + curve.normalized * 0.5);
      const normalizedY =
        Math.sin(baseAngle) *
        (0.5 + curve.normalized * 0.5);

      const nonlinear = nonlinearTransform(
        normalizedX,
        normalizedY,
        system,
        animatedPhase,
      );

      const chaosBlend =
        0.05 + parameters.warp * 0.72;

      let x =
        centerX +
        (normalizedX * (1 - chaosBlend) +
          nonlinear.x * chaosBlend) *
          maxRadius *
          (curve.radiusBias + ringWave + secondaryWave);

      let y =
        centerY +
        (normalizedY * (1 - chaosBlend) +
          nonlinear.y * chaosBlend) *
          maxRadius *
          (curve.radiusBias + ringWave + secondaryWave);

      x += Math.cos(baseAngle) * (radialShape - 1) * maxRadius * 0.16;
      y += Math.sin(baseAngle) * (radialShape - 1) * maxRadius * 0.16;

      for (const force of forces) {
        const dx = x - force.x;
        const dy = y - force.y;
        const distanceSquared = dx * dx + dy * dy;
        const sigmaSquared = force.radius * force.radius;
        const falloff =
          sigmaSquared > 0
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
        const distance = Math.max(
          1,
          Math.sqrt(distanceSquared),
        );
        const nx = dx / distance;
        const ny = dy / distance;

        x +=
          nx * influence * force.radial +
          (tangentialX / distance) *
            influence *
            force.swirl;
        y +=
          ny * influence * force.radial +
          (tangentialY / distance) *
            influence *
            force.swirl;
      }

      const edgePull = Math.max(
        0,
        Math.abs(x - centerX) / (width * 0.52) - 0.68,
      );

      if (edgePull > 0) {
        x -=
          (x - centerX) *
          edgePull *
          (0.045 + parameters.warp * 0.02);
        y -=
          (y - centerY) *
          edgePull *
          (0.045 + parameters.warp * 0.02);
      }

      point.x = x;
      point.y = y;
      point.radius = Math.max(0, baseRadius);
      point.angle = baseAngle;
    }
  }
}

export function getCurveColor(index, total, paletteShift = 0) {
  const palette = [
    "#1d1d1b",
    "#3d5afe",
    "#c9514a",
    "#2d8a7a",
    "#b57c1f",
  ];

  const paletteIndex =
    (Math.floor(
      (index / Math.max(1, total - 1)) * palette.length,
    ) +
      paletteShift) %
    palette.length;

  return palette[paletteIndex];
}
