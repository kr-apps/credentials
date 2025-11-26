import { configApp } from '@adonisjs/eslint-config'

export default [
  ...configApp(),
  {
    files: ['inertia/composables/**/*.ts'],
    rules: {
      '@unicorn/filename-case': [
        'error',
        {
          case: 'camelCase',
        },
      ],
    },
  },
]
