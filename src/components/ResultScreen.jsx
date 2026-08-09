const VARIANTS = {
  admit: {
    bg: 'bg-admit',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  already: {
    bg: 'bg-already',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16" stroke="currentColor" strokeWidth={3}>
        <circle cx="12" cy="12" r="9" strokeLinecap="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
      </svg>
    ),
  },
  refuse: {
    bg: 'bg-refuse',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-16 w-16" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
}

/** Glance-readable, full-bleed result state — color + icon carry the meaning
 *  before anyone reads a word of text. */
export default function ResultScreen({ variant, title, subtitle, children, actions }) {
  const { bg, icon } = VARIANTS[variant]

  return (
    <div className={`flex flex-1 flex-col items-center justify-center px-6 py-10 text-white ${bg}`}>
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20">
        {icon}
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-center text-base text-white/90">{subtitle}</p>}
      {children && <div className="mt-6 w-full max-w-xs">{children}</div>}
      {actions && <div className="mt-8 w-full max-w-xs space-y-3">{actions}</div>}
    </div>
  )
}
