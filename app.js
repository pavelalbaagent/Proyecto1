import { createGeometry, getCurveColor, updateGeometry } from "./src/geometry.js";

const canvas = document.querySelector("#canvas");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Canvas element not found.");
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
};

const COLORS = {
  background: "#f4f1e8",
  grid: "rgba(29, 29, 27, 0.075)",
  gridStrong: "rgba(29, 29, 27, 0.14)",
};

const geometry = createGeometry(137);
const forces = [];

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

  for (const curve of geometry.curves) {
    const color = getCurveColor(curve.index, geometry.curves.length);

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

function update(deltaSeconds) {
  state.time += deltaSeconds;

  updateGeometry(
    geometry,
    {
      width: state.width,
      height: state.height,
      centerX: state.centerX,
      centerY: state.centerY,
      minDimension: state.minDimension,
      time: state.time,
    },
    forces,
  );
}

function render() {
  clearCanvas();
  drawReferenceGrid();
  drawGeometry();
}

function frame(now) {
  const elapsedMs = Math.min(now - state.previousTime, 100);
  state.previousTime = now;
  state.deltaTime = elapsedMs / 1000;

  update(state.deltaTime);
  render();

  window.requestAnimationFrame(frame);
}

window.addEventListener("resize", resizeCanvas, { passive: true });

resizeCanvas();
window.requestAnimationFrame(frame);
