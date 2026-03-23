import { X } from 'lucide-react'

function Modal({
  isOpen,
  title,
  onClose,
  children,
  maxWidthClass = 'max-w-md',
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full rounded-xl bg-white p-6 shadow-lg ${maxWidthClass}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

export default Modal
