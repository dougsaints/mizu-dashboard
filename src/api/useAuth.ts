// Hook de autenticação Supabase — sessão atual + signIn (magic link) + signOut.
// Listener global de auth state mantém o React em sincronia com a sessão.

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type AuthState = {
  user: User | null
  isLoading: boolean
}

// Cache module-level: evita "isLoading: true" piscar quando o hook é
// montado uma segunda vez (ex: navegar entre componentes ou após HMR).
let cachedState: AuthState | null = null

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(
    () => cachedState ?? { user: null, isLoading: true },
  )

  useEffect(() => {
    let mounted = true

    // 1. Lê sessão inicial (1 vez, no mount do app)
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      const next: AuthState = { user: data.session?.user ?? null, isLoading: false }
      cachedState = next
      setState(next)
    })

    // 2. Subscribe pra mudanças (login, logout, refresh token)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      const next: AuthState = { user: session?.user ?? null, isLoading: false }
      cachedState = next
      setState(next)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return state
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

export type SignInResult = { ok: true } | { ok: false; error: string }

// Traduz mensagens de erro do Supabase pra PT-BR amigável.
function translateError(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('signups not allowed') || lower.includes('not allowed to sign')) {
    return 'Este email não está na lista de usuários autorizados. Peça pro Doug te adicionar no painel do Supabase.'
  }
  if (lower.includes('rate limit') || lower.includes('email rate')) {
    return 'Muitos pedidos seguidos. Aguarde 1 minuto e tente de novo.'
  }
  if (lower.includes('invalid')) {
    return 'Email inválido. Confere se digitou certo.'
  }
  return msg
}

export async function signInWithEmail(email: string): Promise<SignInResult> {
  const cleaned = email.trim().toLowerCase()
  if (!isValidEmail(cleaned)) {
    return { ok: false, error: 'Email inválido.' }
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: cleaned,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })
  if (error) return { ok: false, error: translateError(error.message) }
  return { ok: true }
}

// Fallback pro magic link quando o Gmail "queima" o token via URL scanner.
// O mesmo email contém um código numérico (6-8 dígitos) que o user digita
// no painel — Gmail não pré-consome códigos, então sempre funciona.
export async function verifyEmailOtp(email: string, token: string): Promise<SignInResult> {
  const cleanedEmail = email.trim().toLowerCase()
  const cleanedToken = token.trim()
  if (!isValidEmail(cleanedEmail)) {
    return { ok: false, error: 'Email inválido.' }
  }
  if (!/^\d{6,8}$/.test(cleanedToken)) {
    return { ok: false, error: 'O código deve ter 6 a 8 dígitos numéricos.' }
  }
  const { error } = await supabase.auth.verifyOtp({
    email: cleanedEmail,
    token: cleanedToken,
    type: 'email',
  })
  if (error) return { ok: false, error: translateError(error.message) }
  return { ok: true }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}
