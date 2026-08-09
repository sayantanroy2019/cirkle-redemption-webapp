import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { isNetworkError } from '../api/client'
import { useAuthStore, useIsAuthenticated } from '../store/authStore'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const GENERIC_CREDENTIAL_ERROR = 'Invalid email or password.'
const GENERIC_FAILURE = 'Something went wrong, please try again.'

export default function LoginPage() {
  const isAuthenticated = useIsAuthenticated()
  const storeLogin = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/events" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Enter your email and password.')
      return
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    setSubmitting(true)
    try {
      const { token, organizer } = await login(trimmedEmail, password)
      storeLogin(token, organizer)
      navigate('/events', { replace: true })
    } catch (err) {
      if (err.response?.status === 401) {
        setError(GENERIC_CREDENTIAL_ERROR)
      } else {
        if (isNetworkError(err)) console.error('[cirkle] login network error', err)
        setError(GENERIC_FAILURE)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-xl font-bold text-white">
            C
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Cirkle Door</h1>
          <p className="mt-1 text-sm text-gray-500">Organizer check-in scanner</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none disabled:bg-gray-50"
              placeholder="you@example.com"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none disabled:bg-gray-50"
              placeholder="••••••••"
            />
          </div>

          <div aria-live="polite" className="mt-3 min-h-5 text-sm text-refuse">
            {error}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-brand px-4 py-3.5 text-base font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}
