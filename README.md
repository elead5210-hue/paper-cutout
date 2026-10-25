# paper-cutout

A small React app that draws a shape at its true size in millimetres. Click a shape in the toolbar, type its dimensions, and the shape redraws on every keystroke over a 10 mm grid.

Shapes: circle, square, rectangle, triangle and regular polygon.

## Requirements

- Node.js 18 or newer
- npm

## Run, test and build

```
npm install      # install dependencies
npm run dev      # start the dev server with hot reload
npm test         # run the unit and component tests once
npm run build    # typecheck, then create a production build in dist/
npm run preview  # serve the production build locally
```

To typecheck on its own, run `npx tsc --noEmit`.

## How it works

- The left panel holds a toolbar of shape buttons and one number input per dimension. The selected shape's button is highlighted and marked with `aria-pressed`.
- The right area draws the shape in an SVG where 1 SVG unit is 1 mm. The SVG's width and height are set in `mm`, so it renders at real size.
- Each shape remembers the values you last entered, so switching away and back loses nothing. Values are not saved between page loads.
- If a value is empty, out of range, or not a whole number where one is needed, the shape is hidden and a message appears in the panel. The page never shows `NaN`.
- Light and dark themes follow your system setting.

On-screen size depends on the pixel density your display reports, so measure against the grid or a ruler if you need exact size. `docs/verification.md` has a checklist for doing this.

## Project structure

```
src/
  main.tsx                    entry point
  App.tsx                     page layout and state (selected shape, entered values)
  shapes.ts                   shape definitions, geometry helpers and validation
  styles.css                  global styles, theme variables and the grid background
  components/
    ShapeToolbar.tsx          the toolbar of shape buttons
    ShapeInputs.tsx           one number input per field of the selected shape
    ShapeCanvas.tsx           the SVG drawing
  test/setup.ts               test setup (jest-dom matchers, cleanup)
  shapes.test.ts              geometry, validation and accessible label tests
  App.test.tsx                component tests for the behaviour
docs/
  verification.md             browser acceptance checklist and results log
```

## Adding a shape

All shapes are defined in the `SHAPES` array in `src/shapes.ts`. Add one entry and the toolbar, inputs, validation, drawing and label pick it up automatically.

Each entry has:

- `id` and `label`: the shape's identifier and the text on its toolbar button.
- `fields`: the inputs, each with `key`, `label`, `unit`, `defaultValue`, `min`, `max` and optionally `integer`.
- `build(values)`: returns the shape's `width` and `height` in mm and either a circle radius or a list of polygon points. Points are measured from the top-left of the bounding box.
- `describe(values)`: the plain-language text used as the SVG's accessible label, for example "Rectangle, 30 by 20 millimetres".

Add tests for the new shape's size and label in `src/shapes.test.ts`.

## Design decisions

| Decision | Choice |
|---|---|
| Triangle | Equilateral, point up, sized by side length. Height is side × √3 / 2. |
| Polygon | Regular, point up, sized by the diameter of the circle through its corners (corner to corner), with 3 to 64 whole-number sides. |
| Odd-sided polygons | Slightly shorter than the stated diameter, because no corner points straight down. Even-sided polygons span the full diameter. |
| Stroke | 0.3 mm, centred on the outline. The viewBox is padded by half the stroke width so nothing clips. The outline therefore extends about 0.15 mm beyond the stated size on each side. |
| ViewBox | Calculated from the shape's own bounding box, not a fixed size, so shapes are never clipped or offset. |
| Size limits | Dimensions run from 0.1 mm to 1000 mm. Change them in the `size()` helper in `src/shapes.ts`. |
| Input handling | Raw input is kept as text so a field can be cleared and retyped. It is validated on every change and the shape is only drawn when all fields are valid. |
| Accessibility | Every input has a visible label, errors are announced through a `role="alert"` region, and the SVG has an accessible label that updates with the values. |
| Theming | Colours are CSS variables in `src/styles.css`. Dark mode follows the system setting. |