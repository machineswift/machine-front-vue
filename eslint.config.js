import js from '@eslint/js'
import globals from 'globals'
import tsEslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig } from 'eslint/config'
import pluginPrettier from 'eslint-plugin-prettier'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    plugins: {
      js
    },
    extends: ['js/recommended']
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
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
      'prettier/prettier': [
        'error',
        {
          semi: false,
          singleQuote: true,
          printWidth: 160,
          tabWidth: 2,
          useTabs: false,
          trailingComma: 'none',
          bracketSpacing: true,
          arrowParens: 'avoid',
          vueIndentScriptAndStyle: true,
          htmlWhitespaceSensitivity: 'ignore'
        }
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        }
      }
    }
  }
])
