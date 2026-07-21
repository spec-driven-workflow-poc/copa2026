"use strict";
const { test } = require("node:test");
const assert = require("node:assert");
const app = require("../app.js");

test("sortRows ordena por PTS, depois SG, depois GP", () => {
  const a = { PTS: 6, SG: 2, GP: 4 };
  const b = { PTS: 3, SG: 5, GP: 9 };
  assert.ok(app.sortRows(a, b) < 0, "mais pontos vem primeiro");
});

test("sortRows desempata por saldo de gols quando PTS empatam", () => {
  const a = { PTS: 3, SG: 4, GP: 5 };
  const b = { PTS: 3, SG: 1, GP: 9 };
  assert.ok(app.sortRows(a, b) < 0, "maior SG vem primeiro");
});
