function initialsOf(firstName, lastName) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
}

export default function Avatar({ photoUrl, firstName, lastName, size = 96 }) {
  const style = { width: size, height: size }

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${firstName} ${lastName}`}
        style={style}
        className="rounded-full object-cover ring-2 ring-white"
      />
    )
  }

  return (
    <div
      style={style}
      className="flex items-center justify-center rounded-full bg-brand-light text-2xl font-semibold text-brand-dark ring-2 ring-white"
    >
      {initialsOf(firstName, lastName) || '?'}
    </div>
  )
}
