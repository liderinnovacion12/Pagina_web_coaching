import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from './Register'
import useAuth from '../hooks/useAuth'

vi.mock('../hooks/useAuth')

describe('Register', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
    })
  })

  it('renders the registration form', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument()
  })

  it('calls signUp with the form values and shows the confirmation screen when no session is returned', async () => {
    const signUp = vi.fn().mockResolvedValue({ user: { id: '1' }, session: null, error: null })
    useAuth.mockReturnValue({ signUp, signInWithGoogle: vi.fn() })

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Ana García' } })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'Ana@Example.com' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }))

    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith('ana@example.com', 'secret123', 'Ana García')
    )
    expect(await screen.findByText(/cuenta creada/i)).toBeInTheDocument()
  })

  it('shows an error message when signUp fails', async () => {
    const signUp = vi.fn().mockResolvedValue({ user: null, session: null, error: { message: 'boom' } })
    useAuth.mockReturnValue({ signUp, signInWithGoogle: vi.fn() })

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Ana García' } })
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /registrarme/i }))

    expect(await screen.findByText(/no se pudo crear la cuenta/i)).toBeInTheDocument()
  })

  it('calls signInWithGoogle when the Google button is clicked', () => {
    const signInWithGoogle = vi.fn().mockResolvedValue({ error: null })
    useAuth.mockReturnValue({ signUp: vi.fn(), signInWithGoogle })

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /continuar con google/i }))
    expect(signInWithGoogle).toHaveBeenCalled()
  })
})
