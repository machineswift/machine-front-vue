import js from '@eslint/js'
import globals from 'globals'
import tsEslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig, globalIgnores } from 'eslint/config'
import pluginPrettier from 'eslint-plugin-prettier'

export default defineConfig([
  globalIgnores(['dist', 'public/file-viewer', 'node_modules', 'coverage']),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.browser
    }
  },
  tsEslint.configs.recommended,
  pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsEslint.parser
      }
    }
  },
  {
    plugins: {
      prettier: pluginPrettier
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  }
])
