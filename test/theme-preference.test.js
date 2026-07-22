"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const app = require("../app.js");

/* ------------------------- resolveTheme (puro) ------------------------- */

test("resolveTheme: light/dark explícitos vencem a preferência do SO", () => {
  assert.strictEqual(app.resolveTheme("light", true), "light");
  assert.strictEqual(app.resolveTheme("dark", false), "dark");
});

test("resolveTheme: system segue a preferência do SO", () => {
  assert.strictEqual(app.resolveTheme("system", true), "dark");
  assert.strictEqual(app.resolveTheme("system", false), "light");
});

test("resolveTheme: valor inválido cai no comportamento system (default seguro)", () => {
  assert.strictEqual(app.resolveTheme("bogus", true), "dark");
  assert.strictEqual(app.resolveTheme(undefined, false), "light");
});

/* ------------------------- prefs (namespaced) -------------------------- */

function fakeStore() {
  const m = {};
  return {
    getItem: (k) => (k in m ? m[k] : null),
    setItem: (k, v) => {
      m[k] = String(v);
    }
  };
}

test("makePrefs: round-trip get/set de valores JSON", () => {
  const p = app.makePrefs(fakeStore());
  p.set("wc2026_theme_v1", "dark");
  assert.strictEqual(p.get("wc2026_theme_v1", "system"), "dark");
  p.set("wc2026_obj_v1", { a: 1 });
  assert.deepStrictEqual(p.get("wc2026_obj_v1", null), { a: 1 });
});

test("makePrefs: chave ausente retorna o default", () => {
  const p = app.makePrefs(fakeStore());
  assert.strictEqual(p.get("wc2026_theme_v1", "system"), "system");
});

test("makePrefs: JSON inválido degrada para o default sem lançar", () => {
  const store = fakeStore();
  store.setItem("wc2026_theme_v1", "{not json");
  const p = app.makePrefs(store);
  assert.strictEqual(p.get("wc2026_theme_v1", "system"), "system");
});

test("makePrefs: store que lança não quebra get/set", () => {
  const boom = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    }
  };
  const p = app.makePrefs(boom);
  assert.doesNotThrow(() => p.set("wc2026_theme_v1", "dark"));
  assert.strictEqual(p.get("wc2026_theme_v1", "system"), "system");
});
