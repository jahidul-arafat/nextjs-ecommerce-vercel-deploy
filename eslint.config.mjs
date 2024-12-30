// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";
//
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
//
// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });
//
// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
// ];
//
// export default eslintConfig;

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable all rules
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      // Add any other rules you want to disable here
    },
  },
];

export default eslintConfig;