import globals from "globals";
import js from "@eslint/js";

import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
  },
]);
