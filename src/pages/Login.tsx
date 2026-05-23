// Tela de Login com magic link (Phase 7-02).
// 3 estados: idle (form), submitting (botão disabled), sent (sucesso).

import { useState, type FormEvent } from 'react'
import { signInWithEmail, isValidEmail } from '../api/useAuth'

type Status = 'idle' | 'submitting' | 'sent'

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const emailLooksValid = email.length > 0 && isValidEmail(email)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!emailLooksValid) return
    setStatus('submitting')
    setError(null)
    const result = await signInWithEmail(email)
    if (result.ok) {
      setStatus('sent')
    } else {
      setError(result.error)
      setStatus('idle')
    }
  }

  const reset = () => {
    setEmail('')
    setError(null)
    setStatus('idle')
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <span className="kanji-mizu login-logo-kanji">水</span>
        </div>
        <h1 className="login-title">
          Painel Sushi <span className="login-title-gold">Mizú</span>
        </h1>
        <p className="login-sub">
          Digite seu email pra receber um link de acesso. Sem senha.
        </p>

        {status === 'sent' ? (
          <div className="login-sent">
            <div className="login-sent-icon">📩</div>
            <div className="login-sent-msg">
              <strong>Link enviado!</strong>
              <p>
                Confira o inbox de <em>{email}</em> (e a pasta de spam). O link expira em 1 hora.
              </p>
            </div>
            <button type="button" onClick={reset} className="login-link-btn">
              Tentar com outro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <input
              type="email"
              autoFocus
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'submitting'}
              required
              className="login-input"
              aria-label="Email"
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={status === 'submitting' || !emailLooksValid}
              className="login-submit"
            >
              {status === 'submitting' ? 'Enviando…' : 'Enviar link mágico'}
            </button>
            {error && <div className="login-error">{error}</div>}
          </form>
        )}

        <div className="login-footer">
          Acesso restrito · só usuários autorizados pelo administrador
        </div>
      </div>
    </div>
  )
}
