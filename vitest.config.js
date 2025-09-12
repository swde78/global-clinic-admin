// vitest.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [
      './src/setupTests.js',
      './src/test-setup.js'
    ],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    globals: true,
    css: {
      transform: false
    }
  }
})
