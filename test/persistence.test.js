"use strict";
const { test } = require("node:test");
const assert = require("node:assert");

test("chave de overrides é versionada e namespaced (wc2026_*_v1)", () => {
  const src = require("node:fs").readFileSync(
    require("node:path").join(__dirname, "..", "app.js"),
    "utf8"
  );
  assert.match(
    src,
    /STORAGE_KEY\s*=\s*"wc2026_overrides_v1"/,
    "chave deve seguir o padrão da ADR-0002"
  );
  assert.doesNotMatch(src, /document\.cookie/, "persistência não usa cookie (ADR-0002)");
});

test("preferência de tema usa chave namespaced wc2026_theme_v1 (ADR-0002)", () => {
  const src = require("node:fs").readFileSync(
    require("node:path").join(__dirname, "..", "app.js"),
    "utf8"
  );
  assert.match(src, /wc2026_theme_v1/, "tema deve persistir em wc2026_theme_v1");
});
