import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Code repris tel quel du prototype (spécification vivante) : on ne le
    // reformate pas pour satisfaire des règles de style.
    files: ["components/Charabilla.jsx", "lib/art.jsx"],
    rules: {
      // Les textes sont en français et pleins d'apostrophes ; les échapper
      // n'change rien au rendu et multiplie le risque de faute de frappe.
      "react/no-unescaped-entities": "off",
      // Les illustrations sont des images base64 venant du stockage local :
      // next/image ne sait pas les optimiser.
      "@next/next/no-img-element": "off",
      // Le composant <Art> est défini dans le composant parent, comme dans
      // le prototype — il a besoin du thème et du cache d'images courants.
      "react-hooks/static-components": "off",
    },
  },
]);

export default eslintConfig;
