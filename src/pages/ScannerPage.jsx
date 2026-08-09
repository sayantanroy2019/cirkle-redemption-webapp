import { useCallback, useReducer, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { commitCheckIn, lookupCheckIn, undoCheckIn } from '../api/checkin'
import { errorCodeOf, isNetworkError } from '../api/client'
import { messageForErrorCode, titleForErrorCode } from '../lib/checkInErrors'
import { classifyScannedText } from '../lib/identifier'
import { formatClockTime } from '../lib/format'
import { useEventStore } from '../store/eventStore'
import ScannerCamera from '../components/ScannerCamera'
import HolderCard from '../components/HolderCard'
import ResultScreen from '../components/ResultScreen'
import ManualEntry from '../components/ManualEntry'

const initialState = {
  phase: 'idle', // idle | looking_up | holder | committing | admitted | already | error
  identifier: null,
  attendee: null,
  admitsCount: null,
  checkedInAt: null,
  status: null,
  errorCode: null,
  errorEventName: null,
  undoing: false,
  undoError: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOOKUP_START':
      return { ...initialState, phase: 'looking_up', identifier: action.identifier }
    case 'LOOKUP_SUCCESS':
      return {
        ...state,
        phase: 'holder',
        attendee: action.data.attendee,
        admitsCount: action.data.admitsCount,
        checkedInAt: action.data.checkedInAt,
        status: action.data.status,
      }
    case 'LOOKUP_ERROR':
      return { ...state, phase: 'error', errorCode: action.code, errorEventName: action.eventName }
    case 'COMMIT_START':
      return { ...state, phase: 'committing' }
    case 'COMMIT_SUCCESS':
      return {
        ...state,
        phase: 'admitted',
        attendee: action.data.attendee,
        admitsCount: action.data.admitsCount,
        checkedInAt: action.data.checkedInAt,
      }
    case 'COMMIT_ALREADY':
      // Raced: someone else checked this ticket in between our lookup and
      // commit. Not an error — flip straight to the already-entered state.
      return {
        ...state,
        phase: 'already',
        attendee: action.data.attendee,
        checkedInAt: action.data.checkedInAt,
      }
    case 'COMMIT_ERROR':
      return { ...state, phase: 'error', errorCode: action.code, errorEventName: action.eventName }
    case 'UNDO_START':
      return { ...state, undoing: true, undoError: null }
    case 'UNDO_ERROR':
      return { ...state, undoing: false, undoError: action.message }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export default function ScannerPage() {
  const navigate = useNavigate()
  const selectedEvent = useEventStore((s) => s.selectedEvent)
  const eventId = selectedEvent.id

  const [state, dispatch] = useReducer(reducer, initialState)
  const [mode, setMode] = useState('camera') // 'camera' | 'manual'
  const [cameraUnavailable, setCameraUnavailable] = useState(false)
  const [cameraKey, setCameraKey] = useState(0)

  const runLookup = useCallback(
    async (identifier) => {
      dispatch({ type: 'LOOKUP_START', identifier })
      try {
        const data = await lookupCheckIn(eventId, identifier)
        dispatch({ type: 'LOOKUP_SUCCESS', data })
      } catch (err) {
        if (isNetworkError(err)) {
          dispatch({ type: 'LOOKUP_ERROR', code: null })
        } else {
          dispatch({
            type: 'LOOKUP_ERROR',
            code: errorCodeOf(err),
            eventName: err.response?.data?.eventName,
          })
        }
      }
    },
    [eventId],
  )

  const handleDecode = useCallback(
    (text) => {
      if (state.phase !== 'idle') return
      runLookup(classifyScannedText(text))
    },
    [state.phase, runLookup],
  )

  function handleManualSubmit(rawBookingRef) {
    if (state.phase !== 'idle') return
    runLookup({ bookingRef: rawBookingRef })
  }

  async function handleCheckIn() {
    dispatch({ type: 'COMMIT_START' })
    try {
      const data = await commitCheckIn(eventId, state.identifier)
      dispatch({ type: 'COMMIT_SUCCESS', data })
    } catch (err) {
      if (isNetworkError(err)) {
        dispatch({ type: 'COMMIT_ERROR', code: null })
        return
      }
      const code = errorCodeOf(err)
      if (err.response?.status === 409 && code === 'already_checked_in') {
        dispatch({ type: 'COMMIT_ALREADY', data: err.response.data })
      } else {
        dispatch({ type: 'COMMIT_ERROR', code, eventName: err.response?.data?.eventName })
      }
    }
  }

  async function handleUndo() {
    dispatch({ type: 'UNDO_START' })
    try {
      await undoCheckIn(eventId, state.identifier)
      dispatch({ type: 'RESET' })
    } catch (err) {
      dispatch({
        type: 'UNDO_ERROR',
        message: isNetworkError(err) ? 'Network error — try again.' : 'Could not undo — try again.',
      })
    }
  }

  function handleScanNext() {
    dispatch({ type: 'RESET' })
  }

  function handleCameraUnavailable() {
    setCameraUnavailable(true)
    setMode('manual')
  }

  function handleRetryCamera() {
    setCameraUnavailable(false)
    setCameraKey((k) => k + 1)
    setMode('camera')
  }

  const cameraActive = mode === 'camera' && state.phase === 'idle'
  const showCameraStream = mode === 'camera' && !cameraUnavailable

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{selectedEvent.name}</p>
          {selectedEvent.venueName && (
            <p className="truncate text-xs text-gray-500">{selectedEvent.venueName}</p>
          )}
        </div>
        <button
          onClick={() => navigate('/events')}
          className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          Switch event
        </button>
      </header>

      <main className="flex flex-1 flex-col">
        {(state.phase === 'idle' || state.phase === 'looking_up') && (
          <div className="flex flex-1 flex-col px-4 py-5">
            {showCameraStream && (
              <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-black">
                <ScannerCamera
                  key={cameraKey}
                  active={cameraActive}
                  onDecode={handleDecode}
                  onUnavailable={handleCameraUnavailable}
                />
                {state.phase === 'looking_up' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900">
                      Looking up…
                    </p>
                  </div>
                )}
              </div>
            )}

            {cameraUnavailable && (
              <div className="mx-auto w-full max-w-sm rounded-xl border border-already-dark/30 bg-already-light p-3 text-center text-sm text-already-dark">
                Camera unavailable.{' '}
                <button onClick={handleRetryCamera} className="font-semibold underline">
                  Try again
                </button>
              </div>
            )}

            <div className="mx-auto mt-6 w-full max-w-sm">
              {mode === 'camera' ? (
                <button
                  onClick={() => setMode('manual')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Can't scan? Enter code manually
                </button>
              ) : (
                <div className="space-y-3">
                  <ManualEntry onSubmit={handleManualSubmit} submitting={state.phase === 'looking_up'} />
                  {!cameraUnavailable && (
                    <button
                      onClick={() => setMode('camera')}
                      className="w-full text-center text-sm font-medium text-brand"
                    >
                      Use camera instead
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {(state.phase === 'holder' || state.phase === 'committing') && (
          <div className="flex flex-1 flex-col justify-center px-4 py-5">
            <div className="mx-auto w-full max-w-sm">
              <HolderCard
                attendee={state.attendee}
                admitsCount={state.admitsCount}
                status={state.status}
                checkedInAt={state.checkedInAt}
                onCheckIn={handleCheckIn}
                committing={state.phase === 'committing'}
              />
              <button
                onClick={handleScanNext}
                className="mt-4 w-full text-center text-sm font-medium text-gray-500"
              >
                Scan next
              </button>
            </div>
          </div>
        )}

        {state.phase === 'admitted' && (
          <ResultScreen
            variant="admit"
            title="ADMITTED"
            subtitle={`Admits ${state.admitsCount} ${state.admitsCount === 1 ? 'person' : 'people'} · ${state.attendee.firstName} ${state.attendee.lastName}`}
            actions={
              <>
                {state.undoError && (
                  <p className="text-center text-sm text-white">{state.undoError}</p>
                )}
                <button
                  onClick={handleUndo}
                  disabled={state.undoing}
                  className="w-full rounded-xl bg-white/20 px-4 py-3.5 text-base font-semibold text-white hover:bg-white/30 disabled:opacity-60"
                >
                  {state.undoing ? 'Undoing…' : 'Undo'}
                </button>
                <button
                  onClick={handleScanNext}
                  className="w-full rounded-xl bg-white px-4 py-3.5 text-base font-semibold text-admit-dark hover:bg-white/90"
                >
                  Scan next
                </button>
              </>
            }
          />
        )}

        {state.phase === 'already' && (
          <ResultScreen
            variant="already"
            title="Already entered"
            subtitle={
              state.checkedInAt
                ? `${state.attendee.firstName} ${state.attendee.lastName} · entered at ${formatClockTime(state.checkedInAt)}`
                : `${state.attendee.firstName} ${state.attendee.lastName}`
            }
            actions={
              <button
                onClick={handleScanNext}
                className="w-full rounded-xl bg-white px-4 py-3.5 text-base font-semibold text-already-dark hover:bg-white/90"
              >
                Scan next
              </button>
            }
          />
        )}

        {state.phase === 'error' && (
          <ResultScreen
            variant="refuse"
            title={titleForErrorCode(state.errorCode)}
            subtitle={messageForErrorCode(state.errorCode, state.errorEventName)}
            actions={
              <button
                onClick={handleScanNext}
                className="w-full rounded-xl bg-white px-4 py-3.5 text-base font-semibold text-refuse-dark hover:bg-white/90"
              >
                Scan next
              </button>
            }
          />
        )}
      </main>
    </div>
  )
}
