# Browser verification log

Acceptance checks for the paper-cutout shape viewer. Work through each section in a real browser, tick the box or write the result, and log anything that fails in the Issues table at the end. Do not tick a box you have not checked yourself.

## 1. Environment

Fill this in before you start. Results only apply to the setup recorded here.

| Item | Value |
|---|---|
| Date | |
| Tester | |
| Browser and version | |
| Operating system | |
| Display (model, resolution, scaling %) | |
| Commit or build checked | |
| How it was served | `npm run dev` or `npm run build && npm run preview` |

## 2. Automated checks

Run from the project root. Re-run after any fix.

| Command | Expected | Last result |
|---|---|---|
| `npm install` | completes without errors | |
| `npx tsc --noEmit` | no output | |
| `npm test` | all tests pass | |
| `npm run build` | build succeeds and writes `dist/` | |
| `npm run preview` | serves the production build from `dist/` without errors | |

These do not replace the browser checks below. They cover the geometry numbers, not how anything looks or measures on screen.

### 2.1 Production build checks

Run these against the final commit, serving the app with `npm run build && npm run preview` (not the dev server), and record the commit in the Environment table. Clear the "Last result" column above and fill it in again from this run. Do not tick a box you have not checked yourself.

- [ ] The browser tab title reads "paper-cutout", not "Shape viewer".
- [ ] The page loads with no errors or failed requests in the browser console or network tab (JavaScript and CSS load from relative paths).
- [ ] Placing a shape, selecting it and editing its dimensions works in the preview build.
- [ ] Reloading the page shows an empty work area with the centre point.

## 3. True-size check

Browsers assume a standard pixel density, so a shape can be mathematically correct and still measure slightly off on your display. Calibrate first, then measure shapes.

### 3.1 Calibrate against the grid

1. Open the app in light mode at 100% browser zoom.
2. Hold a ruler to the screen and measure one grid square (should be 10 mm) and a run of five (should be 50 mm).
3. Record the result.

| Measured 10 mm square | Measured 50 mm run | Scale factor (measured / nominal) |
|---|---|---|
| | | |

If the scale factor is not about 1.00, the display is reporting its pixel density inaccurately. Judge the shapes against the grid (a 20 mm shape should span two grid squares) or multiply expected sizes by the scale factor. Do not treat this as an app fault.

### 3.2 Measure each shape

Place each shape from the toolbar and set the inputs shown, then measure the outer edge to outer edge of the bounding box. The outline is 0.3 mm wide, centred on the true edge, so the visible outline adds about 0.15 mm on each side. Accept up to 0.5 mm difference after calibration.

| Shape | Inputs | Expected width x height (mm) | Measured | Pass |
|---|---|---|---|---|
| Circle | Diameter 20 | 20 x 20 | | ☐ |
| Square | Side 20 | 20 x 20 | | ☐ |
| Rectangle | Width 30, Height 20 | 30 x 20 | | ☐ |
| Triangle | Side 20 | 20 x 17.32 | | ☐ |
| Polygon (even sides) | Sides 6, Diameter 20 | 17.32 x 20 | | ☐ |
| Polygon (odd sides) | Sides 5, Diameter 20 | 19.02 x 18.09 | | ☐ |

Notes:
- The triangle and polygons point up.
- An odd-sided polygon is shorter than its diameter because no vertex points down. This is expected, not a fault.
- Also try one or two other sizes per shape (for example 50 mm and 5 mm) to confirm the shape scales rather than matching only the default.

## 4. Placing and selecting shapes

| Check | Expected | Pass |
|---|---|---|
| Fresh page load | The work area is empty apart from a small ring (the centre point) in the middle of it, with the hint to click a shape in the toolbar just below it. No input fields are shown and there is no error message | ☐ |
| Look at the shape toolbar | Buttons for Circle, Square, Rectangle, Triangle and Polygon are shown, and none is highlighted | ☐ |
| Click each shape button | A new shape of that type appears in the work area at its default size, it is selected (solid outline), and the panel shows that shape's input fields | ☐ |
| Click the same shape button twice | Two separate shapes are placed, and the newest one is selected | ☐ |
| Click a placed shape | It becomes selected, the others lose their outline, and the panel shows that shape's own fields and values | ☐ |
| Type in a field | Only the selected shape redraws, on every keystroke and not only on blur | ☐ |

### 4.1 Each placed shape keeps its own values

1. Place a Circle and set Diameter to 35.
2. Place a Rectangle and set Width to 50 and Height to 12.
3. Place a Polygon and set Sides to 8 and Diameter to 40.
4. Place a second Circle and leave it at its default.
5. Click each placed shape in turn and read the panel.

| Placed shape | Expected when selected | Pass |
|---|---|---|
| First Circle | Diameter 35 | ☐ |
| Rectangle | Width 50, Height 12 | ☐ |
| Polygon | Sides 8, Diameter 40 | ☐ |
| Second Circle | Diameter 20, unaffected by changes to the first Circle | ☐ |

Reloading the page empties the work area. That is expected, as shapes and values are not saved between visits.

### 4.2 Components and default names

Each placed shape is added as part of a new component with a default name. The name is listed in the hierarchy panel (see 4.4). You can also check it by hovering over the placed shape (the tooltip shows the name) or by inspecting the element in the browser developer tools, where it appears as the `data-component` attribute on the shape's button.

| Check | Expected | Pass |
|---|---|---|
| Fresh page load | No components exist: hovering the work area shows no component names, and no element has a `data-component` attribute | ☐ |
| Place the first shape (any type) | The shape is drawn inside a component named "Component 1" | ☐ |
| Place a second and third shape of different types | They are named "Component 2" and "Component 3", in the order they were placed | ☐ |
| Place the same shape type twice | Each click creates its own new component with its own next name, and the two do not share a component or values | ☐ |
| Hover over each placed shape | The tooltip shows the name of the component that contains that shape | ☐ |
| Select a component by clicking it and edit a field | Only the shape inside that component changes, and its component name stays the same | ☐ |
| Make a shape invalid, then fix it | The shape disappears while invalid and comes back in the same component with the same name | ☐ |
| Place ten or more shapes | Names keep counting up ("Component 10", "Component 11") and no name is repeated | ☐ |
| Reload the page, then place a shape | The count starts again from "Component 1", as components are not saved between visits | ☐ |

### 4.3 Centre point and centring

| Check | Expected | Pass |
|---|---|---|
| Centre point on load | A small ring is visible at the middle of the work area before any shape is placed, and it is clearly visible against the grid | ☐ |
| Place a Circle | The circle's middle sits exactly on the centre point, with the ring visible on top of it | ☐ |
| Place a Rectangle, Triangle and Polygon in turn | Each one is centred on the same centre point, not offset by its size or where it points | ☐ |
| Change a placed shape's dimensions (for example Diameter 20, then 50, then 5) | The shape grows and shrinks around the centre point and its middle does not move | ☐ |
| Place several shapes | They all share the same centre and sit on top of one another, and only one centre point is shown | ☐ |
| Click a shape in the overlap | The topmost shape under the pointer is selected, and the centre point does not block the click | ☐ |
| Resize the browser window, and rotate to landscape on a phone | The centre point stays in the middle of the work area and the shapes stay centred on it | ☐ |
| Set a shape's value to something invalid | The shape is hidden but the centre point stays visible | ☐ |

### 4.4 Hierarchy panel

| Check | Expected | Pass |
|---|---|---|
| Fresh page load | A panel headed "Hierarchy" sits on the right of the page, beside the work area, and says "No components yet." | ☐ |
| Place a Circle | A row "Component 1" appears in the panel, with a smaller, indented row "Circle" nested beneath it as a child, joined by a vertical guide line | ☐ |
| Place a Square, then a Rectangle | "Component 2" with child "Square" and "Component 3" with child "Rectangle" are added below, in the order placed, and every component has exactly one child | ☐ |
| Place the same shape twice | Two separate components are listed, each with its own child, and the names differ | ☐ |
| Newest component | The row for the component just placed is highlighted, matching the selected outline on the shape in the work area | ☐ |
| Click a component row | That component is selected: its row is highlighted, its shape in the work area gets the selected outline, and the left panel shows that shape's fields and values | ☐ |
| Click a placed shape in the work area | The matching row in the hierarchy panel becomes highlighted and the previous row loses its highlight | ☐ |
| Click the child (shape) row | Nothing changes, as only the component row is clickable | ☐ |
| Make a shape invalid | The shape disappears from the work area but its component and child stay listed in the panel, and return to normal once the value is fixed | ☐ |
| Long list (place 20 or more shapes) | The panel scrolls inside itself, and the page and work area layout do not change | ☐ |
| Keyboard | Tab reaches each component row in order, a clear focus outline shows on the focused row, and Enter or Space selects it | ☐ |
| Screen reader (optional) | The panel is announced as "Hierarchy", the list as a tree of "Components", and the selected component is announced as selected | ☐ |
| Reload the page | The panel is empty again, as components are not saved between visits | ☐ |

## 5. Invalid input

For each case, place the shape from the toolbar and enter the value in its field. The shape should disappear, a message should appear in the control panel, and the page should not crash or show NaN. Then enter a valid value and confirm the shape comes back.

| Shape and field | Input | Expected message | Pass |
|---|---|---|---|
| Circle, Diameter | (empty) | Diameter: enter a number. | ☐ |
| Circle, Diameter | 0 | Diameter: enter a value from 0.1 to 1000. | ☐ |
| Circle, Diameter | -5 | Diameter: enter a value from 0.1 to 1000. | ☐ |
| Circle, Diameter | 0.05 | Diameter: enter a value from 0.1 to 1000. | ☐ |
| Circle, Diameter | 1001 | Diameter: enter a value from 0.1 to 1000. | ☐ |
| Circle, Diameter | e | Diameter: enter a number. | ☐ |
| Polygon, Sides | 2 | Number of sides: enter a value from 3 to 64. | ☐ |
| Polygon, Sides | 65 | Number of sides: enter a value from 3 to 64. | ☐ |
| Polygon, Sides | 5.5 | Number of sides: use a whole number. | ☐ |
| Rectangle | Width valid, Height empty | Height: enter a number. | ☐ |

Also check:
- ☐ The message area does not shift the layout noticeably when it appears or disappears.
- ☐ Other placed shapes stay visible while one shape has an invalid value.
- ☐ After an invalid value, selecting a different placed shape or placing a new one shows that shape normally, with no leftover message.
- ☐ The browser console shows no errors during any of the above.

## 6. Large shapes and scrolling

| Check | Expected | Pass |
|---|---|---|
| Place a Circle and set Diameter to 1000 | The circle stays centred on the centre point and is cropped at the edges of the work area, and the page itself does not scroll | ☐ |
| Place many shapes | They stack on the centre point, each centred, and the layout does not change | ☐ |
| Same, whole page | The page itself never scrolls sideways | ☐ |
| Same, browser zoom 50% to 200% | Layout stays intact | ☐ |

## 7. Dark and light mode

Test with the operating system or browser set to each theme. If the app has no manual theme toggle yet, change the OS or browser setting and reload.

| Check | Light | Dark |
|---|---|---|
| Page and panel backgrounds change | ☐ | ☐ |
| Grid lines visible but subtle | ☐ | ☐ |
| Shape fill and outline visible against the grid | ☐ | ☐ |
| Labels, inputs and the note are readable | ☐ | ☐ |
| Error message is readable | ☐ | ☐ |
| Focus outline visible on each toolbar button, each placed shape and each input (use Tab) | ☐ | ☐ |
| Selected placed shape has an outline that is clearly visible compared with unselected shapes | ☐ | ☐ |
| Hierarchy panel background, border, heading and tree text are readable, and the guide line and marker symbols are visible but subtle | ☐ | ☐ |
| Selected component row in the hierarchy panel is clearly highlighted compared with the others | ☐ | ☐ |
| Focus outline visible on each hierarchy panel row (use Tab) | ☐ | ☐ |

## 8. Narrow-screen layout

Check with a real phone, or browser developer tools set to a width of 640 px or less (for example 375 px wide).

| Check | Expected | Pass |
|---|---|---|
| Control panel position | Stacks above the drawing area | ☐ |
| Panel border | Line sits below the panel, not beside it | ☐ |
| Drawing area | Fills the remaining height and shows the grid | ☐ |
| Hierarchy panel position | Sits below the drawing area, full width, with a line above it rather than beside it | ☐ |
| Hierarchy panel height | Is limited in height and scrolls inside itself when many components are listed, without pushing the drawing area off screen | ☐ |
| Hierarchy panel rows | Each component row is easy to tap and the names are not cut off unreadably | ☐ |
| Shape toolbar | Buttons wrap onto extra rows if needed, none are cut off, and each is easy to tap | ☐ |
| Inputs | Full width, tappable, number keyboard appears on a phone | ☐ |
| Shape wider than the screen (for example Rectangle 300 x 20) | Stays centred on the centre point and is cropped at the sides of the drawing area, and the page does not scroll sideways | ☐ |
| Rotate to landscape | Layout switches correctly at the breakpoint | ☐ |

## 9. Issues and fixes

Log every failure here, including what you changed. Re-test the affected rows afterwards.

| # | Section | What failed | Fix (file and change) | Re-tested |
|---|---|---|---|---|
| 1 | | | | ☐ |
| 2 | | | | ☐ |
| 3 | | | | ☐ |

## 10. Sign-off

| Item | Value |
|---|---|
| All sections passed or issues fixed and re-tested | ☐ |
| Remaining known differences (for example display calibration) | |
| Signed off by | |
| Date | |