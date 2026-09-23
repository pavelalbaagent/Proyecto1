# Proyecto 1 — Generative Canvas

Proyecto 1 is a small static web experiment focused on interactive generative geometry.

The project is intentionally client-only: no backend, database, authentication, or external API is required.

## Project documents

- [SPEC.md](./SPEC.md) — product and experience specification.
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — phased implementation plan and checkpoints.

## Current status

**Completed: Phase 0 → Phase 4**

The project currently includes:

- fullscreen responsive canvas;
- device-pixel-ratio aware rendering;
- `requestAnimationFrame` loop;
- separated update/render stages;
- delta-time handling;
- projector-friendly light visual language;
- procedural generative geometry;
- animated vector-field-style transformations;
- deterministic seeded geometry generation;
- click perturbations;
- drag-based forces whose intensity responds to pointer velocity;
- touch-compatible pointer events;
- decaying force fields;
- `Esc` reset for active disturbances.

### Current artistic checkpoint

Phase 4 is the first real playtest point.

The application should now behave as a complete interactive experiment:

1. A geometric system evolves continuously without input.
2. Clicking introduces localized disturbances.
3. Dragging deforms the field and creates flowing rotational effects.
4. The mathematical geometry remains visible beneath the interaction.
5. The light-mode presentation is suitable for large displays and projection.

The current system is intentionally still an experiment. Phase 5 will add text as a second input instrument.

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

## Source structure

```
Proyecto1/
├── index.html
├── styles.css
├── app.js
├── src/
│   ├── geometry.js
│   └── input.js
├── SPEC.md
├── IMPLEMENTATION_PLAN.md
└── README.md
```

## Next phase

**Phase 5 — Text as Input**

The next step is to make typed characters influence the geometry through deterministic seeds and parameter mappings.
