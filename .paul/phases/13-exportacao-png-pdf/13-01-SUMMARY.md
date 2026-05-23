---
phase: 13-exportacao-png-pdf
plan: 01
status: completed
completed_at: 2026-05-24
---

## O que feito

Botão "📷" no header de cada seção que exporta a `<section className="mizu-section">` pai como PNG via html2canvas (lazy-loaded).

## Arquivos

- **NEW** `src/lib/exportPng.ts`: `exportSectionAsPng(el, filename)` + `safeFilename(title)` (slug PT-BR + data ISO)
- `src/components/SectionHeader.tsx`: prop `exportable?: boolean` (default true). Botão "📷" no actions slot que faz `closest('.mizu-section')` e dispara o export. Busy state ("…" enquanto carrega bundle html2canvas e gera canvas).
- `src/index.css`: `.section-export-btn` (creme + hover gold-border) + `@media print { display: none }`

## Code-splitting

html2canvas chunked como `exportPng-*.js` (200KB lazy) — bundle inicial não cresceu. Só baixa quando usuário clica em exportar.

## UX

Click no 📷 → bundle baixa (1ª vez) → canvas renderiza → arquivo `mizu-{slug}-2026-MM-DD.png` é baixado automaticamente. 2x scale pra qualidade WhatsApp.

## Próximo

13-02: Export PDF (window.print + CSS print-friendly).
