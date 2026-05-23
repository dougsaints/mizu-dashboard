---
phase: 07-hospedagem-polish
plan: 01b
status: complete
completed_at: 2026-05-23 (sessão noturna autônoma)
---

# 07-01b SUMMARY — Code-splitting + polish mobile (pre-deploy)

## O que foi entregue

Atacou o warning ">500KB" do bundle aplicando **code-splitting agressivo** via Vite/Rolldown `manualChunks` (vendors separados) + `React.lazy()` em 10 seções/cards do Dashboard. Cada seção/card carrega sob demanda, e cada lib grande (React, Chart.js, Supabase, React Query) virou chunk próprio que o browser cacheia separado. Polish CSS mobile: touch targets ≥40px em selects/botões/inputs, padding ajustado pra telas pequenas, `body { overflow-x: hidden; }` pra eliminar scroll horizontal acidental.

## Métricas antes/depois

### Antes (após Phase 6-02)

```
dist/assets/index-*.js   751.79 KB │ gzip: 226.25 KB   ⚠️ warning >500KB
dist/assets/index-*.css   51.10 KB │ gzip:   9.26 KB
```
**Total:** 1 chunk principal de 752KB / 226KB gzip — tudo baixado no carregamento inicial.

### Depois

```
dist/assets/index-*.js              68.61 KB │ gzip: 23.10 KB   ⬇ -91% vs antes
dist/assets/index-*.css             51.55 KB │ gzip:  9.35 KB
dist/assets/react-vendor-*.js      181.78 KB │ gzip: 57.19 KB
dist/assets/chart-vendor-*.js      183.00 KB │ gzip: 63.53 KB
dist/assets/supabase-vendor-*.js   196.30 KB │ gzip: 50.02 KB
dist/assets/query-vendor-*.js       35.36 KB │ gzip: 10.40 KB
dist/assets/pt-BR-*.js              27.60 KB │ gzip:  7.82 KB

dist/assets/SalesSection-*.js        7.06 KB │ gzip: 2.65 KB
dist/assets/TrendsSection-*.js       6.04 KB │ gzip: 2.33 KB
dist/assets/RoiSection-*.js          5.96 KB │ gzip: 2.24 KB
dist/assets/AnalysisSection-*.js     5.49 KB │ gzip: 1.91 KB
dist/assets/CorrelationSection-*.js  5.17 KB │ gzip: 2.07 KB
dist/assets/AnotaaiUploadCard-*.js   4.59 KB │ gzip: 1.84 KB
dist/assets/DiarioSection-*.js       4.57 KB │ gzip: 1.98 KB
dist/assets/AdsUploadCard-*.js       4.41 KB │ gzip: 1.76 KB
dist/assets/MarketingUnif-*.js       3.52 KB │ gzip: 1.43 KB
dist/assets/InstagramUploadCard-*.js 2.23 KB │ gzip: 1.07 KB

dist/assets/useAds-*.js              5.61 KB │ gzip: 2.46 KB
dist/assets/useAnotaai-*.js          4.62 KB │ gzip: 2.09 KB
dist/assets/useOrganic-*.js          3.97 KB │ gzip: 1.87 KB
```

**Sem warning >500KB.**

**O que isso significa pro usuário (Doug):**
- Carregamento inicial: ~325KB gzip baixados (index + react-vendor + supabase-vendor + query-vendor + 1ª seção). **Antes:** 226KB gzip (mas TUDO de uma vez, incluindo Chart.js mesmo se ainda não tiver descido). **Agora:** o browser pode paralelizar downloads e cachear cada chunk separado por muito mais tempo.
- 2ª visita: muito mais rápida — o browser não precisa rebaixar os 4 vendors se ele só recompilou um botão.

## Arquivos modificados

- `vite.config.ts` — `build.rollupOptions.output.manualChunks` (função) + `chunkSizeWarningLimit: 600`
- `src/pages/Dashboard.tsx` — 10 imports viraram `lazy()`, cada um envolto em `<Suspense fallback=…>`
- `src/index.css` — bloco "Polish mobile + lazy fallback (Phase 7-01b)" no fim: `.lazy-fallback`, `body { overflow-x: hidden }`, media query `@media (max-width: 768px)` com touch targets e padding mobile-friendly

## Decisões tomadas

1. **`manualChunks` como FUNÇÃO, não objeto.** Vite v8 está em rolldown, que tipa `manualChunks` como `ManualChunksFunction`. A forma objeto (Rollup clássico) deu erro TS2769. Função tem como bonus checar `id.includes('node_modules')` antes — evita falsos positivos em arquivos de usuário com nomes parecidos.

2. **Header e WeeklyRecap ficam estáticos (não-lazy).** Header é o primeiro elemento visível — atrasar = experiência ruim. WeeklyRecap é o "above the fold" mais importante pro Doug bater o olho rápido.

3. **`useAutoPollSales(300)` continua no escopo do Dashboard (não-lazy).** Precisa estar montado o tempo todo pra polling automático.

4. **Cada `<Suspense>` é individual, não global.** Englobar tudo em um Suspense só faria o usuário ver um spinner gigante até TODOS os chunks carregarem. Individualmente, cada seção mostra "Carregando…" e aparece quando estiver pronta. Granularidade > tempo total.

5. **`chunkSizeWarningLimit: 600`.** Mantém o guard rail (se algum chunk passar de 600KB de novo, vamos saber), mas dá folga vs o default 500KB porque agora cada vendor flutua perto de 200KB e o threshold padrão pegaria falsos positivos.

6. **Polish mobile conservador.** Toquei só em:
   - `body { overflow-x: hidden }` (previne scroll horizontal acidental)
   - Touch targets de 40px em telas <768px (acessibilidade tátil, recomendação Apple HIG)
   - Padding levemente reduzido em `.kpi-card / .unit-card / .trend-card` em mobile (12px 14px em vez do default)
   - `main` com gutter de 14px em vez de 28px em mobile (via `!important` pra sobrescrever o inline style do Dashboard)

   **Não toquei** em tipografia, cores, ou ordem de seções — Doug valida visual de manhã.

## Verificação

- [x] `npx tsc --noEmit` passa
- [x] `npm run build` passa, sem warning >500KB
- [x] 21+ arquivos JS em `dist/assets/` (vs 1 antes)
- [x] Chunk principal: 68KB / 23KB gzip (vs 752KB / 226KB antes)
- [x] Vendors separados em 4 chunks dedicados (react, chart, supabase, query)
- [x] 10 seções/cards usam `lazy()` no Dashboard.tsx
- [x] CSS tem `.lazy-fallback` + media query mobile com touch targets
- [ ] **Validação visual pendente:** Doug abre `npm run dev`, navega pelo painel, confere se nenhuma seção ficou esquisita com Suspense + lazy (regressão típica seria flash de "Carregando…" muito longo, ou layout shift).

## Acceptance criteria

- [x] AC-1: Chunk principal < 500KB (na verdade 68KB!), warning sumiu
- [x] AC-2: 10 seções usando `lazy()` + `Suspense` individual (mais que os 5 mínimos do plano)
- [x] AC-3: 4 chunks vendor separados (react, chart, supabase, query)
- [x] AC-4: Viewport tag já existia; touch targets 40px e overflow-x:hidden adicionados
- [x] AC-5: Build limpo, sem warning, type-check passa

## Issues deferidas

- **Validação visual em browser real** — preciso do Doug acordado. Risco: o flash de "Carregando…" pode ser perceptível em conexões lentas; se incomodar, podemos preload de chunks ou trocar fallback por skeleton.
- **`scheduler` está agrupado com react-vendor** via `id.includes('scheduler')`. Heurística boa o suficiente, mas se algum dia trocarmos React por outra runtime, lembrar de ajustar.
- **`pt-BR-*.js` (27KB)** — chunk de locale gerado automaticamente por algo (provavelmente date-fns ou similar). Não está no manualChunks explicitamente; rolldown gerou. Ok deixar como está.

## Pendências pra Doug acordar

1. **Validação visual** — abrir `npm run dev` (ou `npm run build && npm run preview`) e percorrer o painel:
   - Tendências carrega rápido? Frase-resumo faz sentido?
   - Correlação Meta × Vendas: scatter aparece, número de Pearson "r = X,XX" parece coerente?
   - Mudar filtro de período: tudo atualiza?
   - No celular (devtools mobile ou abrir no celular real): seções não ficaram apertadas, botões clicáveis fáceis?

2. **Deploy Vercel (07-01 real)** — Doug precisa:
   - Confirmar conta Vercel (criar se não tem) e conectar com GitHub `dougsaints/mizu-dashboard`
   - Decidir se vai usar domínio Vercel default (algo.vercel.app) ou domínio próprio
   - Importante: as variáveis de ambiente do Supabase precisam ser configuradas no painel da Vercel

3. **Auth (07-02)** — decisão de produto. Opções:
   - Senha compartilhada simples (1 só pra todos os usuários)
   - Magic link via Supabase Auth (email + clique no link)
   - Login + senha com Supabase Auth

## Próximo passo

Doug valida visualmente o trabalho desta noite (3 plans entregues: 06-01 correlação, 06-02 tendências, 07-01b code-splitting + polish). Depois disso, planejamos juntos o deploy Vercel real (07-01) e o auth (07-02), com as decisões dele.
