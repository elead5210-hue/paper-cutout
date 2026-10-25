import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

type User = ReturnType<typeof userEvent.setup>

const setField = async (user: User, label: string, value: string) => {
  const input = screen.getByLabelText(label)
  await user.clear(input)
  if (value !== '') await user.type(input, value)
}

const chooseShape = (user: User, id: string) =>
  user.click(screen.getByRole('button', { name: new RegExp(`^${id}$`, 'i') }))

describe('first load', () => {
  it('shows a 20 mm circle by default', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Circle' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Diameter')).toHaveValue(20)
    expect(screen.getByRole('img', { name: 'Circle, 20 millimetres diameter' })).toBeInTheDocument()
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

  it('marks only the clicked shape button as pressed', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'triangle')
    expect(screen.getByRole('button', { name: 'Triangle' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Circle' })).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('switching shapes', () => {
  it('swaps the input fields for the selected shape', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'rectangle')
    expect(screen.getByLabelText('Width')).toHaveValue(30)
    expect(screen.getByLabelText('Height')).toHaveValue(20)
    expect(screen.queryByLabelText('Diameter')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Rectangle, 30 by 20 millimetres' })).toBeInTheDocument()
  })

  it('keeps each shape’s values when switching away and back', async () => {
    const user = userEvent.setup()
    render(<App />)

    await setField(user, 'Diameter', '35')

    await chooseShape(user, 'rectangle')
    await setField(user, 'Width', '50')
    await setField(user, 'Height', '12')

    await chooseShape(user, 'polygon')
    await setField(user, 'Number of sides', '8')
    await setField(user, 'Diameter', '40')

    await chooseShape(user, 'square')
    await chooseShape(user, 'triangle')

    await chooseShape(user, 'circle')
    expect(screen.getByLabelText('Diameter')).toHaveValue(35)
    expect(screen.getByRole('img', { name: 'Circle, 35 millimetres diameter' })).toBeInTheDocument()

    await chooseShape(user, 'rectangle')
    expect(screen.getByLabelText('Width')).toHaveValue(50)
    expect(screen.getByLabelText('Height')).toHaveValue(12)

    await chooseShape(user, 'polygon')
    expect(screen.getByLabelText('Number of sides')).toHaveValue(8)
    expect(screen.getByLabelText('Diameter')).toHaveValue(40)
    expect(
      screen.getByRole('img', { name: 'Regular polygon with 8 sides, 40 millimetres diameter' })
    ).toBeInTheDocument()
  })

  it('leaves untouched shapes at their defaults', async () => {
    const user = userEvent.setup()
    render(<App />)

    await setField(user, 'Diameter', '35')

    await chooseShape(user, 'square')
    expect(screen.getByLabelText('Side length')).toHaveValue(20)

    await chooseShape(user, 'triangle')
    expect(screen.getByLabelText('Side length')).toHaveValue(20)
  })

  it('redraws on every keystroke', async () => {
    const user = userEvent.setup()
    render(<App />)

    await setField(user, 'Diameter', '4')
    expect(screen.getByRole('img', { name: 'Circle, 4 millimetres diameter' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Diameter'), '5')
    expect(screen.getByRole('img', { name: 'Circle, 45 millimetres diameter' })).toBeInTheDocument()
  })
})

describe('invalid input', () => {
  it('hides the shape and announces a message when the field is empty', async () => {
    const user = userEvent.setup()
    render(<App />)

    await setField(user, 'Diameter', '')

    expect(screen.getByRole('alert')).toHaveTextContent('Diameter: enter a number.')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it.each([
    ['0', 'Diameter: enter a value from 0.1 to 1000.'],
    ['-5', 'Diameter: enter a value from 0.1 to 1000.'],
    ['0.05', 'Diameter: enter a value from 0.1 to 1000.'],
    ['1001', 'Diameter: enter a value from 0.1 to 1000.'],
  ])('rejects a diameter of %s', async (value, message) => {
    const user = userEvent.setup()
    render(<App />)

    await setField(user, 'Diameter', value)

    expect(screen.getByRole('alert')).toHaveTextContent(message)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('rejects a fractional number of sides', async () => {
    const user = userEvent.setup()
    render(<App />)

    await chooseShape(user, 'polygon')
    await setField(user, 'Number of sides', '5.5')

    expect(screen.getByRole('alert')).toHaveTextContent('Number of sides: use a whole number.')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
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

    await setField(user, 'Diameter', '0')
    expect(screen.queryByRole('img')).not.toBeInTheDocument()

    await setField(user, 'Diameter', '25')
    expect(screen.getByRole('alert')).toBeEmptyDOMElement()
    expect(screen.getByRole('img', { name: 'Circle, 25 millimetres diameter' })).toBeInTheDocument()
  })

  it('does not carry an error from one shape to another', async () => {
    const user = userEvent.setup()
    render(<App />)

    await setField(user, 'Diameter', '')
    expect(screen.getByRole('alert')).toHaveTextContent('Diameter: enter a number.')

    await chooseShape(user, 'square')
    expect(screen.getByRole('alert')).toBeEmptyDOMElement()
    expect(screen.getByRole('img', { name: 'Square, 20 millimetres per side' })).toBeInTheDocument()
  })

  it('never renders NaN in the page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await setField(user, 'Diameter', '')
    expect(document.body).not.toHaveTextContent('NaN')
  })
})