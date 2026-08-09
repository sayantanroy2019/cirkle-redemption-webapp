import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'cirkle-redemption-auth'

/**
 * Session store for the door-staff device.
 *
 * The token (and the small organizer profile shown on the event picker) are
 * persisted to localStorage so a refresh mid-shift doesn't bounce staff back
 * to login. Nothing else is stored in the browser.
 */
export const useAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      organizer: null, // { id, email, displayName }

      login: (token, organizer) => set({ token, organizer }),
      logout: () => set({ token: null, organizer: null }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ token: state.token, organizer: state.organizer }),
    },
  ),
)

/** Derived: is there a session? Use inside components so re-renders track it. */
export const useIsAuthenticated = () => useAuthStore((s) => Boolean(s.token))

/** Non-reactive reads/writes for use outside React (e.g. axios interceptors). */
export const getToken = () => useAuthStore.getState().token
export const logoutFromAnywhere = () => useAuthStore.getState().logout()
