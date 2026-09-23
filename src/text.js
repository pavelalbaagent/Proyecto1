function hashText(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function normalize(value, min, max) {
  return min + (value / 0xffffffff) * (max - min);
}

export function textToParameters(value) {
  const text = value.trim();

  if (!text) {
    return {
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
  }

  const seed = hashText(text);
  const first = hashText(text + ":a");
  const second = hashText(text + ":b");
  const third = hashText(text + ":c");

  return {
    text,
    seed,
    density: Math.round(normalize(first, 22, 36)),
    symmetry: Math.round(normalize(second, 3, 9)),
    twist: normalize(third, 0.7, 1.45),
    frequency: 1.8 + ((seed ^ first) % 1200) / 1000,
    warp: ((second ^ third) % 1000) / 1000 * 0.22,
    speed: 0.72 + ((first ^ third) % 1000) / 1000 * 0.55,
    paletteShift: seed % 5,
  };
}

export function createTextInput({ input, onChange }) {
  let lastValue = "";

  function emit() {
    if (input.value === lastValue) {
      return;
    }

    lastValue = input.value;
    onChange(textToParameters(input.value));
  }

  input.addEventListener("input", emit);

  return {
    dispose() {
      input.removeEventListener("input", emit);
    },
  };
}
