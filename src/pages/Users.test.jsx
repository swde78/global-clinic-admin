// src/pages/Users.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// ✅ استخدم import بدلاً من require
import Users from './Users'

// ✅ محاكاة DataGrid لتجنب استيراد .css
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns }) => (
    <div data-testid="mocked-datagrid">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.field}>{col.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 5).map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.field}>{row[col.field]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}))

test('renders users page', () => {
  render(
    <BrowserRouter>
      <Users />
    </BrowserRouter>
  )

  expect(screen.getByText(/User Management/i)).toBeInTheDocument()
  expect(screen.getByTestId('mocked-datagrid')).toBeInTheDocument()
})
