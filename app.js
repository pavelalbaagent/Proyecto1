import {
  DEFAULT_PARAMETERS,
  createGeometry,
  getCurveColor,
  updateGeometry,
} from "./src/geometry.js";
import { createPointerInput } from "./src/input.js";
import { createTextInput, textToParameters } from "./src/text.js";

const canvas = document.querySelector("#canvas");
const textField = document.querySelector("#text-input");
const seedReadout = document.querySelector("#seed-readout");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Canvas element not found.");
}

if (!(textField instanceof HTMLInputElement)) {
  throw new Error("Text input element not found.");
}

const ctx = canvas.getContext("2d", {
  alpha: false,
  desynchronized: true,
});

if (!ctx) {
  throw new Error("2D canvas context is not available.");
}

const state = {
  width: 0,
  height: 0,
  dpr: 1,
  time: 0,
  deltaTime: 0,
  previousTime: performance.now(),
  centerX: 0,
  centerY: 0,
  minDimension: 0,
  parameters: DEFAULT_PARAMETERS,
  geometry: createGeometry(DEFAULT_PARAMETERS.seed, DEFAULT_PARAMETERS),
};

const COLORS = {
  background: "#f4f1e8",
  grid: "rgba(29, 29, 27, 0.075)",
  gridStrong: "rgba(29, 29, 27, 0.14)",
  force: "rgba(29, 29, 27, 0.18)",
};

const pointerInput = createPointerInput(canvas, () => ({
  width: state.width,
  height: state.height,
  minDimension: state.minDimension,
}));

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  state.width = Math.max(1, rect.width);
  state.height = Math.max(1, rect.height);
  state.dpr = dpr;
  state.centerX = state.width / 2;
  state.centerY = state.height / 2;
  state.minDimension = Math.min(state.width, state.height);

  canvas.width = Math.round(state.width * dpr);
  canvas.height = Math.round(state.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
}

function applyTextParameters(parameters) {
  state.parameters = parameters;
  state.geometry = createGeometry(parameters.seed, parameters);
  seedReadout.textContent =
    "SEED " + parameters.seed.toString(16).padStart(8, "0");
}

function clearCanvas() {
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, state.width, state.height);
}

function drawReferenceGrid() {
  const radius = state.minDimension * 0.49;

  ctx.save();
  ctx.translate(state.centerX, state.centerY);
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;

  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath();
    ctx.arc(0, 0, radius * (ring / 4), 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = COLORS.gridStrong;
  ctx.beginPath();
  ctx.moveTo(-radius, 0);
  ctx.lineTo(radius, 0);
  ctx.moveTo(0, -radius);
  ctx.lineTo(0, radius);
  ctx.stroke();

  ctx.restore();
}

function drawGeometry() {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.globalCompositeOperation = "source-over";

  for (const curve of state.geometry.curves) {
    const color = getCurveColor(
      curve.index,
      state.geometry.curves.length,
      state.parameters.paletteShift,
    );

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.globalAlpha = curve.index % 5 === 0 ? 0.62 : 0.42;
    ctx.lineWidth = curve.weight;

    for (let index = 0; index < curve.points.length; index += 1) {
      const point = curve.points[index];

      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }

    ctx.stroke();

    if (curve.index % 5 === 0) {
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = color;

      for (let index = 0; index < curve.points.length; index += 22) {
        const point = curve.points[index];
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

function drawActiveForces() {
  const forces = pointerInput.forces;

  if (forces.length === 0) {
    return;
  }

  ctx.save();
  ctx.strokeStyle = COLORS.force;
  ctx.lineWidth = 1;

  for (const force of forces) {
    const radius = force.radius * (0.42 + force.life * 0.58);

    ctx.globalAlpha = Math.min(0.34, force.life * 0.4);
    ctx.beginPath();
    ctx.arc(force.x, force.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = Math.min(0.2, force.life * 0.24);
    ctx.beginPath();
    ctx.arc(force.x, force.y, radius * 0.28, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function update(deltaSeconds) {
  state.time +=
    deltaSeconds * state.parameters.speed;
  pointerInput.update(deltaSeconds);

  updateGeometry(
    state.geometry,
    {
      width: state.width,
      centerX: state.centerX,
      centerY: state.centerY,
      minDimension: state.minDimension,
      time: state.time,
    },
    pointerInput.forces,
  );
}

function render() {
  clearCanvas();
  drawReferenceGrid();
  drawGeometry();
  drawActiveForces();
}

function frame(now) {
  const elapsedMs = Math.min(
    now - state.previousTime,
    100,
  );

  state.previousTime = now;
  state.deltaTime = elapsedMs / 1000;

  update(state.deltaTime);
  render();

  window.requestAnimationFrame(frame);
}

const textInput = createTextInput({
  input: textField,
  onChange: applyTextParameters,
});

applyTextParameters(textToParameters(textField.value));

window.addEventListener("resize", resizeCanvas, {
  passive: true,
});

resizeCanvas();
window.requestAnimationFrame(frame);

window.addEventListener("pagehide", () => {
  textInput.dispose();
  pointerInput.dispose();
});
