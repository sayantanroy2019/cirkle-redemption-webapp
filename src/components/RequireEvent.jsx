import { Navigate, Outlet } from 'react-router-dom'
import { useEventStore } from '../store/eventStore'

/** Scanner screen is meaningless without an event scoped first. */
export default function RequireEvent() {
  const selectedEvent = useEventStore((s) => s.selectedEvent)

  if (!selectedEvent) {
    return <Navigate to="/events" replace />
  }

  return <Outlet />
}
