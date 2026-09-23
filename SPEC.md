# Proyecto 1 — Generative Canvas

## 1. Concept

Proyecto 1 is a small static web application for interactive generative art.

The user sees a nearly empty canvas. Mouse or touch interactions introduce forces, waves, and perturbations into a mathematical system that generates abstract artwork in real time.

A text field is also part of the interaction: characters influence visual parameters so that typing changes the behavior of the system.

The intended feeling is:

> "I am manipulating a living mathematical entity."

## 2. Goals

The application should demonstrate that a completely static web app can be:

- visually attractive;
- highly interactive;
- mathematically interesting;
- responsive to user input;
- independent of a backend, accounts, or external APIs;
- runnable directly in a browser.

No persistence is required.

## 3. Constraints

The app must run entirely on the client.

It must not require:

- a backend;
- a database;
- authentication;
- cookies for core functionality;
- external API calls;
- third-party services required for execution;
- persistent storage.

The target deployment should be compatible with GitHub Pages.

## 4. Core experience

On first load, the canvas should occupy nearly the entire viewport and present a minimal animated abstract field.

The interface should feel closer to a visual instrument than a conventional drawing application.

Primary interaction surfaces:

1. Full-screen canvas.
2. Small, unobtrusive text input.
3. Optional minimal reset affordance.

## 5. Mouse and touch interaction

### Click

A click creates a localized perturbation or force.

Possible effects include:

- waves;
- expansion;
- turbulence;
- particle attraction or repulsion;
- line deformation;
- color changes.

The same input should not necessarily produce exactly the same visible result every time.

### Drag

Dragging acts like a hand moving through smoke or fluid.

The current pointer position and movement velocity affect the field. Fast motion should generally create stronger disturbances; slow movement should create gentler ones.

Touch input should map naturally to the same interaction model.

## 6. Mathematical model

The initial engine should use a procedural vector field.

A particle can conceptually contain:

```js
{
  x,
  y,
  vx,
  vy,
  life
}
```

Each animation step follows the pipeline:

```
position
  -> evaluate vector field
  -> apply external forces
  -> update velocity
  -> update position
  -> render
```

The first implementation can combine simple mathematical functions such as:

- sin(x)
- cos(y)
- sin(x + y)
- procedural noise

Later iterations may explore:

- Perlin/simplex-style noise;
- rotational fields;
- attractors;
- turbulence;
- layered procedural fields.

The first prototype should favor simple mathematics with interesting visual behavior over unnecessary complexity.

## 7. Fractals and advanced mathematics

Fractal techniques are an exploration area rather than a hard requirement for the first prototype.

Candidates include:

- Mandelbrot-derived parameters;
- Julia sets;
- iterated function systems;
- recursive fields;
- strange attractors.

The goal is not to build a mathematical fractal viewer. Fractal and dynamical-system concepts should serve as material for the artwork.

## 8. Text as an instrument

A small text input allows the user to influence the visual system through characters.

Characters can be converted into numeric values, for example:

```js
char.charCodeAt(0)
```

Those values can be mapped to parameters such as:

- frequency;
- turbulence;
- particle density;
- rotation;
- color phase;
- force strength;
- deterministic seed.

Conceptually:

```
character
  -> numeric value
  -> parameter mapping
  -> changed visual behavior
```

Different strings should lead to visibly different states.

The text should feel like an instrument, not a configuration panel. Avoid exposing raw controls such as `Speed: 42` or `Noise: 0.82`.

## 9. Visual language

Initial aesthetic:

- near-black background;
- particles, lines, trails, and waves;
- subtle layered color;
- organic, fluid, atmospheric motion.

Desired visual associations:

- ink;
- smoke;
- dust;
- cosmic matter;
- fluid;
- energy;
- microscopic organisms.

Avoid a conventional "tech dashboard" appearance.

## 10. Rendering

Start with HTML Canvas 2D.

Reasons:

- no dependency required;
- broad browser support;
- simple API;
- sufficient for the first prototype.

Do not move to WebGL or WebGPU unless the visual or performance requirements justify it.

## 11. Animation

Use `requestAnimationFrame()`.

Conceptually:

```js
function animate(time) {
  update(time);
  render();
  requestAnimationFrame(animate);
}
```

Simulation should be as frame-rate independent as practical so behavior remains consistent across devices.

## 12. Responsive behavior

The experience should work on:

- desktop;
- laptop;
- tablet;
- phone.

The canvas should fill the available viewport.

Touch should provide equivalents for click and drag behavior.

## 13. Minimal UI

Required:

- full-screen canvas;
- text input.

Optional:

- subtle status text;
- reset control.

The UI should stay visually quiet so the generated artwork remains the focus.

## 14. Reset

Provide a simple way to return to the initial state, for example:

- an `ESC` keyboard shortcut; or
- a small `RESET` control.

Reset should clear particles, restore initial parameters, and recreate the initial field state.

## 15. Randomness and determinism

Randomness may be used for visual richness, but the entire system should not be arbitrary.

Where practical:

```
user input
  -> deterministic seed
  -> procedural generation
```

This allows the same input and seed to reproduce a recognizable visual state while still allowing dynamic interaction.

## 16. Architecture

A likely project structure:

```
Proyecto1/
├── index.html
├── styles.css
├── app.js
├── src/
│   ├── canvas.js
│   ├── particles.js
│   ├── field.js
│   ├── input.js
│   └── randomness.js
└── README.md
```

The implementation may start simpler and be modularized only as complexity grows.

## 17. Implementation phases

### Phase 0 — Foundation

Build:

- HTML shell;
- full-screen canvas;
- base styles;
- animation loop;
- resize handling.

Definition of done: a blank but correctly running static canvas application.

### Phase 1 — Particle Field

Implement:

- particles;
- movement;
- vector field;
- rendering;
- trails.

Definition of done: the canvas continuously produces abstract animated behavior without user input.

### Phase 2 — Mouse Interaction

Add:

- click forces;
- drag forces;
- velocity-based interaction strength;
- smooth decay.

Definition of done: users can visibly "touch" and manipulate the field.

### Phase 3 — Text Interaction

Add:

- text input;
- character-to-number mapping;
- seed generation;
- parameter changes.

Definition of done: different text inputs produce clearly different visual behavior.

### Phase 4 — Visual Polish

Refine:

- composition;
- trails;
- blending;
- lighting;
- color;
- density;
- transitions;
- performance.

Definition of done: the result feels like a cohesive visual artwork rather than a raw technical demo.

### Phase 5 — Advanced Mathematics

Experiment with:

- Julia sets;
- attractors;
- recursive fields;
- layered noise;
- mathematical transformations.

Only keep techniques that meaningfully improve the visual experience.

### Phase 6 — Publish

Prepare:

- README;
- favicon;
- basic metadata;
- GitHub Pages deployment;
- development and deployment instructions.

Definition of done: the project is publicly accessible as a self-contained static web experience.

## 18. Success criteria

A first-time user should be able to:

1. intuitively discover that the canvas is interactive;
2. create interesting visual changes with clicks and dragging;
3. discover that typing changes the system;
4. experiment without needing detailed instructions;
5. use the experience without login, installation, or setup.

Technically, the runtime model should remain:

```
Browser
  -> index.html
  -> JavaScript
  -> Canvas
  -> everything runs locally
```

## 19. Design principle

The guiding principle is:

> **Complexity should live beneath the surface, not in the interface.**

The user should see a simple canvas and interact with it naturally. The mathematical complexity — particles, vector fields, noise, seeds, fractals, and dynamical systems — should remain mostly invisible and express itself through the behavior of the artwork.

## Status

Spec version: 0.1  
Repository: `pavelalbaagent/Proyecto1`  
Default branch: `main`
