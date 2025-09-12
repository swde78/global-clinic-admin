// src/setupTests.js
import { expect } from 'vitest'
import { toBeInTheDocument } from '@testing-library/jest-dom/matchers'

expect.extend({ toBeInTheDocument })

global.ResizeObserver = class ResizeObserver {
  constructor(callback) { this.callback = callback }
  observe() {}
  unobserve() {}
  disconnect() {}
}
