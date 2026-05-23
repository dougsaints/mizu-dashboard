// Tela de Login: magic link como caminho principal + código OTP como
// fallback robusto (Gmail "queima" magic links via URL scanner; código
// numérico contorna).

import { useState, type FormEvent } from 'react'
import { signInWithEmail, verifyEmailOtp, isValidEmail } from '../api/useAuth'

type Status = 'idle' | 'submitting' | 'sent' | 'verifying'

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)

  const emailLooksValid = email.length > 0 && isValidEmail(email)
  const otpLooksValid = /^\d{6,8}$/.test(otp.trim())

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

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!otpLooksValid) return
    setStatus('verifying')
    setOtpError(null)
    const result = await verifyEmailOtp(email, otp)
    if (!result.ok) {
      setOtpError(result.error)
      setStatus('sent')
    }
    // Em sucesso, useAuth detecta a sessão via onAuthStateChange e
    // App.tsx troca pra Dashboard automaticamente — sem precisar setStatus.
  }

  const reset = () => {
    setEmail('')
    setOtp('')
    setError(null)
    setOtpError(null)
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

        {status === 'sent' || status === 'verifying' ? (
          <>
            <div className="login-sent">
              <div className="login-sent-icon">📩</div>
              <div className="login-sent-msg">
                <strong>Link enviado!</strong>
                <p>
                  Confira o inbox de <em>{email}</em> (e a pasta de spam). O link expira em 1 hora.
                </p>
              </div>
            </div>

            <form onSubmit={handleOtpSubmit} className="login-otp-block" noValidate>
              <div className="login-otp-label">
                Se o link não funcionar (acontece com Gmail), digite o <strong>código de 8 dígitos</strong> que está no mesmo email:
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6,8}"
                maxLength={8}
                placeholder="00000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={status === 'verifying'}
                className="login-input login-otp-input"
                aria-label="Código de 8 dígitos"
                autoComplete="one-time-code"
              />
              <button
                type="submit"
                disabled={status === 'verifying' || !otpLooksValid}
                className="login-submit"
              >
                {status === 'verifying' ? 'Verificando…' : 'Entrar com código'}
              </button>
              {otpError && <div className="login-error">{otpError}</div>}
            </form>

            <button type="button" onClick={reset} className="login-link-btn">
              Tentar com outro email
            </button>
          </>
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
