import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'cirkle-redemption-event'

/**
 * Which event this device is currently working the door for. Persisted so a
 * refresh mid-shift doesn't send staff back to the event picker.
 */
export const useEventStore = create()(
  persist(
    (set) => ({
      selectedEvent: null, // { id, name, startsAt, venueName }

      selectEvent: (event) => set({ selectedEvent: event }),
      clearEvent: () => set({ selectedEvent: null }),
    }),
    { name: STORAGE_KEY },
  ),
)
