# ADR-0001 — Arquitetura sem build (HTML/CSS/JS puro)

**Status:** Accepted · **Date:** 2026-07-21 · **Requirements:** NFR-APR (portabilidade)

## Context

A página precisa abrir por duplo clique (`file://`), sem servidor nem instalação.
Uma etapa de build (bundler/transpiler) quebraria esse uso e adicionaria ferramentas
que o público não precisa ver para entender o app.

## Decision

Sem etapa de build. `app.js` é uma IIFE única; funções puras são exportadas via um
bloco `module.exports` **guardado** por `typeof module !== "undefined"`, para que os
testes (`node --test`) importem sem afetar o navegador. Estilos em `styles.css`, dados
estáticos em `countries.js`.

## Alternatives considered

- Bundler (Vite/esbuild) — rejeitado: quebra o `file://`, peso desnecessário.
- Framework (React) — rejeitado: reescrita total, contrário ao propósito do demo.

## Consequences

- (+) Portável, inspecionável, zero setup para rodar.
- (−) Sem módulos ES; organização por convenção dentro da IIFE.
- Downstream: gates são JS puros (Prettier/ESLint/node --test); afeta todas as capabilities.

## Traceability

NFR de portabilidade (abrir via `file://`); base para os gates de `AGENTS.md`.
