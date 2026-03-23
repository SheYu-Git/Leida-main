// Minimal flat config for Vue 3 + TS
import js from '@eslint/js'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: globals.browser
    },
    plugins: {
      '@typescript-eslint': ts,
      vue
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      'vue/multi-word-component-names': 'off',
      'no-useless-catch': 'off'
    }
  },
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: globals.browser
    },
    plugins: { vue },
    rules: {
      ...vue.configs['vue3-essential'].rules,
      'vue/multi-word-component-names': 'off',
      'no-unused-vars': 'warn',
      'no-useless-catch': 'off'
    }
  },
  {
    files: ['api/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: globals.node
    },
    plugins: {
      '@typescript-eslint': ts
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off'
    }
  }
]
