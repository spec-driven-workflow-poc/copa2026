"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

test("styles.css define tokens de cor no :root", () => {
  assert.match(css, /--bg:/, "token --bg deve existir");
  assert.match(css, /--ink:/, "token --ink deve existir");
});

test("styles.css tem bloco de override do tema escuro (data-theme=dark)", () => {
  assert.match(
    css,
    /:root\[data-theme="dark"\]/,
    'tema escuro deve ser override de tokens sob :root[data-theme="dark"] (ADR-0003)'
  );
});

test("app.js resolve o modo system via matchMedia(prefers-color-scheme)", () => {
  const src = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  assert.match(
    src,
    /matchMedia\(\s*["']\(prefers-color-scheme: dark\)["']\s*\)/,
    "system deve ser resolvido em JS via matchMedia(prefers-color-scheme: dark)"
  );
});

// Anti-flash: o tema DEVE ser aplicado antes do primeiro paint — ou seja, por um
// script no <head> (não em DOMContentLoaded). Guarda estática (como as demais),
// já que o efeito visual não é unit-testável.
test("index.html aplica o tema antes do primeiro paint (script inline no <head>)", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const head = html.slice(0, html.indexOf("</head>"));
  assert.match(head, /wc2026_theme_v1/, "o anti-flash deve ler a preferência no <head>");
  assert.match(
    head,
    /setAttribute\(\s*["']data-theme["']/,
    "o anti-flash deve setar data-theme ainda no <head> (antes do <body>)"
  );
});

// Reação ao vivo do modo system: o listener de mudança do SO deve existir (o grep
// de matchMedia sozinho seria satisfeito pelo anti-flash; aqui exigimos o wiring).
test("app.js reage ao vivo à troca de tema do SO (addEventListener change)", () => {
  const src = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  assert.match(
    src,
    /addEventListener\(\s*["']change["']/,
    "deve registrar listener de 'change' em prefers-color-scheme (reação ao vivo)"
  );
});

// Invariante ADR-0003: nenhum literal de cor em regras fora dos blocos de token
// (:root e :root[data-theme=...]). Remove todos os blocos :root{...} e verifica
// que o restante não contém hex/rgb/hsl.
test("nenhum literal de cor fora dos blocos de token :root", () => {
  const withoutTokenBlocks = css.replace(/:root(\[[^\]]*\])?\s*\{[^}]*\}/g, "");
  const colorLiteral = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;
  const offending = withoutTokenBlocks
    .split("\n")
    .filter((l) => colorLiteral.test(l) && !/^\s*\/\*/.test(l) && !/^\s*\*/.test(l));
  assert.deepStrictEqual(
    offending,
    [],
    "cores devem vir de tokens; literais fora do :root:\n" + offending.join("\n")
  );
});
