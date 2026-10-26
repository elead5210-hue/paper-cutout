import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

type User = ReturnType<typeof userEvent.setup>

const setField = async (user: User, label: string, value: string) => {
  const input = screen.getByLabelText(label)
  await user.clear(input)
  if (value !== '') await user.type(input, value)
}

// Clicking a toolbar button arms that shape (a preview follows the cursor); clicking the
// work area then places it as a new component and selects it.
const armShape = (user: User, id: string) =>
  user.click(screen.getByRole('button', { name: new RegExp(`^${id}$`, 'i') }))

const chooseShape = async (user: User, id: string) => {
  await armShape(user, id)
  await user.click(screen.getByTestId('work-area'))
}

// The button wrapping a placed shape, found through the shape's accessible label.
const placedButton = (name: string) => screen.getByRole('img', { name }).closest('button')!

// The tree row (list item) for a component in the hierarchy panel, found by the component's name.
const treeNode = (name: string) =>
  within(screen.getByRole('tree', { name: 'Components' }))
    .getByRole('button', { name })
    .closest('li')!

// Placed shape drawings only: the work area's centre point marker is also an image role.
const shapeImages = () =>
  screen.queryAllByRole('img').filter((el) => el.getAttribute('data-testid') !== 'centre-point')

describe('first load', () => {
  it('starts with an empty work area', () => {
    render(<App />)

    expect(shapeImages()).toHaveLength(0)
    expect(screen.getByText('Click a shape in the toolbar to place it here.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Diameter')).not.toBeInTheDocument()
  })

  it('shows no error message', () => {
    render(<App />)
    expect(screen.getByRole('alert')).toBeEmptyDOMElement()
  })

  it('shows a toolbar button for each of the five shapes', () => {
    render(<App />)
    const toolbar = screen.getByRole('toolbar', { name: 'Shapes' })
    const buttons = Array.from(toolbar.querySelectorAll('button')).map((b) => b.textContent)
    expect(buttons).toEqual(['Circle', 'Square', 'Rectangle', 'Triangle', 'Polygon'])
    expect(screen.getByRole('button', { name: 'Square' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('places a shape at its default size when its button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    expect(screen.getByRole('img', { name: 'Circle, 20 millimetres diameter' })).toBeInTheDocument()
    expect(screen.getByLabelText('Diameter')).toHaveValue(20)
    expect(screen.queryByText('Click a shape in the toolbar to place it here.')).not.toBeInTheDocument()
  })
})

describe('placing and selecting shapes', () => {
  it('swaps the input fields for the selected shape', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'rectangle')
    expect(screen.getByLabelText('Width')).toHaveValue(30)
    expect(screen.getByLabelText('Height')).toHaveValue(20)
    expect(screen.queryByLabelText('Diameter')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Rectangle, 30 by 20 millimetres' })).toBeInTheDocument()
  })

  it('places the same shape twice as two separate shapes', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'circle')

    expect(shapeImages()).toHaveLength(2)
  })

  it('selects the newest shape and lets you reselect another by clicking it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '35')
    await chooseShape(user, 'rectangle')

    expect(screen.queryByLabelText('Diameter')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Width')).toHaveValue(30)
    expect(placedButton('Rectangle, 30 by 20 millimetres')).toHaveAttribute('aria-pressed', 'true')

    await user.click(placedButton('Circle, 35 millimetres diameter'))
    expect(screen.getByLabelText('Diameter')).toHaveValue(35)
    expect(placedButton('Circle, 35 millimetres diameter')).toHaveAttribute('aria-pressed', 'true')
    expect(placedButton('Rectangle, 30 by 20 millimetres')).toHaveAttribute('aria-pressed', 'false')
  })

  it('edits only the selected shape', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '30')

    expect(screen.getByRole('img', { name: 'Circle, 20 millimetres diameter' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Circle, 30 millimetres diameter' })).toBeInTheDocument()
  })

  it('leaves untouched shapes at their defaults', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '35')

    await chooseShape(user, 'square')
    expect(screen.getByLabelText('Side length')).toHaveValue(20)

    await chooseShape(user, 'triangle')
    expect(screen.getByLabelText('Side length')).toHaveValue(20)
  })

  it('redraws on every keystroke', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '4')
    expect(screen.getByRole('img', { name: 'Circle, 4 millimetres diameter' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Diameter'), '5')
    expect(screen.getByRole('img', { name: 'Circle, 45 millimetres diameter' })).toBeInTheDocument()
  })
})

describe('components', () => {
  it('has no components on load', () => {
    const { container } = render(<App />)

    expect(container.querySelectorAll('[data-component]')).toHaveLength(0)
  })

  it('creates a component named "Component 1" containing the first shape placed', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')

    const component = placedButton('Circle, 20 millimetres diameter')
    expect(component).toHaveAttribute('data-component', 'Component 1')
    expect(component).toHaveAttribute('title', 'Component 1')
    expect(component).toContainElement(screen.getByRole('img', { name: 'Circle, 20 millimetres diameter' }))
  })

  it('gives each further shape the next default name, whatever its type', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'square')
    await chooseShape(user, 'circle')
    await chooseShape(user, 'polygon')

    const { container } = render(<></>)
    expect(container).toBeEmptyDOMElement()

    const names = Array.from(document.querySelectorAll('[data-component]')).map((el) =>
      el.getAttribute('data-component')
    )
    expect(names).toEqual(['Component 1', 'Component 2', 'Component 3', 'Component 4'])
  })

  it('creates a separate component each time the same shape is placed', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'triangle')
    await chooseShape(user, 'triangle')

    const components = Array.from(document.querySelectorAll('[data-component]'))
    expect(components).toHaveLength(2)
    for (const component of components) {
      expect(component.querySelectorAll('svg, [role="img"]').length).toBeGreaterThan(0)
    }
  })

  it('selects a component by clicking it and edits the shape inside it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'square')
    await user.click(placedButton('Circle, 20 millimetres diameter'))

    expect(placedButton('Circle, 20 millimetres diameter')).toHaveAttribute('aria-pressed', 'true')
    await setField(user, 'Diameter', '33')

    const resized = placedButton('Circle, 33 millimetres diameter')
    expect(resized).toHaveAttribute('data-component', 'Component 1')
    expect(placedButton('Square, 20 millimetres per side')).toHaveAttribute(
      'data-component',
      'Component 2'
    )
  })

  it('keeps the component name when the shape is hidden by invalid input and restored', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '')
    expect(document.querySelectorAll('[data-component]')).toHaveLength(0)

    await setField(user, 'Diameter', '25')
    expect(placedButton('Circle, 25 millimetres diameter')).toHaveAttribute(
      'data-component',
      'Component 1'
    )
  })
})

describe('hierarchy panel', () => {
  it('is shown on the page and has no components on load', () => {
    render(<App />)

    const panel = screen.getByRole('complementary', { name: 'Hierarchy' })
    expect(panel).toBeInTheDocument()
    expect(within(panel).getByText('No components yet.')).toBeInTheDocument()
    expect(screen.queryByRole('tree')).not.toBeInTheDocument()
  })

  it('lists each component by name', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'square')
    await chooseShape(user, 'circle')

    const tree = screen.getByRole('tree', { name: 'Components' })
    const names = Array.from(tree.querySelectorAll('.tree-name')).map((el) => el.textContent)
    expect(names).toEqual(['Component 1', 'Component 2', 'Component 3'])
    expect(screen.queryByText('No components yet.')).not.toBeInTheDocument()
  })

  it('nests the shape under its component as a child', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'rectangle')

    const first = within(treeNode('Component 1')).getByRole('group')
    expect(within(first).getByText('Circle')).toBeInTheDocument()
    expect(within(first).queryByText('Rectangle')).not.toBeInTheDocument()

    const second = within(treeNode('Component 2')).getByRole('group')
    expect(within(second).getByText('Rectangle')).toBeInTheDocument()
  })

  it('marks the newest component as selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'square')

    expect(treeNode('Component 2')).toHaveAttribute('aria-selected', 'true')
    expect(treeNode('Component 1')).toHaveAttribute('aria-selected', 'false')
  })

  it('selects a component when its tree row is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'rectangle')
    expect(screen.queryByLabelText('Diameter')).not.toBeInTheDocument()

    await user.click(within(treeNode('Component 1')).getByRole('button', { name: 'Component 1' }))

    expect(screen.getByLabelText('Diameter')).toHaveValue(20)
    expect(treeNode('Component 1')).toHaveAttribute('aria-selected', 'true')
    expect(treeNode('Component 2')).toHaveAttribute('aria-selected', 'false')
    expect(placedButton('Circle, 20 millimetres diameter')).toHaveAttribute('aria-pressed', 'true')
    expect(placedButton('Rectangle, 30 by 20 millimetres')).toHaveAttribute('aria-pressed', 'false')
  })

  it('follows the selection when a shape is clicked in the work area', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'square')
    await user.click(placedButton('Circle, 20 millimetres diameter'))

    expect(treeNode('Component 1')).toHaveAttribute('aria-selected', 'true')
    expect(treeNode('Component 2')).toHaveAttribute('aria-selected', 'false')
  })

  it('keeps a component listed while its shape is hidden by invalid input', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '')

    expect(shapeImages()).toHaveLength(0)
    expect(treeNode('Component 1')).toBeInTheDocument()
    expect(within(treeNode('Component 1')).getByText('Circle')).toBeInTheDocument()
  })
})

describe('centre point', () => {
  it('is shown on load, before any shape is placed', () => {
    render(<App />)

    expect(screen.getByRole('img', { name: 'Centre point' })).toBeInTheDocument()
    expect(screen.getAllByTestId('centre-point')).toHaveLength(1)
  })

  it('stays a single marker as shapes are placed', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'square')
    await chooseShape(user, 'polygon')

    expect(screen.getAllByTestId('centre-point')).toHaveLength(1)
    expect(shapeImages()).toHaveLength(3)
  })

  it('renders every placed shape in the work area alongside the centre point', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await chooseShape(user, 'rectangle')

    const workArea = screen.getByTestId('work-area')
    const centre = screen.getByTestId('centre-point')
    expect(centre.parentElement).toBe(workArea)

    const circle = placedButton('Circle, 20 millimetres diameter')
    const rectangle = placedButton('Rectangle, 30 by 20 millimetres')
    for (const button of [circle, rectangle]) {
      expect(button).toHaveClass('placed')
      expect(button.parentElement).toBe(workArea)
    }
  })

  it('keeps a resized shape in the centred layout', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '45')

    const resized = placedButton('Circle, 45 millimetres diameter')
    expect(resized).toHaveClass('placed')
    expect(resized.parentElement).toBe(screen.getByTestId('work-area'))
  })

  it('stays visible when a shape is hidden by invalid input', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '')

    expect(shapeImages()).toHaveLength(0)
    expect(screen.getByRole('img', { name: 'Centre point' })).toBeInTheDocument()
  })
})

describe('snapping to existing objects', () => {
  const snapToggle = () => screen.getByRole('checkbox', { name: 'Snap to objects' })

  it('offers a snap toggle that is on by default', () => {
    render(<App />)

    expect(snapToggle()).toBeChecked()
    expect(screen.getByTestId('work-area')).toHaveAttribute('data-snap', 'on')
  })

  it('turns snapping off and on again from the toggle', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(snapToggle())
    expect(snapToggle()).not.toBeChecked()
    expect(screen.getByTestId('work-area')).toHaveAttribute('data-snap', 'off')

    await user.click(snapToggle())
    expect(snapToggle()).toBeChecked()
    expect(screen.getByTestId('work-area')).toHaveAttribute('data-snap', 'on')
  })

  it('keeps the toggle state when further shapes are placed as nested components', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await user.click(snapToggle())
    await chooseShape(user, 'square')

    expect(snapToggle()).not.toBeChecked()
    expect(screen.getByTestId('work-area')).toHaveAttribute('data-snap', 'off')
    expect(within(treeNode('Component 2')).getByText('Square')).toBeInTheDocument()
  })

  it('draws no snap guides when snapping is off', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(snapToggle())
    await chooseShape(user, 'circle')
    await chooseShape(user, 'square')

    expect(screen.queryAllByTestId('snap-guide')).toHaveLength(0)
  })

  it('does not change shape placement or editing', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await user.click(snapToggle())
    await setField(user, 'Diameter', '30')

    expect(screen.getByRole('img', { name: 'Circle, 30 millimetres diameter' })).toBeInTheDocument()
    expect(placedButton('Circle, 30 millimetres diameter')).toHaveAttribute(
      'data-component',
      'Component 1'
    )
  })
})

describe('cursor-following shape preview', () => {
  const preview = () => screen.queryByTestId('cursor-preview')

  it('shows no preview on load', () => {
    render(<App />)

    expect(preview()).not.toBeInTheDocument()
  })

  it('arms a shape without placing it when its toolbar button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await armShape(user, 'circle')

    expect(screen.getByRole('button', { name: 'Circle' })).toHaveAttribute('aria-pressed', 'true')
    expect(document.querySelectorAll('[data-component]')).toHaveLength(0)
  })

  it('shows a preview of the armed shape once the pointer is over the work area', async () => {
    const user = userEvent.setup()
    render(<App />)

    await armShape(user, 'rectangle')
    expect(preview()).not.toBeInTheDocument()

    await user.hover(screen.getByTestId('work-area'))
    expect(preview()).toBeInTheDocument()
    expect(preview()).toHaveAttribute('data-shape', 'rectangle')
  })

  it('hides the preview when the pointer leaves the work area', async () => {
    const user = userEvent.setup()
    render(<App />)

    await armShape(user, 'circle')
    await user.hover(screen.getByTestId('work-area'))
    expect(preview()).toBeInTheDocument()

    await user.unhover(screen.getByTestId('work-area'))
    expect(preview()).not.toBeInTheDocument()
  })

  it('switches the preview when another shape is clicked in the toolbar', async () => {
    const user = userEvent.setup()
    render(<App />)

    await armShape(user, 'circle')
    await user.hover(screen.getByTestId('work-area'))
    await armShape(user, 'square')
    await user.hover(screen.getByTestId('work-area'))

    expect(preview()).toHaveAttribute('data-shape', 'square')
    expect(screen.getByRole('button', { name: 'Circle' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('places the shape and removes the preview when the work area is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await armShape(user, 'circle')
    await user.click(screen.getByTestId('work-area'))

    expect(preview()).not.toBeInTheDocument()
    expect(placedButton('Circle, 20 millimetres diameter')).toHaveAttribute(
      'data-component',
      'Component 1'
    )
    expect(screen.getByRole('button', { name: 'Circle' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('cancels the armed shape with Escape without placing anything', async () => {
    const user = userEvent.setup()
    render(<App />)

    await armShape(user, 'triangle')
    await user.hover(screen.getByTestId('work-area'))
    expect(preview()).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(preview()).not.toBeInTheDocument()
    expect(document.querySelectorAll('[data-component]')).toHaveLength(0)
  })

  it('disarms when the armed toolbar button is clicked again', async () => {
    const user = userEvent.setup()
    render(<App />)

    await armShape(user, 'square')
    await armShape(user, 'square')

    expect(screen.getByRole('button', { name: 'Square' })).toHaveAttribute('aria-pressed', 'false')
    expect(preview()).not.toBeInTheDocument()
  })
})

describe('hovered snap side highlight', () => {
  const highlight = () => screen.queryByTestId('side-highlight')

  // jsdom has no layout, so give the placed shape fixed bounds: x 100-200, y 100-150.
  const mockBounds = (el: HTMLElement) => {
    el.getBoundingClientRect = () =>
      ({
        x: 100,
        y: 100,
        left: 100,
        top: 100,
        right: 200,
        bottom: 150,
        width: 100,
        height: 50,
        toJSON: () => ({}),
      }) as DOMRect
  }

  const movePointer = (user: User, clientX: number, clientY: number) =>
    user.pointer({ target: screen.getByTestId('work-area'), coords: { clientX, clientY } })

  const setup = async () => {
    const user = userEvent.setup()
    render(<App />)
    await chooseShape(user, 'rectangle')
    mockBounds(placedButton('Rectangle, 30 by 20 millimetres'))
    await armShape(user, 'circle')
    return user
  }

  it('shows no highlight when nothing is armed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await chooseShape(user, 'rectangle')
    mockBounds(placedButton('Rectangle, 30 by 20 millimetres'))

    await movePointer(user, 150, 102)
    expect(highlight()).not.toBeInTheDocument()
  })

  it('highlights the hovered side of an existing object while a shape is armed', async () => {
    const user = await setup()

    await movePointer(user, 150, 102)
    expect(highlight()).toBeInTheDocument()
    expect(highlight()).toHaveAttribute('data-side', 'top')
  })

  it('moves the highlight to the nearest side as the pointer moves', async () => {
    const user = await setup()

    await movePointer(user, 150, 102)
    expect(highlight()).toHaveAttribute('data-side', 'top')

    await movePointer(user, 102, 125)
    expect(highlight()).toHaveAttribute('data-side', 'left')

    await movePointer(user, 198, 125)
    expect(highlight()).toHaveAttribute('data-side', 'right')

    await movePointer(user, 150, 148)
    expect(highlight()).toHaveAttribute('data-side', 'bottom')
  })

  it('shows no highlight when the pointer is away from every object', async () => {
    const user = await setup()

    await movePointer(user, 150, 102)
    expect(highlight()).toBeInTheDocument()

    await movePointer(user, 400, 400)
    expect(highlight()).not.toBeInTheDocument()
  })

  it('removes the highlight when the pointer leaves the work area', async () => {
    const user = await setup()

    await movePointer(user, 150, 102)
    expect(highlight()).toBeInTheDocument()

    await user.unhover(screen.getByTestId('work-area'))
    expect(highlight()).not.toBeInTheDocument()
  })

  it('removes the highlight when the armed shape is cancelled', async () => {
    const user = await setup()

    await movePointer(user, 150, 102)
    expect(highlight()).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(highlight()).not.toBeInTheDocument()
  })
})

describe('click to snap to the highlighted side', () => {
  // jsdom has no layout, so give the placed shape fixed bounds: x 100-200, y 100-150.
  const mockBounds = (el: HTMLElement) => {
    el.getBoundingClientRect = () =>
      ({
        x: 100,
        y: 100,
        left: 100,
        top: 100,
        right: 200,
        bottom: 150,
        width: 100,
        height: 50,
        toJSON: () => ({}),
      }) as DOMRect
  }

  const rectangleLabel = 'Rectangle, 30 by 20 millimetres'
  const circleLabel = 'Circle, 20 millimetres diameter'

  const hoverRectangle = (user: User, clientX: number, clientY: number) =>
    user.pointer({ target: placedButton(rectangleLabel), coords: { clientX, clientY } })

  const clickRectangle = (user: User, clientX: number, clientY: number) =>
    user.pointer({
      keys: '[MouseLeft]',
      target: placedButton(rectangleLabel),
      coords: { clientX, clientY },
    })

  const setup = async () => {
    const user = userEvent.setup()
    render(<App />)
    await chooseShape(user, 'rectangle')
    mockBounds(placedButton(rectangleLabel))
    await armShape(user, 'circle')
    return user
  }

  it('places the new shape against the highlighted side on the second click', async () => {
    const user = await setup()

    await hoverRectangle(user, 150, 102)
    expect(screen.getByTestId('side-highlight')).toHaveAttribute('data-side', 'top')

    await clickRectangle(user, 150, 102)

    // A second component was created instead of just selecting the existing one.
    expect(document.querySelectorAll('[data-component]')).toHaveLength(2)
    const snapped = placedButton(circleLabel)
    expect(snapped).toHaveAttribute('data-component', 'Component 2')

    // Snapped above the rectangle: centred on it horizontally, one shape-height up.
    const style = snapped.getAttribute('style') ?? ''
    expect(style).toContain('translate')
    expect(style).toContain('150px')
    expect(style).toContain('75px')
  })

  it('disarms and selects the new shape after snapping', async () => {
    const user = await setup()

    await hoverRectangle(user, 150, 102)
    await clickRectangle(user, 150, 102)

    expect(screen.getByRole('button', { name: 'Circle' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByTestId('cursor-preview')).not.toBeInTheDocument()
    expect(screen.queryByTestId('side-highlight')).not.toBeInTheDocument()
    expect(placedButton(circleLabel)).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Diameter')).toHaveValue(20)
  })

  it('uses the highlighted side that is under the pointer when clicking', async () => {
    const user = await setup()

    await hoverRectangle(user, 198, 125)
    expect(screen.getByTestId('side-highlight')).toHaveAttribute('data-side', 'right')

    await clickRectangle(user, 198, 125)

    // Snapped to the right: one object-width to the right of the centre of the rectangle.
    const style = placedButton(circleLabel).getAttribute('style') ?? ''
    expect(style).toContain('200px')
    expect(style).toContain('125px')
  })

  it('places the shape at the default position when no side is highlighted', async () => {
    const user = userEvent.setup()
    render(<App />)
    await chooseShape(user, 'rectangle')
    mockBounds(placedButton(rectangleLabel))
    await armShape(user, 'circle')

    // Pointer is far from every object, so nothing is highlighted.
    await user.pointer({
      target: screen.getByTestId('work-area'),
      coords: { clientX: 400, clientY: 400 },
    })
    expect(screen.queryByTestId('side-highlight')).not.toBeInTheDocument()

    await user.click(screen.getByTestId('work-area'))

    expect(document.querySelectorAll('[data-component]')).toHaveLength(2)
    expect(placedButton(circleLabel)).not.toHaveAttribute('style')
  })

  it('leaves a shape placed without snapping at the centre', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')

    expect(placedButton(circleLabel)).not.toHaveAttribute('style')
  })

  it('selects the object as normal when clicked with nothing armed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await chooseShape(user, 'rectangle')
    await chooseShape(user, 'circle')

    await user.click(placedButton(rectangleLabel))

    expect(document.querySelectorAll('[data-component]')).toHaveLength(2)
    expect(placedButton(rectangleLabel)).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('circle angle snapping', () => {
  const angleMarker = () => screen.queryByTestId('angle-highlight')
  const sideMarker = () => screen.queryByTestId('side-highlight')

  const circleLabel = 'Circle, 20 millimetres diameter'
  const rectangleLabel = 'Rectangle, 30 by 20 millimetres'
  const squareLabel = 'Square, 20 millimetres per side'

  // jsdom has no layout, so give the placed shape fixed bounds. The circle spans
  // x 100-200, y 100-200, so its centre is (150, 150).
  const mockBounds = (el: HTMLElement, box: { left: number; top: number; right: number; bottom: number }) => {
    el.getBoundingClientRect = () =>
      ({
        x: box.left,
        y: box.top,
        ...box,
        width: box.right - box.left,
        height: box.bottom - box.top,
        toJSON: () => ({}),
      }) as DOMRect
  }

  const movePointer = (user: User, clientX: number, clientY: number) =>
    user.pointer({ target: screen.getByTestId('work-area'), coords: { clientX, clientY } })

  const clickAt = (user: User, clientX: number, clientY: number) =>
    user.pointer({
      keys: '[MouseLeft]',
      target: placedButton(circleLabel),
      coords: { clientX, clientY },
    })

  const setupCircle = async () => {
    const user = userEvent.setup()
    render(<App />)
    await chooseShape(user, 'circle')
    mockBounds(placedButton(circleLabel), { left: 100, top: 100, right: 200, bottom: 200 })
    await armShape(user, 'square')
    return user
  }

  it('marks the nearest fixed angle on the circle while a shape is armed', async () => {
    const user = await setupCircle()

    // Just below the right-hand point of the outline: nearest fixed angle is 0 degrees.
    await movePointer(user, 198, 152)
    expect(angleMarker()).toBeInTheDocument()
    expect(angleMarker()).toHaveAttribute('data-angle', '0')

    // Just right of the bottom point of the outline: nearest fixed angle is 90 degrees.
    await movePointer(user, 152, 198)
    expect(angleMarker()).toHaveAttribute('data-angle', '90')
  })

  it('draws a marker on the outline instead of a side line for a circle', async () => {
    const user = await setupCircle()

    await movePointer(user, 198, 152)
    expect(angleMarker()).toBeInTheDocument()
    expect(sideMarker()).not.toBeInTheDocument()
  })

  it('shows no angle marker when nothing is armed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await chooseShape(user, 'circle')
    mockBounds(placedButton(circleLabel), { left: 100, top: 100, right: 200, bottom: 200 })

    await movePointer(user, 198, 152)
    expect(angleMarker()).not.toBeInTheDocument()
  })

  it('removes the angle marker when the pointer leaves the work area or the shape is cancelled', async () => {
    const user = await setupCircle()

    await movePointer(user, 198, 152)
    expect(angleMarker()).toBeInTheDocument()
    await user.unhover(screen.getByTestId('work-area'))
    expect(angleMarker()).not.toBeInTheDocument()

    await movePointer(user, 198, 152)
    expect(angleMarker()).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(angleMarker()).not.toBeInTheDocument()
  })

  it('places the new shape at the marked angle when clicked', async () => {
    const user = await setupCircle()

    await movePointer(user, 198, 152)
    expect(angleMarker()).toHaveAttribute('data-angle', '0')
    await clickAt(user, 198, 152)

    // A second component was created, snapped away from the centre position.
    expect(document.querySelectorAll('[data-component]')).toHaveLength(2)
    const snapped = placedButton(squareLabel)
    expect(snapped).toHaveAttribute('data-component', 'Component 2')
    expect(snapped.getAttribute('style') ?? '').toContain('px')

    // Disarmed, selected and no marker left behind.
    expect(screen.getByRole('button', { name: 'Square' })).toHaveAttribute('aria-pressed', 'false')
    expect(snapped).toHaveAttribute('aria-pressed', 'true')
    expect(angleMarker()).not.toBeInTheDocument()
  })

  it('places the shape at a different position for a different marked angle', async () => {
    const first = await setupCircle()
    await movePointer(first, 198, 152)
    await clickAt(first, 198, 152)
    const rightStyle = placedButton(squareLabel).getAttribute('style')
    expect(rightStyle).toBeTruthy()

    document.body.innerHTML = ''
    const second = await setupCircle()
    await movePointer(second, 152, 198)
    expect(angleMarker()).toHaveAttribute('data-angle', '90')
    await clickAt(second, 152, 198)
    const bottomStyle = placedButton(squareLabel).getAttribute('style')
    expect(bottomStyle).toBeTruthy()

    expect(bottomStyle).not.toEqual(rightStyle)
  })

  it('still uses side snapping for non-circle shapes', async () => {
    const user = userEvent.setup()
    render(<App />)
    await chooseShape(user, 'rectangle')
    mockBounds(placedButton(rectangleLabel), { left: 100, top: 100, right: 200, bottom: 150 })
    await armShape(user, 'circle')

    await movePointer(user, 150, 102)
    expect(sideMarker()).toBeInTheDocument()
    expect(sideMarker()).toHaveAttribute('data-side', 'top')
    expect(angleMarker()).not.toBeInTheDocument()
  })
})

describe('invalid input', () => {
  it('hides the shape and announces a message when the field is empty', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '')

    expect(screen.getByRole('alert')).toHaveTextContent('Diameter: enter a number.')
    expect(shapeImages()).toHaveLength(0)
  })

  it.each([
    ['0', 'Diameter: enter a value from 0.1 to 1000.'],
    ['-5', 'Diameter: enter a value from 0.1 to 1000.'],
    ['0.05', 'Diameter: enter a value from 0.1 to 1000.'],
    ['1001', 'Diameter: enter a value from 0.1 to 1000.'],
  ])('rejects a diameter of %s', async (value, message) => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', value)

    expect(screen.getByRole('alert')).toHaveTextContent(message)
    expect(shapeImages()).toHaveLength(0)
  })

  it('rejects a fractional number of sides', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'polygon')
    await setField(user, 'Number of sides', '5.5')

    expect(screen.getByRole('alert')).toHaveTextContent('Number of sides: use a whole number.')
    expect(shapeImages()).toHaveLength(0)
  })

  it('rejects too few sides', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'polygon')
    await setField(user, 'Number of sides', '2')

    expect(screen.getByRole('alert')).toHaveTextContent('Number of sides: enter a value from 3 to 64.')
  })

  it('brings the shape back and clears the message once the value is fixed', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '0')
    expect(shapeImages()).toHaveLength(0)

    await setField(user, 'Diameter', '25')
    expect(screen.getByRole('alert')).toBeEmptyDOMElement()
    expect(screen.getByRole('img', { name: 'Circle, 25 millimetres diameter' })).toBeInTheDocument()
  })

  it('does not carry an error from one shape to another', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '')
    expect(screen.getByRole('alert')).toHaveTextContent('Diameter: enter a number.')

    await chooseShape(user, 'square')
    expect(screen.getByRole('alert')).toBeEmptyDOMElement()
    expect(screen.getByRole('img', { name: 'Square, 20 millimetres per side' })).toBeInTheDocument()
  })

  it('never renders NaN in the page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'circle')
    await setField(user, 'Diameter', '')
    expect(document.body).not.toHaveTextContent('NaN')
  })
})