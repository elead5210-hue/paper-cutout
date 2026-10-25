import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest doesn't expose globals by default, so React Testing Library's
// automatic cleanup doesn't run. Unmount rendered trees after each test.
afterEach(() => {
  cleanup()
})