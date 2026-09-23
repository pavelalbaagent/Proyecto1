const MAX_FORCES = 28;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createPointerInput(canvas, getDimensions) {
  const forces = [];
  const pointer = {
    x: 0,
    y: 0,
    down: false,
    moved: false,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
  };

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function pushForce(x, y, options = {}) {
    const dimensions = getDimensions();
    const radius =
      options.radius ??
      dimensions.minDimension * (0.09 + Math.min(1, options.speed ?? 0) * 0.00035);

    forces.push({
      x,
      y,
      radius,
      strength: options.strength ?? 1,
      radial: options.radial ?? 0.35,
      swirl: options.swirl ?? 1,
      life: 1,
      decay: options.decay ?? 0.9,
      age: 0,
    });

    if (forces.length > MAX_FORCES) {
      forces.splice(0, forces.length - MAX_FORCES);
    }
  }

  function handlePointerDown(event) {
    const position = pointerPosition(event);

    pointer.x = position.x;
    pointer.y = position.y;
    pointer.lastX = position.x;
    pointer.lastY = position.y;
    pointer.lastTime = performance.now();
    pointer.down = true;
    pointer.moved = false;

    canvas.setPointerCapture?.(event.pointerId);

    pushForce(position.x, position.y, {
      radius: getDimensions().minDimension * 0.13,
      strength: 1.75,
      radial: 0.55,
      swirl: 2.1,
      decay: 0.72,
    });
  }

  function handlePointerMove(event) {
    const position = pointerPosition(event);
    const now = performance.now();

    if (!pointer.down) {
      pointer.x = position.x;
      pointer.y = position.y;
      return;
    }

    const deltaMs = Math.max(8, now - pointer.lastTime);
    const dx = position.x - pointer.lastX;
    const dy = position.y - pointer.lastY;
    const distance = Math.hypot(dx, dy);
    const speed = distance / deltaMs;

    pointer.x = position.x;
    pointer.y = position.y;
    pointer.lastX = position.x;
    pointer.lastY = position.y;
    pointer.lastTime = now;

    if (distance < 1.5) {
      return;
    }

    pointer.moved = true;

    const normalizedSpeed = clamp(speed * 1.2, 0, 1.6);

    pushForce(position.x, position.y, {
      radius: getDimensions().minDimension * (0.085 + normalizedSpeed * 0.05),
      strength: 0.5 + normalizedSpeed * 1.25,
      radial: 0.18 + normalizedSpeed * 0.26,
      swirl: 0.85 + normalizedSpeed * 1.2,
      decay: 1.15,
      speed,
    });
  }

  function handlePointerUp(event) {
    const position = pointerPosition(event);

    pointer.x = position.x;
    pointer.y = position.y;
    pointer.down = false;

    if (pointer.moved) {
      pushForce(position.x, position.y, {
        radius: getDimensions().minDimension * 0.08,
        strength: 0.55,
        radial: -0.2,
        swirl: 0.8,
        decay: 1.55,
      });
    }

    canvas.releasePointerCapture?.(event.pointerId);
  }

  function handlePointerCancel() {
    pointer.down = false;
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      forces.length = 0;
    }
  }

  function update(deltaSeconds) {
    for (let index = forces.length - 1; index >= 0; index -= 1) {
      const force = forces[index];

      force.age += deltaSeconds;
      force.life -= deltaSeconds * force.decay;

      if (force.life <= 0) {
        forces.splice(index, 1);
      }
    }
  }

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerCancel);
  window.addEventListener("keydown", handleKeyDown);

  return {
    forces,
    update,
    dispose() {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerCancel);
      window.removeEventListener("keydown", handleKeyDown);
    },
  };
}
