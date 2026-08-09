// booking_ref is a generated column: 'CRKL-' + 8 uppercase hex chars
// (0-9, A-F — hex-only so O/0 and I/1 never come up). See
// Cirkle_Website_Application_Backend/supabase/migrations/20260724103558_create_tickets.sql.
const BOOKING_REF_RE = /^CRKL-[0-9A-F]{8}$/i

/**
 * Classifies a decoded QR string as a bookingRef or a qrPayload.
 *
 * Tickets are supposed to encode the structured qrPayload JSON, but some
 * already-issued tickets were rendered by an older consumer-app build that
 * baked the bare booking ref into the QR image instead (see the door
 * check-in QR investigation). Recognizing that shape here means those
 * already-circulating QR codes still scan correctly instead of failing as
 * invalid_qr, without weakening validation for the real payload format —
 * anything that isn't exactly a booking ref is passed through unchanged.
 */
export function classifyScannedText(text) {
  const trimmed = text.trim()
  return BOOKING_REF_RE.test(trimmed) ? { bookingRef: trimmed } : { qrPayload: text }
}
