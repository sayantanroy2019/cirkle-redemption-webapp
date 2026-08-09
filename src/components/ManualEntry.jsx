import { useState } from 'react'

export default function ManualEntry({ onSubmit, submitting }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || submitting) return
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="booking-ref" className="block text-sm font-medium text-gray-700">
        Booking reference
      </label>
      <input
        id="booking-ref"
        type="text"
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="off"
        inputMode="text"
        placeholder="CRKL-XXXXXXXX"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={submitting}
        className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-3.5 text-lg uppercase tracking-wide text-gray-900 placeholder:text-gray-400 placeholder:tracking-normal placeholder:normal-case focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none disabled:bg-gray-50"
      />
      <button
        type="submit"
        disabled={submitting || !value.trim()}
        className="mt-3 flex w-full items-center justify-center rounded-lg bg-brand px-4 py-3.5 text-base font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Looking up…' : 'Look up'}
      </button>
    </form>
  )
}
