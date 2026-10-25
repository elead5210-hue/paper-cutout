# paper-cutout

A small React app that draws shapes at their true size in millimetres. Click a shape in the toolbar to place it in the work area, then select it and type its dimensions. The work area shows a centre point, and every placed shape is centred on it. A hierarchy panel on the right lists each component and its shape in a file-explorer style tree. The shape redraws on every keystroke over a 10 mm grid.

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

- The work area starts empty. Clicking a button in the toolbar places a new shape at that shape's default size and selects it. Clicking the same button again places another shape.
- Every placed shape is added as part of a new component. The component gets a default name ("Component 1", "Component 2", and so on) and contains the shape that was just added to the canvas area. The name is exposed on the placed shape as a `data-component` attribute and as its tooltip.
- The hierarchy panel on the right lists every component by name in a tree. Each component is a top-level row, and the shape that was added to the canvas area as part of it is nested beneath as its child. Click a component's row to select it, which also selects its shape in the work area. The selected row is highlighted and marked with `aria-selected`. The panel shows "No components yet." until a shape is placed.
- The left panel holds the toolbar and one number input per dimension of the selected shape. Click a placed shape (its component) in the work area to select it and edit its dimensions. The selected shape has a solid outline and is marked with `aria-pressed`.
- The work area draws each placed shape in an SVG where 1 SVG unit is 1 mm. The SVG's width and height are set in `mm`, so it renders at real size.
- Every placed shape keeps its own values. Values are not saved between page loads.
- If a value is empty, out of range, or not a whole number where one is needed, that shape is hidden and a message appears in the panel. The page never shows `NaN`.
- The work area always shows a centre point marker, even when it is empty. Every placed shape is centred on that point and stays centred when its dimensions change. Shapes placed later sit on top of earlier ones, so click a shape to select it.
- Light and dark themes follow your system setting.

On-screen size depends on the pixel density your display reports, so measure against the grid or a ruler if you need exact size. `docs/verification.md` has a checklist for doing this.

## Project structure

```
src/
  main.tsx                    entry point
  App.tsx                     page layout and state (components, which one is selected)
  component.ts                the Component type and createComponent(), which wraps a new shape in a default-named component
  component.test.ts           tests for default naming, unique ids and default values
  placed.ts                   the PlacedShape type and createPlaced(), which starts a new shape at its defaults
  shapes.ts                   shape definitions, geometry helpers and validation
  styles.css                  global styles, theme variables, the grid background, the centre point and centring layout and the hierarchy tree
  components/
    ShapeToolbar.tsx          the toolbar of shape buttons that place shapes
    ShapeInputs.tsx           one number input per field of the selected shape
    WorkArea.tsx              renders the centre point and every component's shape, and handles selecting one
    HierarchyPanel.tsx        the right-hand tree of components, each with its shape nested as a child, and selecting a component from it
    ShapeCanvas.tsx           the SVG drawing of one shape
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
| Placing shapes | A toolbar button places a new shape every time it is clicked, with that shape's default values, and selects it. The work area is empty on load. |
| Centre point | The work area always draws a small ring at its exact centre, including when it is empty. It ignores pointer events, so it never blocks clicking a shape. |
| Centring | Every placed shape is positioned at the centre of the work area with CSS (`left: 50%; top: 50%` and `translate(-50%, -50%)`), so it stays centred whatever its size or the window size. Shapes are not draggable. |
| Components | Placing a shape creates a component that contains it: `{ id, name, shape }`. The shape is the `PlacedShape` with its own values, so edits to a shape change only the component it belongs to. |
| Default names | A new component is named "Component N", where N is one more than the highest default number already in use, so a name is never repeated, even after a gap. Names that are not in that format are ignored when numbering. Components cannot be renamed or removed yet. |
| Hierarchy panel | A panel on the right of the page, as the third column of the page grid. On narrow screens it moves below the work area, with a limited height so it scrolls inside itself. It lists components in the order they were placed. |
| Tree structure | The tree uses `role="tree"`, with each component as a `treeitem` and a `group` holding its shape as a child `treeitem`. Components are always expanded, and the marker beside each is decorative (`aria-hidden`), as there is nothing to collapse yet. |
| Child shape reference | The child under a component shows the shape's type label (for example "Circle") and carries the shape's instance id as `data-shape-ref`. It stays listed while the shape is hidden by invalid input, so the tree always matches the components that exist. |
| Tree selection | Only the component row is a button. Clicking it selects the component, the same as clicking its shape in the work area, and both views stay in sync because they share one selected id. The child row is not clickable, and is highlighted along with its parent. |
| Placed shape values | Each placed shape has its own id and its own values, so the same shape type can be placed more than once without the copies sharing values. |
| Input handling | Raw input is kept as text so a field can be cleared and retyped. It is validated on every change and a shape is only drawn when all its fields are valid. |
| Accessibility | Every input has a visible label, errors are announced through a `role="alert"` region, and the SVG has an accessible label that updates with the values. |
| Theming | Colours are CSS variables in `src/styles.css`. Dark mode follows the system setting. |