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
      "@typescript-eslint/no-explicit-any": "off", // Disable explicit any type rule
      "@typescript-eslint/no-unused-vars": "off", // Disable unused variables rule
      "react/no-unescaped-entities": "off", // Disable unescaped entities warning
      "react-hooks/exhaustive-deps": "off", // Disable missing dependencies warning in useEffect
      "@next/next/no-img-element": "off", // Disable the warning for using `<img>` instead of `next/image`
      "@typescript-eslint/no-unused-expressions": "off", // Disable unused expressions rule
    },
  },
];

export default eslintConfig;
