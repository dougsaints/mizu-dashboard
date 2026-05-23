---
phase: 07-hospedagem-polish
plan: 02b
type: execute
autonomous: true
---

<objective>
## Goal
Adicionar campo OTP (código numérico do email) como **fallback do magic link** na tela de Login. Gmail Web tem URL scanner que pré-consome tokens de uso único — usuário clica e recebe "token not found". Código numérico contorna isso (Gmail não digita códigos sozinho).
</objective>

<context>
@.paul/PROJECT.md
@src/api/useAuth.ts
@src/pages/Login.tsx
@src/index.css
</context>

<acceptance_criteria>
## AC-1: verifyEmailOtp no useAuth
Given email + código de 6-8 dígitos
When chamo verifyEmailOtp(email, token)
Then chama supabase.auth.verifyOtp({ email, token, type: 'email' })
  And retorna { ok: true } em sucesso ou { ok: false, error } com tradução PT-BR

## AC-2: Campo OTP no estado 'sent' do Login
Given user pediu magic link (estado 'sent')
When Login renderiza esse estado
Then mostra mensagem "Link enviado" como antes
  And mostra também: "Se o link não funcionar (pode acontecer com Gmail), digite aqui o código numérico do mesmo email:"
  And input pra 8 dígitos (autoComplete="one-time-code", inputMode="numeric")
  And botão "Entrar com código" disabled até ter 6-8 dígitos
  And erro inline se código errado/expirado
</acceptance_criteria>

<tasks>
<task type="auto">
  <name>Task 1: verifyEmailOtp no useAuth.ts</name>
  <files>src/api/useAuth.ts</files>
  <action>Adicionar função verifyEmailOtp com validação 6-8 dígitos + chamada verifyOtp do Supabase com type='email'. Reusar translateError já existente.</action>
  <verify>tsc passa</verify>
  <done>AC-1</done>
</task>

<task type="auto">
  <name>Task 2: UI campo OTP no Login.tsx</name>
  <files>src/pages/Login.tsx, src/index.css</files>
  <action>No estado 'sent', adicionar bloco com input de código + botão "Entrar com código". Estado novo 'verifying' enquanto chama verifyEmailOtp. Mantém botão "Tentar com outro email". CSS pequeno bloco com border-top separando do "link enviado".</action>
  <verify>build passa</verify>
  <done>AC-2</done>
</task>

<task type="auto">
  <name>Task 3: Build + push</name>
  <files>(git)</files>
  <action>npm run build, commit, git push origin main, Vercel auto-deploya</action>
  <verify>push OK</verify>
  <done>código novo no Vercel</done>
</task>
</tasks>

<output>
.paul/phases/07-hospedagem-polish/07-02b-SUMMARY.md
</output>
