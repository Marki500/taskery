import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import FocusLock from 'react-focus-lock'

/**
 * BaseModal — Modal reutilizable con animaciones y focus trap
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - title: string | ReactNode (texto del título)
 * - descriptionId?: string (id del elemento que describe el modal)
 * - initialFocusRef?: React.RefObject<HTMLElement> (enfoque inicial)
 * - children: contenido del modal
 */
export default function BaseModal({
  open,
  onClose,
  title,
  descriptionId,
  initialFocusRef,
  children,
}) {
  const panelRef = useRef(null)

  // Bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Enfoque inicial al abrir
  useEffect(() => {
    if (open) {
      // prioriza initialFocusRef si existe, si no el panel
      const el = initialFocusRef?.current || panelRef.current
      setTimeout(() => el?.focus?.(), 0)
    }
  }, [open, initialFocusRef])

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.6 },
    exit: { opacity: 0 },
  }

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 8 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: 6 },
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          {/* Backdrop */}
          <motion.button
            aria-hidden
            className="absolute inset-0 bg-black"
            style={{ opacity: 0.6 }}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={onClose}
          />

          {/* Focus trap + Panel */}
          <FocusLock returnFocus={true} autoFocus={false}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="base-modal-title"
              aria-describedby={descriptionId}
              ref={panelRef}
              tabIndex={-1}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-[0_20px_60px_-20px_rgba(59,162,237,0.35)] outline-none"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={panelVariants}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              {/* Botón cerrar */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded-xl px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                aria-label="Cerrar modal"
              >
                ×
              </button>

              {/* Título */}
              <h2 id="base-modal-title" className="text-lg font-semibold text-sky-300">
                {title}
              </h2>

              {children}
            </motion.div>
          </FocusLock>
        </div>
      )}
    </AnimatePresence>
  )
}