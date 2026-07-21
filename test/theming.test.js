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
