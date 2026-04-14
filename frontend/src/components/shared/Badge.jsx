const TONE_CLASSES = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  neutral: 'bg-slate-100 text-slate-600',
  info: 'bg-blue-100 text-blue-700',
}

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={joinClasses(
        'inline-flex rounded-full px-3 py-1 text-xs font-medium',
        TONE_CLASSES[tone] || TONE_CLASSES.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Badge
