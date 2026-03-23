import { useEffect } from 'react'
import { X } from 'lucide-react'

function Modal({
  isOpen,
  title,
  description,
  onClose,
  children,
  maxWidthClass = 'max-w-xl',
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        className={`vsa-modal w-full animate-slide-up ${maxWidthClass}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-blue-500/10" />

        <div className="relative flex items-start justify-between gap-4 border-b border-slate-200/90 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="vsa-modal-body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
