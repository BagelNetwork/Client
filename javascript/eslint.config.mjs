import globals from 'globals'
import pluginJs from '@eslint/js'

export default [
  {
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.jest  // Add Jest globals
      }
    },
    ignores: ['bagelDB.test.js']  // Ignore bagelDB.test.js
  },
  pluginJs.configs.recommended,
  {
    files: ['**/*.js'],
    rules: {
      // You can add any specific rules here if needed
    }
  }
]