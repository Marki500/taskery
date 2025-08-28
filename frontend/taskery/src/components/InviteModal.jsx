import React, { useRef, useState } from 'react'
import BaseModal from './BaseModal'

export default function InviteModal({ open, onClose, title = 'Invitar', onInvite }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  function reset() {
    setEmail('')
    setError('')
    setLoading(false)
  }

  function handleClose() {
    reset()
    onClose?.()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('El correo es obligatorio')
      return
    }
    try {
      setLoading(true)
      await onInvite?.(email.trim())
      handleClose()
    } catch (err) {
      console.error('Error invitando', err)
      const msg = err?.response?.data?.error || err?.message || 'No se pudo invitar'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={title}
      initialFocusRef={inputRef}
    >
      {error && (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4">
        <label className="block text-sm text-white/80" htmlFor="invite-email">
          Correo electrónico
        </label>
        <input
          id="invite-email"
          ref={inputRef}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-white outline-none focus:border-sky-400/40"
          placeholder="ejemplo@correo.com"
          disabled={loading}
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/80 hover:bg-white/10"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-sky-500 px-4 py-2 font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
          >
            {loading ? 'Invitando…' : 'Invitar'}
          </button>
        </div>
      </form>
    </BaseModal>
  )
}
