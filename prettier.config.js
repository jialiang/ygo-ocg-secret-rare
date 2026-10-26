export default {
  plugins: ["prettier-plugin-css-order", "@ianvs/prettier-plugin-sort-imports"],
  importOrder: ["<BUILTIN_MODULES>", "", "<THIRD_PARTY_MODULES>", "", "^[./]"],
  bracketSameLine: true,
  printWidth: 100,
};
