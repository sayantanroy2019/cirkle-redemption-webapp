import api from './client'

/**
 * Every check-in endpoint takes exactly one identifier: { qrPayload } XOR
 * { bookingRef }. Callers pass whichever one they have; never both.
 */
function bodyOf(identifier) {
  return identifier.qrPayload !== undefined
    ? { qrPayload: identifier.qrPayload }
    : { bookingRef: identifier.bookingRef }
}

/** Read-only — writes nothing. Safe to call repeatedly (re-scans, retries). */
export async function lookupCheckIn(eventId, identifier) {
  const { data } = await api.post(
    `/organizer/events/${eventId}/check-in/lookup`,
    bodyOf(identifier),
  )
  return data
}

/** Commits the check-in. 409 (already_checked_in / wrong_event) is a normal
 *  outcome here (a race), not an exceptional one — callers branch on it. */
export async function commitCheckIn(eventId, identifier) {
  const { data } = await api.post(`/organizer/events/${eventId}/check-in`, bodyOf(identifier))
  return data
}

/** Reverses a check-in. Idempotent on the backend. */
export async function undoCheckIn(eventId, identifier) {
  const { data } = await api.delete(`/organizer/events/${eventId}/check-in`, {
    data: bodyOf(identifier),
  })
  return data
}
