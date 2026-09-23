# Proyecto 1 — Generative Canvas

Proyecto 1 is a small static web experiment focused on interactive generative geometry.

The project is intentionally client-only: no backend, database, authentication, or external API is required.

## Project documents

- [SPEC.md](./SPEC.md) — product and experience specification.
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — phased implementation plan and checkpoints.

## Current status

**Completed: Phase 0 + Phase 1**

The current foundation includes:

- fullscreen responsive canvas;
- device-pixel-ratio aware rendering;
- `requestAnimationFrame` loop;
- separated update/render stages;
- delta-time handling;
- light canvas foundation suitable for the eventual projector-friendly visual direction;
- a small animated rendering diagnostic used as the Phase 1 checkpoint.

The current animation is intentionally a rendering-engine test, not the final generative artwork.

## Run locally

Because the app uses ES modules, serve the repository through a local static server.

For example:

```bash
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000
```

## Next phase

**Phase 2 — Generative Geometry Engine**

The next step is to replace the rendering diagnostic with the first real procedural geometry system.
