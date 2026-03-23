// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // 🚨 Deuda técnica pendiente: Esto debe ser 'error' en un estándar Enterprise.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      "prettier/prettier": ["error", { endOfLine: "auto" }],

      // 🛡️ BARRERA DE SEGURIDAD MULTI-TENANT (PRISMA ZERO-TRUST)
      "no-restricted-syntax": [
        "error",
        {
          "selector": "MemberExpression[object.property.name='prisma'][property.name!='secure']",
          "message": "❌ SECURITY BREACH (Multi-tenant): Prohibido usar 'this.prisma' crudo. Debes usar 'this.prisma.secure.[modelo]' o 'this.prisma.secure.$transaction' para garantizar el aislamiento de datos. Revisa el archivo .agent/rules/tenant-security.md"
        },
        {
          "selector": "MemberExpression[property.name='$queryRaw']",
          "message": "❌ SECURITY BREACH: El uso de $queryRaw está bloqueado porque salta la extensión de seguridad multi-tenant de Prisma."
        },
        {
          "selector": "MemberExpression[property.name='$executeRaw']",
          "message": "❌ SECURITY BREACH: El uso de $executeRaw está bloqueado porque salta la extensión de seguridad multi-tenant de Prisma."
        }
      ]
    },
  },
);