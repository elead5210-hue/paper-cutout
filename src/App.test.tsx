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

// Clicking a toolbar button places a new shape in the work area and selects it.
const chooseShape = (user: User, id: string) =>
  user.click(screen.getByRole('button', { name: new RegExp(`^${id}$`, 'i') }))

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
    expect(screen.getByRole('button', { name: 'Square' })).not.toHaveAttribute('aria-pressed')
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