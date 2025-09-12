// src/pages/Dashboard.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

test('renders dashboard with all key elements', () => {
  render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  )

  expect(screen.getByText(/Global Clinic - Admin Command Center/i)).toBeInTheDocument()

  // ✅ تم إصلاحه: الزر الآن له aria-label
  expect(screen.getByRole('button', { name: 'Refresh' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()

  expect(screen.getByText(/Total Users/i)).toBeInTheDocument()
  expect(screen.getByText(/Total Cases/i)).toBeInTheDocument()
  expect(screen.getByText(/Total Revenue/i)).toBeInTheDocument()
  expect(screen.getByText(/System Health/i)).toBeInTheDocument()

  expect(screen.getByText(/Revenue & Cases Trend/i)).toBeInTheDocument()
  expect(screen.getByText(/User Growth/i)).toBeInTheDocument()

  expect(screen.getByText(/View All Users/i)).toBeInTheDocument()
  expect(screen.getByText(/Audit Cases/i)).toBeInTheDocument()
})
