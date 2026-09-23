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
  ink: "#1d1d1b",
  guide: "rgba(29, 29, 27, 0.12)",
  guideStrong: "rgba(29, 29, 27, 0.20)",
};

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

function update(deltaSeconds) {
  state.time += deltaSeconds;
}

function drawGuides() {
  const radius = state.minDimension * 0.23;
  const pulse = 1 + Math.sin(state.time * 1.2) * 0.025;
  const orbitAngle = state.time * 0.42;
  const orbitRadius = radius * 0.62;

  ctx.save();
  ctx.translate(state.centerX, state.centerY);

  ctx.strokeStyle = COLORS.guide;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.arc(0, 0, radius * pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.62, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-radius, 0);
  ctx.lineTo(radius, 0);
  ctx.moveTo(0, -radius);
  ctx.lineTo(0, radius);
  ctx.stroke();

  ctx.strokeStyle = COLORS.guideStrong;
  ctx.beginPath();
  ctx.arc(0, 0, orbitRadius, orbitAngle - 0.42, orbitAngle + 0.42);
  ctx.stroke();

  const dotX = Math.cos(orbitAngle) * orbitRadius;
  const dotY = Math.sin(orbitAngle) * orbitRadius;

  ctx.fillStyle = COLORS.ink;
  ctx.beginPath();
  ctx.arc(dotX, dotY, 2.75, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function render() {
  clearCanvas();
  drawGuides();
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
