import axios from 'axios'
import { getToken, logoutFromAnywhere } from '../store/authStore'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  // Loud in dev, harmless in prod: every request would 404 against the app origin.
  console.error(
    '[cirkle] VITE_API_URL is not set. Create a .env.local with VITE_API_URL=<backend url>.',
  )
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    // The backend is served through an ngrok tunnel during development;
    // without this header ngrok returns its HTML interstitial instead of JSON.
    'ngrok-skip-browser-warning': 'true',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''

    // A 401 anywhere but the login call itself means the token is dead
    // (expired, revoked, or the organizer was deactivated). Clearing the
    // store flips isAuthenticated, and ProtectedRoute sends them to /login.
    if (status === 401 && !url.includes('/organizer/auth/login')) {
      logoutFromAnywhere()
    }

    return Promise.reject(error)
  },
)

/**
 * True when the request never reached the backend — offline, tunnel down, or
 * blocked by CORS. Callers use this to show "something went wrong" rather than
 * a credential error.
 */
export const isNetworkError = (error) => !error?.response

/** The raw `error` string code the backend puts in every non-2xx JSON body. */
export const errorCodeOf = (error) => error?.response?.data?.error

export default api
