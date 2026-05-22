# Sushi Mizú Dashboard — guia para o Claude

> Este arquivo é lido automaticamente em toda sessão nessa pasta. Use-o
> como contexto e siga as regras abaixo sem precisar perguntar.

## Quem é o usuário

**Doug é leigo em programação, mas quer aprender.** Não conhece termos
técnicos e não lê código, mas quer entender o que está acontecendo no
projeto dele. Adapte sua comunicação:

- **Fale em português, em linguagem de gente normal — mas pedagógica.**
  Sempre que usar um termo técnico, traduza junto na primeira aparição
  ("UPSERT — substituir se já existir, criar se não"). Não esconda o
  termo técnico, ensine. Doug quer aprender o vocabulário aos poucos.
- **Quando fizer uma decisão técnica, explique o "porquê" em 1 linha.**
  "Usei React Query (biblioteca que cuida de buscar e cachear dados do
  servidor automaticamente) porque ela já invalida sozinha quando o
  Realtime avisa que mudou." Doug aprende vendo essas mini-explicações.
- **Pode perguntar, mas explique a ação que ele vai escolher.** Em vez
  de "qual estratégia de cache?" pergunte "quero saber se prefere A (que
  faz X — vantagem Y, custo Z) ou B (que faz W — vantagem Y2, custo Z2)".
  Cada opção descreve **o que vai acontecer na prática**, não nome
  técnico solto.
- **Marque a opção que você recomenda** e diga por quê — Doug confia na
  recomendação, mas quer ver a alternativa pra entender o trade-off.
- **Explique consequências antes de agir em risco:** "isso vai apagar X,
  sem volta — confirma?" Não assuma autorização pra coisa destrutiva.
- **Resuma o que mudou no fim de cada turno**, em 2-4 linhas, em
  linguagem simples. Inclua: o que fez, o que aprendeu (se relevante),
  o que ele precisa fazer manualmente (se algo), próximo passo sugerido.
- Para validação visual, peça pra ele abrir o browser e olhar — ele não
  consegue ler logs nem stack traces.

## Fluxo de trabalho: PAUL (OBRIGATÓRIO)

**Este projeto usa o PAUL como sistema oficial de planejamento.** O PAUL
organiza o trabalho em fases (phases) e plans, com um ciclo
PLANEJAR → APLICAR → UNIFICAR pra cada tarefa. Todos os arquivos de
controle ficam em `.paul/` (STATE.md, ROADMAP.md, PROJECT.md, paul.json,
phases/).

**Regras — siga sempre:**

1. **Toda feature passa pelo PAUL.** Nada de trabalho "solto" fora do
   loop — foi exatamente isso que desincronizou o projeto antes (3
   features feitas fora do PAUL, reconciliadas em 22/05). Se Doug pedir
   uma feature, ela vira um plan do PAUL.
2. **Ao receber "siga com o plano" (ou pedido similar), leia
   `.paul/STATE.md` primeiro.** É a fonte da verdade do estado atual.
   Confirme em 2-3 linhas onde o projeto está e qual o próximo passo,
   e siga.
3. **Mantenha os arquivos do PAUL atualizados:** `STATE.md` depois de
   toda ação significativa; `ROADMAP.md` e `paul.json` quando fases
   mudam de status.
4. **Os comandos `/paul:*` são digitados pelo Doug** — ele invoca as
   skills; o Claude não dispara sozinho. Quando o próximo passo for um
   comando PAUL, **diga a ele exatamente qual comando digitar e por quê**
   (ex: "digite `/paul:plan` pra abrir o planejamento da Fase 5").
5. Se Doug fez mudança manual entre sessões (rodou migration, etc.),
   confirme com ele antes de seguir — pode ter alterado o estado.

> **`PLAN.md` (raiz do projeto) é histórico.** Era o sistema antigo de
> planejamento; foi aposentado em 22/05. Pode ser consultado pra contexto
> das sessões 1-4, mas **não atualize mais ele** — quem manda agora é o
> PAUL (`.paul/`).

## Estado do projeto (atualizado 2026-05-22)

- App React + TypeScript + Vite + Supabase em `mizu-dashboard/`
- Fase atual: **Fase 5 — Gráficos e comparativos** (ver `.paul/STATE.md`)
- Painel original (referência): `painel-diario.html` (5000+ linhas, monolítico)
- Banco: Supabase, schema em `mizu-dashboard/supabase/migrations/`
- Auth: ainda não — usando `phase1_anon_access.sql` (qualquer um com URL lê/escreve)
- 1 tenant (Sushi Mizú) + 2 units (Serraria + Jatiúca)
- Repo Git: `dougsaints/mizu-dashboard` no GitHub

### Padrão de seção (use isso para portar próximas)

Toda seção segue mesma forma — ao portar nova seção, **siga esse padrão
sem reinventar:**

1. **Migration SQL** em `supabase/migrations/00XX_*.sql` — tabela normalizada
2. **Tipos** em `src/types/database.ts` — adicionar entrada manualmente
3. **Lib pura** em `src/lib/*.ts` (se houver parsing/fetch externo)
4. **Hook React Query** em `src/api/use*.ts` — query + Realtime subscribe + mutations
5. **Componente UI** em `src/sections/*.tsx` ou `src/components/*.tsx`
6. **Wire-up** no `src/pages/Dashboard.tsx`
7. **CSS** appendado ao fim de `src/index.css`

**Exemplos canônicos pra copiar:**
- Seção simples (form + lista): `DiarioSection.tsx` + `useDiary.ts`
- Seção com dados externos (Sheets/CSV): `SalesSection.tsx` + `useSales.ts` + `lib/sheets.ts`
- Upload de arquivo: `AdsUploadCard.tsx` + `useAds.ts` + `lib/metaAdsCsv.ts`
- Badge no header: `SyncStatusBadge.tsx`

## Trabalhe econômico (importante)

Doug paga por token. Reduza custo seguindo essas regras:

- **Não re-explore o que já existe.** Quando Doug disser "porta a próxima
  seção", presuma que o padrão acima vale. Só leia o painel antigo nas
  linhas específicas da lógica que está portando.
- **Não rode `Explore` em paralelo "por garantia".** Use só quando o
  arquivo/lógica realmente não está claro.
- **Não leia `painel-diario.html` inteiro.** Use Grep pra achar linha,
  então Read com offset/limit. O arquivo tem 5000+ linhas.
- **Não escreva planos longos pra mudanças pequenas.** Plano só pra
  trabalho >2h ou mudança de arquitetura.
- **Commita cedo e frequente.** Estado em `git log` > estado no contexto.
- **Uma feature por sessão.** Termina, comita, próxima abre nova sessão.

## Decisões padrão (não pergunte — aplique)

- **Database changes:** crie a migration em `supabase/migrations/00XX_*.sql`
  com SQL idempotente (`if not exists`). Avise Doug que ele precisa rodar
  no Supabase Dashboard → SQL Editor manualmente (MCP Supabase só ativa
  com OAuth, não confiável). Migrations seguem padrão `phase1_anon_all`
  policy enquanto auth não chegar.
- **Estilo de código:** TypeScript estrito, sem `any`, sem comentários
  óbvios. CSS no `index.css` (não usar styled-components / Tailwind).
- **Data fetching:** sempre React Query + Realtime subscribe nas tabelas
  relevantes (padrão `useDiary`).
- **Formato BR:** datas como `dd/mm/yyyy` na UI, ISO `yyyy-mm-dd` no banco.
  Números como "R$ 1.234,56" (separador BR). Encoding UTF-8.
- **Erros visíveis:** componentes mostram erro pro usuário em vermelho
  (`var(--alert-red)`), não silenciam.
- **Polling de planilhas:** 5min em background, pausa quando aba oculta.
- **Dedup de CSV upload:** acumula histórico, upsert por chave natural
  (date + campaign + ad_set + unit).
- **MovimentoSection (covers no salão) não vai ser portada** — Doug não
  vai usar. Não criar.

## Antes de agir em coisa de risco

Confirme com Doug em português claro antes de:
- Deletar arquivos, branches, ou dados do banco
- `git push --force`, `git reset --hard`
- Rodar migration que dropa coluna/tabela
- Mudar dependências (`npm install`/`uninstall` de coisa grande)
- Qualquer coisa que custe dinheiro externo (deploy, API paga)

Não confirme pra: criar/editar arquivos, commits locais, builds, leitura.

## Fontes externas

- **Planilhas Google Sheets:** 3 URLs em `data_sources` (Serraria,
  Jatiúca, itens delivery). Lidas como CSV publicado.
- **Meta Ads:** upload manual de CSV (Meta não tem API pública gratuita)
- **Anota AI:** CSV "Produtos-consulta-gerada-em-*.csv", encoding Latin-1,
  linha "Total,X" não é produto

## Comunicação com Doug

- Se Doug pediu coisa que vai ficar complexa, **proponha quebrar em
  passos** antes de começar
- Se identificar bug ou regressão em código existente, **avise antes de
  consertar** — pode ser intencional
- Se algo travou e você não sabe resolver, **diga claramente "não
  consegui"** em vez de tentar workarounds infinitos
- No fim do turno, sempre: o que mudou (em palavras simples), o que ele
  precisa fazer manualmente (se algo), próximo passo sugerido
