# Etch-a-Sketch

A browser sketchpad inspired by the classic red-frame toy. Draw on a pixel grid, build up shading, switch to rainbow colors, and shake the frame to start over.

Built with plain HTML, CSS and JavaScript. No frameworks, no build step.

**Live demo:** https://pranaybhardwaj29.github.io/etch-a-sketch/

## Features

- Adjustable grid from 4 × 4 to 100 × 100 that always fills the same screen area
- Draw by hovering, or switch to press-and-drag
- Touch support for phones and tablets
- Three pens: solid color, rainbow, and eraser
- Progressive shading: each pass over a square adds 10% opacity, reaching full color in ten passes
- Continuous strokes, even when the pointer moves fast
- Knobs that turn as you draw
- Optional grid lines
- Shake animation to clear the screen
- Responsive layout and reduced-motion support

## Controls

| Control | Description |
| --- | --- |
| Grid size | Sets squares per side (4–100). Releasing the slider starts a new sketch. |
| Color | Picks the solid pen color. |
| Solid / Rainbow / Eraser | Selects the pen. Rainbow picks a random hue for every square. |
| Shading | Darkens a square by 10% on each pass. Works with solid and rainbow pens. |
| Grid lines | Shows or hides square outlines. |
| Draw on hover | On: draw by moving the pointer. Off: press and drag. |
| Shake to clear | Shakes the frame and wipes the screen. |

## Getting started

```bash
git clone https://github.com/PranayBhardwaj29/etch-a-sketch.git
cd etch-a-sketch
```

Open `index.html` in a browser. No install required.

Fonts load from Google Fonts. Without a connection, the app falls back to system fonts.

## Project structure

```
etch-a-sketch/
├── index.html
├── style.css
└── script.js
```

## How it works

- **Grid:** Squares are generated in JavaScript and laid out with Flexbox. Each square takes `100% / size` of the board width, so the board keeps its dimensions at any grid size.
- **Input:** One pointer listener on the board handles mouse and touch. Pointer coordinates map directly to a square index, so there are no per-square listeners, even at 10,000 squares.
- **Strokes:** Consecutive pointer positions are joined with Bresenham's line algorithm, so fast movement leaves no gaps.
- **Shading:** The pen color is applied through the alpha channel of the background color. A `Uint8Array` tracks the current level of every square.
- **Knobs:** Pointer movement updates a CSS custom property that rotates the knob graphics.

## Accessibility

- All controls are native form elements with labels and visible keyboard focus
- Motion respects `prefers-reduced-motion`
- The drawing surface is pointer-based

## Browser support

Current versions of Chrome, Edge, Firefox and Safari. The layout uses container queries and `:has()`.

## Credits

Based on the [Etch-a-Sketch project](https://www.theodinproject.com/lessons/foundations-etch-a-sketch) from The Odin Project.

Created by [Pranay Bhardwaj](https://github.com/PranayBhardwaj29).
