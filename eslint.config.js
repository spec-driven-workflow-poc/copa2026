"use strict";
module.exports = [
  {
    files: ["**/*.js"],
    ignores: ["openspec/**", "node_modules/**"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        location: "readonly",
        fetch: "readonly",
        ResizeObserver: "readonly",
        module: "writable",
        COUNTRIES: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error"
    }
  },
  {
    files: ["test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        require: "readonly",
        module: "writable",
        __dirname: "readonly",
        process: "readonly",
        console: "readonly"
      }
    }
  }
];
