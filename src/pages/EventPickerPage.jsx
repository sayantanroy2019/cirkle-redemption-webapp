import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchEvents } from '../api/events'
import { isNetworkError } from '../api/client'
import { formatEventDate, isToday } from '../lib/format'
import { useAuthStore } from '../store/authStore'
import { useEventStore } from '../store/eventStore'

function EventCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="mt-3 h-3 w-1/2 rounded bg-gray-200" />
      <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
    </div>
  )
}

export default function EventPickerPage() {
  const navigate = useNavigate()
  const organizer = useAuthStore((s) => s.organizer)
  const logout = useAuthStore((s) => s.logout)
  const selectEvent = useEventStore((s) => s.selectEvent)

  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [events, setEvents] = useState([])

  const load = useCallback((signal) => {
    setStatus('loading')
    fetchEvents({ limit: 100, signal })
      .then((result) => {
        setEvents(result.events)
        setStatus('ready')
      })
      .catch((err) => {
        if (err.code === 'ERR_CANCELED') return
        if (isNetworkError(err)) console.error('[cirkle] events network error', err)
        setStatus('error')
      })
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  function handlePick(event) {
    selectEvent({
      id: event.id,
      name: event.name,
      startsAt: event.startsAt,
      venueName: event.venueName,
    })
    navigate('/scan')
  }

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4">
        <div>
          <p className="text-xs text-gray-500">Signed in as</p>
          <p className="text-sm font-medium text-gray-900">
            {organizer?.displayName ?? organizer?.email ?? 'Organizer'}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Log out
        </button>
      </header>

      <main className="flex-1 px-4 py-5">
        <h1 className="mb-4 text-base font-semibold text-gray-900">Pick an event to work</h1>

        {status === 'loading' && (
          <div className="space-y-3">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-600">Couldn't load your events.</p>
            <button
              onClick={() => load()}
              className="mt-4 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'ready' && events.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
            <p className="text-sm text-gray-600">No events yet.</p>
          </div>
        )}

        {status === 'ready' && events.length > 0 && (
          <div className="space-y-3">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => handlePick(event)}
                className="block w-full rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-brand hover:bg-brand-light active:bg-brand-light"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-semibold text-gray-900">{event.name}</h2>
                  {isToday(event.startsAt) && (
                    <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-xs font-medium text-brand-dark">
                      Today
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">{formatEventDate(event.startsAt)}</p>
                {event.venueName && (
                  <p className="mt-0.5 text-sm text-gray-500">{event.venueName}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
