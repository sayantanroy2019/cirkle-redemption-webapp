import Avatar from './Avatar'
import { formatClockTime } from '../lib/format'

export default function HolderCard({ attendee, admitsCount, items = [], status, checkedInAt, onCheckIn, committing }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
      <div className="flex justify-center">
        <Avatar photoUrl={attendee.photoUrl} firstName={attendee.firstName} lastName={attendee.lastName} />
      </div>

      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        {attendee.firstName} {attendee.lastName}
      </h2>
      <p className="mt-0.5 text-sm text-gray-500">Age {attendee.age}</p>

      <div className="mt-4 inline-flex items-center rounded-full bg-brand-light px-4 py-1.5 text-sm font-semibold text-brand-dark">
        Admits {admitsCount} {admitsCount === 1 ? 'person' : 'people'}
      </div>

      {/* What the booking is made of, so staff can count heads against it:
          "2× Couple Pass · 1× Stag". A single-line booking still lists its one line. */}
      {items.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-gray-700">
          {items.map((item) => (
            <li key={item.categoryName} className="flex items-center justify-center gap-2">
              <span className="font-semibold">{item.quantity}×</span>
              <span>{item.categoryName}</span>
              <span className="text-gray-400">· admits {item.admitsTotal}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        {status === 'not_checked_in' ? (
          <button
            onClick={onCheckIn}
            disabled={committing}
            className="flex w-full items-center justify-center rounded-xl bg-admit px-4 py-4 text-lg font-semibold text-white transition-colors hover:bg-admit-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {committing ? 'Checking in…' : 'Check in'}
          </button>
        ) : (
          <div className="rounded-xl bg-already-light px-4 py-4 text-already-dark">
            <p className="text-base font-semibold">Already entered</p>
            {checkedInAt && <p className="mt-0.5 text-sm">at {formatClockTime(checkedInAt)}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
