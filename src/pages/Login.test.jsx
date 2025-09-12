// src/pages/Login.test.jsx
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'

test('renders login form with all required elements', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )

  // التحقق من العناوين
  expect(screen.getByText(/ADMIN PORTAL/i)).toBeInTheDocument()
  expect(screen.getByText(/Global Clinic - Secure Access/i)).toBeInTheDocument()

  // التحقق من تسميات الحقول
  expect(screen.getByLabelText(/Admin Email Address/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Admin Password/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Admin Access Key/i)).toBeInTheDocument()

  // التحقق من زر الدخول
  expect(screen.getByRole('button', { name: /SECURE LOGIN/i })).toBeInTheDocument()

  // التحقق من رسالة التحذير
  expect(screen.getByText(/RESTRICTED ACCESS - AUTHORIZED PERSONNEL ONLY/i)).toBeInTheDocument()

  // ✅ تجنب استخدام data-testid للأيقونات المتكررة
  // ✅ لا حاجة لاختبار كل أيقونة بشكل منفصل

  // التحقق من وجود نص المراقبة
  expect(screen.getByText(/All access attempts are logged and monitored/i)).toBeInTheDocument()
})
