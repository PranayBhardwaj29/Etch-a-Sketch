const MIN_SIZE = 4;
const MAX_SIZE = 100;
const MAX_LEVEL = 10;
const KNOB_SPEED = 1.1;
const CLEAR_DELAY = 260;

const frame = document.getElementById('frame');
const board = document.getElementById('board');
const hint = document.getElementById('hint');
const sizeInput = document.getElementById('size');
const sizeLabel = document.getElementById('size-label');
const colorInput = document.getElementById('color');
const shadingInput = document.getElementById('shading');
const gridInput = document.getElementById('grid');
const hoverInput = document.getElementById('hover');
const shakeButton = document.getElementById('shake');
const knobLeft = document.getElementById('knob-left');
const knobRight = document.getElementById('knob-right');
const modeInputs = document.querySelectorAll('input[name="mode"]');
const solidInput = document.querySelector('input[name="mode"][value="solid"]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const state = {
  size: Number(sizeInput.value),
  mode: 'solid',
  rgb: [0, 0, 0],
  shading: false,
  pressed: false,
  last: null,
  pointer: null,
  turnX: 0,
  turnY: 0
};

let cells = [];
let levels = new Uint8Array(0);

function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function clampSize(value) {
  if (Number.isNaN(value)) {
    return state.size;
  }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(value)));
}

function updateSizeDisplay(size) {
  sizeLabel.textContent = `${size} × ${size}`;
  const fill = ((size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * 100;
  sizeInput.style.setProperty('--fill', `${fill}%`);
}

function updateHint() {
  hint.textContent = hoverInput.checked
    ? 'Move over the screen to draw'
    : 'Press and drag to draw';
}

function buildGrid(size) {
  state.size = size;
  state.last = null;
  board.style.setProperty('--size', size);

  const fragment = document.createDocumentFragment();
  cells = [];

  for (let i = 0; i < size * size; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cells.push(cell);
    fragment.appendChild(cell);
  }

  levels = new Uint8Array(size * size);
  board.replaceChildren(fragment);
  hint.classList.remove('hidden');
}

function clearBoard() {
  cells.forEach((cell) => {
    cell.style.backgroundColor = '';
  });
  levels.fill(0);
  state.last = null;
  hint.classList.remove('hidden');
}

function colorFor(alpha) {
  if (state.mode === 'rainbow') {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue} 85% 55% / ${alpha})`;
  }
  const [r, g, b] = state.rgb;
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

function paintCell(index) {
  const cell = cells[index];

  if (state.mode === 'eraser') {
    cell.style.backgroundColor = '';
    levels[index] = 0;
    return;
  }

  const level = state.shading ? Math.min(levels[index] + 1, MAX_LEVEL) : MAX_LEVEL;
  levels[index] = level;
  cell.style.backgroundColor = colorFor(level / MAX_LEVEL);
}

function locate(event) {
  const rect = board.getBoundingClientRect();
  const col = Math.floor(((event.clientX - rect.left) / rect.width) * state.size);
  const row = Math.floor(((event.clientY - rect.top) / rect.height) * state.size);

  if (col < 0 || row < 0 || col >= state.size || row >= state.size) {
    return null;
  }

  return { col, row };
}

function trace(from, to) {
  const points = [];
  let x = from.col;
  let y = from.row;
  const dx = Math.abs(to.col - x);
  const dy = -Math.abs(to.row - y);
  const sx = x < to.col ? 1 : -1;
  const sy = y < to.row ? 1 : -1;
  let error = dx + dy;

  while (true) {
    points.push({ col: x, row: y });

    if (x === to.col && y === to.row) {
      break;
    }

    const doubled = 2 * error;

    if (doubled >= dy) {
      error += dy;
      x += sx;
    }

    if (doubled <= dx) {
      error += dx;
      y += sy;
    }
  }

  return points;
}

function stroke(target) {
  const path = state.last ? trace(state.last, target).slice(1) : [target];

  path.forEach(({ col, row }) => {
    paintCell(row * state.size + col);
  });

  state.last = target;
  hint.classList.add('hidden');
}

function turnKnobs(event) {
  if (state.pointer) {
    state.turnX += (event.clientX - state.pointer.x) * KNOB_SPEED;
    state.turnY += (event.clientY - state.pointer.y) * KNOB_SPEED;
    knobLeft.style.setProperty('--turn', `${state.turnX}deg`);
    knobRight.style.setProperty('--turn', `${state.turnY}deg`);
  }

  state.pointer = { x: event.clientX, y: event.clientY };
}

function isDrawing() {
  return state.pressed || hoverInput.checked;
}

function endStroke() {
  state.pressed = false;
  state.last = null;
  state.pointer = null;
}

board.addEventListener('pointerdown', (event) => {
  state.pressed = true;
  const target = locate(event);

  if (target) {
    stroke(target);
  }
});

board.addEventListener('pointermove', (event) => {
  if (!isDrawing()) {
    state.last = null;
    state.pointer = null;
    return;
  }

  const target = locate(event);

  if (!target) {
    state.last = null;
    return;
  }

  turnKnobs(event);
  stroke(target);
});

board.addEventListener('pointerleave', () => {
  state.last = null;
  state.pointer = null;
});

window.addEventListener('pointerup', endStroke);
window.addEventListener('pointercancel', endStroke);

sizeInput.addEventListener('input', () => {
  updateSizeDisplay(clampSize(Number(sizeInput.value)));
});

sizeInput.addEventListener('change', () => {
  const size = clampSize(Number(sizeInput.value));
  sizeInput.value = size;
  updateSizeDisplay(size);
  buildGrid(size);
});

colorInput.addEventListener('input', () => {
  state.rgb = hexToRgb(colorInput.value);
  solidInput.checked = true;
  state.mode = 'solid';
});

modeInputs.forEach((input) => {
  input.addEventListener('change', () => {
    if (input.checked) {
      state.mode = input.value;
    }
  });
});

shadingInput.addEventListener('change', () => {
  state.shading = shadingInput.checked;
});

gridInput.addEventListener('change', () => {
  board.classList.toggle('lines', gridInput.checked);
});

hoverInput.addEventListener('change', () => {
  state.last = null;
  state.pointer = null;
  updateHint();
});

shakeButton.addEventListener('click', () => {
  if (reducedMotion.matches) {
    clearBoard();
    return;
  }

  if (frame.classList.contains('shaking')) {
    return;
  }

  frame.classList.add('shaking');
  window.setTimeout(clearBoard, CLEAR_DELAY);
});

frame.addEventListener('animationend', () => {
  frame.classList.remove('shaking');
});

state.rgb = hexToRgb(colorInput.value);
updateSizeDisplay(state.size);
updateHint();
buildGrid(state.size);
