export function titleForErrorCode(code) {
  if (code === 'wrong_event') return 'Wrong event'
  if (code === 'ticket_not_found' || code === 'invalid_qr' || code === 'invalid_booking_ref') {
    return 'Invalid ticket'
  }
  return 'Couldn’t check in'
}

/** Branch on the backend's error code, never on prose. Paired with the title
 *  above (e.g. "Invalid ticket" + "Try again.") — keep this half distinct
 *  from the title's wording so the two don't repeat on screen. */
export function messageForErrorCode(code, eventName) {
  switch (code) {
    case 'wrong_event':
      return `This ticket is for ${eventName ?? 'a different event'}.`
    case 'ticket_not_found':
    case 'invalid_qr':
    case 'invalid_booking_ref':
      return 'Try again.'
    case 'missing_identifier':
    case 'ambiguous_identifier':
      // Should never happen — we always send exactly one identifier. If it
      // does, it's a client bug, not something staff can fix by rescanning.
      return 'Try again.'
    default:
      return 'Something went wrong, please try again.'
  }
}
