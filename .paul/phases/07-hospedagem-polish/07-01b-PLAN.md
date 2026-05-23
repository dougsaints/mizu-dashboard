---
phase: 07-hospedagem-polish
plan: 01b
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/Dashboard.tsx
  - vite.config.ts
  - src/index.css
autonomous: true
---

<objective>
## Goal
Atacar **2 das 3 partes** da Phase 7 que podem ser feitas sem o Doug presente: (a) **code-splitting** do bundle JS — atualmente ~752KB, warning >500KB — usando `React.lazy()` + `Suspense` nas seções pesadas e separando vendors em chunks manuais via `vite.config.ts`; (b) **polish de UX/mobile** — viewport tag, touch targets ≥40px, overflow horizontal eliminado em telas pequenas.

A 3ª parte (deploy Vercel + auth) **fica fora deste plano** — depende do Doug logar na Vercel/GitHub. Esse plano é numerado `07-01b` (não `07-01`) pra deixar claro que é o "pre-work" não-deploy. O 07-01 real e o 07-02 serão criados quando Doug acordar.

## Purpose
- Tirar o warning >500KB do build (registrado na lista de issues deferidas em STATE.md como effort S, Phase 7).
- Reduzir tempo de carregamento inicial: hoje todo o JS (incluindo Chart.js + upload parsers) é baixado no `index.html`. Lazy-loading divide isso em chunks que carregam sob demanda.
- Garantir que o painel está utilizável em mobile (Doug provavelmente abre no celular durante o dia).

## Output
- `src/pages/Dashboard.tsx` com `lazy()` em pelo menos 4-5 seções pesadas (Charts, uploads)
- `vite.config.ts` com `build.rollupOptions.output.manualChunks` separando React + Chart.js + Supabase em chunks próprios
- CSS de polish mobile no `index.css`
- `.paul/phases/07-hospedagem-polish/07-01b-SUMMARY.md` ao final
</objective>

<context>
## Project Context
@.paul/PROJECT.md
@.paul/ROADMAP.md
@.paul/STATE.md

## Prior Work
@.paul/phases/06-correlacoes-analise-cruzada/06-02-SUMMARY.md
(Bundle atual: ~752KB JS / 226KB gzip; ~51KB CSS / 9KB gzip. Todas as seções são imports estáticos no `pages/Dashboard.tsx` — único entry point.)

## Source Files
@src/pages/Dashboard.tsx
@vite.config.ts
@src/index.css
@index.html
</context>

<acceptance_criteria>

## AC-1: Code-splitting reduz o chunk principal

```gherkin
Given o build atual produz 1 chunk principal de ~752KB
When eu rodar `npm run build` após este plan
Then o chunk principal (`index-*.js`) está abaixo de 500KB (gzip < 160KB)
  And o resto do JS está distribuído em 3+ chunks separados (ex: react-vendor, chart-vendor, sections lazy)
  And o warning ">500KB" some do build output
```

## AC-2: Seções pesadas usam React.lazy + Suspense

```gherkin
Given o Dashboard renderiza 9 seções/cards
When abro `src/pages/Dashboard.tsx`
Then pelo menos 5 das seguintes seções são importadas via `lazy(() => import(...))`:
  - SalesSection (Chart.js linha)
  - AnalysisSection (Chart.js barras)
  - CorrelationSection (Chart.js scatter)
  - TrendsSection (sem chart)
  - AdsUploadCard
  - AnotaaiUploadCard
  - InstagramUploadCard
  And cada uma vem envolvida em `<Suspense fallback={...}>` com fallback textual em PT-BR ("Carregando…")
  And as seções leves do topo (WeeklyRecap, MarketingUnif, RoiSection, DiarioSection) ficam estáticas se já forem leves; lazy se forem pesadas
```

## AC-3: vite.config.ts separa vendors

```gherkin
Given vite.config.ts é editado
When eu rodar npm run build
Then existem chunks separados (visíveis no output do vite build):
  - react-vendor (react + react-dom + react-router se houver)
  - chart-vendor (chart.js + react-chartjs-2)
  - supabase-vendor (@supabase/supabase-js)
  - query-vendor (@tanstack/react-query)
  And cada chunk vendor é < 250KB gzip
```

## AC-4: Polish mobile — viewport e touch targets

```gherkin
Given index.html é editado
When inspeciono o `<head>`
Then existe `<meta name="viewport" content="width=device-width, initial-scale=1">` se ainda não estiver
  And no CSS, todos os botões e selects do header tem `min-height: 40px` em telas <768px
  And nenhuma seção tem overflow horizontal em viewports de 360px (testado mentalmente via grep de `width: ...px` fixos)
```

## AC-5: Build limpo e funcional

```gherkin
Given todas as mudanças aplicadas
When rodo `npx tsc --noEmit && npm run build`
Then ambos passam sem erro
  And o build output não mostra warning >500KB
  And `vite preview` sobe e renderiza o dashboard (validado por inspeção do `dist/`)
```

</acceptance_criteria>

<tasks>

<task type="auto">
  <name>Task 1: Configurar manualChunks no vite.config.ts</name>
  <files>vite.config.ts</files>
  <action>
    Editar `vite.config.ts` para adicionar `build.rollupOptions.output.manualChunks`:

    ```ts
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    export default defineConfig({
      plugins: [react()],
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'chart-vendor': ['chart.js', 'react-chartjs-2'],
              'supabase-vendor': ['@supabase/supabase-js'],
              'query-vendor': ['@tanstack/react-query'],
            },
          },
        },
        chunkSizeWarningLimit: 600, // ainda mantemos guard rail, só sobe um pouco
      },
    })
    ```

    Avoid:
    - Subir `chunkSizeWarningLimit` pra 1000+ — isso só esconde o problema. 600 é folga razoável depois do split.
    - Listar dependências que não estão no `package.json` (vai falhar o build).
  </action>
  <verify>`npm run build` mostra os 4 chunks vendor + chunk principal. `dist/assets/` deve ter 5+ arquivos `.js`.</verify>
  <done>AC-3 satisfeito.</done>
</task>

<task type="auto">
  <name>Task 2: Aplicar React.lazy nas seções pesadas + Suspense no Dashboard</name>
  <files>src/pages/Dashboard.tsx</files>
  <action>
    Reescrever o `Dashboard.tsx`:

    1. Trocar imports estáticos por `lazy()` nas seções pesadas:
       ```ts
       import { lazy, Suspense } from 'react'

       const SalesSection = lazy(() => import('../sections/SalesSection'))
       const AnalysisSection = lazy(() => import('../sections/AnalysisSection'))
       const CorrelationSection = lazy(() => import('../sections/CorrelationSection'))
       const TrendsSection = lazy(() => import('../sections/TrendsSection'))
       const AdsUploadCard = lazy(() => import('../components/AdsUploadCard'))
       const AnotaaiUploadCard = lazy(() => import('../components/AnotaaiUploadCard'))
       const InstagramUploadCard = lazy(() => import('../components/InstagramUploadCard'))
       ```

    2. Manter estáticas as leves (Header, WeeklyRecap, MarketingUnif, RoiSection, DiarioSection) — abrir cada uma rapidamente pra ver se contém chart pesado. Se sim, também lazy.

    3. Envolver cada lazy em `<Suspense>` com fallback compartilhado:
       ```tsx
       function LazyFallback({ label = 'Carregando…' }: { label?: string }) {
         return <div className="lazy-fallback">{label}</div>
       }
       ```
       Usar individualmente por seção (em vez de um Suspense englobando tudo) — assim cada chunk carrega independente e o usuário não fica vendo um spinner global enquanto 7 chunks carregam.

    4. Manter `useAutoPollSales(300)` fora do lazy (precisa estar montado o tempo todo).

    Avoid:
    - Lazy de `useFilters` / `FilterProvider` — ele precisa estar no escopo dos children.
    - Lazy do `Header` — é o primeiro elemento visível, atrasar = experiência ruim.
    - Suspense englobando o `<main>` inteiro — vira spinner global.
  </action>
  <verify>`npx tsc --noEmit` passa. `npm run build` mostra os chunks dinâmicos das seções (vai aparecer `SalesSection-*.js`, `CorrelationSection-*.js`, etc no output). Chunk principal cai consideravelmente.</verify>
  <done>AC-2 e parte do AC-1 satisfeitos.</done>
</task>

<task type="auto">
  <name>Task 3: Polish mobile no index.css + viewport tag</name>
  <files>src/index.css, index.html</files>
  <action>
    1. **index.html:** confirmar (e adicionar se faltar) `<meta name="viewport" content="width=device-width, initial-scale=1">` no `<head>`.

    2. **index.css** (apendar ao fim ou ajustar em lugar conforme cabível):
       - Em `@media (max-width: 768px)`:
         - `select`, `button`, `input[type="date"]` ganham `min-height: 40px` (acessibilidade tátil)
         - `.kpi-card`, `.unit-card`, `.trend-card` padding ligeiramente menor (12px 14px)
       - `body { overflow-x: hidden; }` se ainda não tiver — evita scroll horizontal acidental.
       - `.lazy-fallback`:
         ```css
         .lazy-fallback {
           background: var(--card);
           border: 1px solid var(--border);
           border-radius: var(--r-md);
           padding: 22px 24px;
           margin-bottom: 22px;
           color: var(--txt-2);
           font-size: 14px;
           text-align: center;
           box-shadow: var(--sh-xs);
         }
         ```

    Avoid:
    - Mexer em layout estável já validado (não reorganizar a grid de KPIs, só dar respiro).
    - Adicionar CSS reset global ou normalizar (já está estável).
    - Mudar fontes ou cores.
  </action>
  <verify>`npm run build` passa. Visual: inspecionar o `index.html` pra confirmar viewport. CSS final tem `.lazy-fallback`, `body { overflow-x: hidden; }`, `min-height: 40px` em selects no media query mobile.</verify>
  <done>AC-4 satisfeito.</done>
</task>

<task type="auto">
  <name>Task 4: Build final e validação</name>
  <files>(nenhum — só comandos)</files>
  <action>
    1. Rodar `npm run build` — confirmar que:
       - Não tem warning >500KB
       - Existem ≥5 arquivos JS em `dist/assets/`
       - Chunk principal `<` 500KB raw / <160KB gzip
    2. Se ainda tiver warning, registrar no SUMMARY como deferred issue (Doug avalia se vale aumentar `chunkSizeWarningLimit` ou splitar mais).
    3. Não rodar `vite preview` (sem browser autônomo). Documentar no SUMMARY que o user precisa abrir `npm run dev` ou `vite preview` pra validação visual.

    Avoid:
    - Tentar testar interatividade — sem browser autônomo.
    - Subir o `chunkSizeWarningLimit` pra esconder warning em vez de resolver.
  </action>
  <verify>Build output no terminal mostra split em múltiplos chunks; warning >500KB ausente.</verify>
  <done>AC-1 e AC-5 satisfeitos.</done>
</task>

</tasks>

<boundaries>

## DO NOT CHANGE
- Lógica de hooks (`useSales`, `useAds`, etc.) — só consumidas, não alteradas
- Migrations / Supabase
- Tipos em `src/types/database.ts`
- FilterProvider (`src/lib/period.tsx`)
- Componentes existentes (`Header`, `WeeklyRecap`, `SalesSection`, etc.) — só forma de import muda, não o código interno
- `.paul/PROJECT.md` (será atualizado por `/paul:complete-milestone` ou similar quando Doug aprovar)

## SCOPE LIMITS
- **Não fazer deploy Vercel.** Esse é o 07-01 real que precisa do Doug.
- **Não implementar auth.** Esse é o 07-02 que é decisão de produto do Doug.
- Não adicionar Service Worker / PWA.
- Não adicionar analytics ou tracking.
- Não otimizar imagens (não há imagens no painel ainda).
- Não migrar pra App Router / Next.js / outra stack.

</boundaries>

<verification>
- [ ] `npx tsc --noEmit` passa
- [ ] `npm run build` passa
- [ ] Build output mostra múltiplos chunks (ao menos 5 arquivos JS em dist/assets/)
- [ ] Warning ">500KB" ausente do output
- [ ] Dashboard.tsx usa `lazy()` em pelo menos 5 imports
- [ ] vite.config.ts tem `manualChunks` configurado
- [ ] index.html tem viewport tag
- [ ] CSS tem `.lazy-fallback` e media query mobile com touch targets
- [ ] SUMMARY criado com métricas antes/depois (KB do bundle)
</verification>

<success_criteria>
- Bundle principal abaixo de 500KB raw
- Warning de bundle removido do build
- Lazy-loading funcional em pelo menos 5 seções
- Polish CSS mobile aplicado (touch targets + overflow)
- Dashboard.tsx continua funcional (validado por build + type-check; visual depende de Doug)
</success_criteria>

<output>
Criar `.paul/phases/07-hospedagem-polish/07-01b-SUMMARY.md` com:
- Métricas antes/depois (KB e gzip do chunk principal e dos chunks vendor)
- Lista das seções que viraram lazy
- Decisões (ex: por que essa seção ficou estática?)
- Pendências pra Doug acordar (deploy 07-01 + auth 07-02)
- Próximo passo claro: Doug valida visualmente + decide deploy Vercel
</output>
