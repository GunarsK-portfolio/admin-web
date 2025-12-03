# Testing Guide

## Overview

The admin-web uses Vitest with Vue Test Utils for unit testing Vue 3 components,
composables, stores, and utility functions.

## Quick Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Using task runner
task test
task test:watch
task test:coverage
```

## Test Files

6 test files, 78 tests

| File                   | Tests | Coverage                                     |
| ---------------------- | ----- | -------------------------------------------- |
| `validation.test.js`   | 31    | required, email, url, hexColor, dateAfter    |
| `dateHelpers.test.js`  | 16    | toMonthFormat, fromMonthFormat, toDateFormat |
| `useModal.test.js`     | 14    | openModal, closeModal, openEditModal         |
| `auth.test.js`         | 7     | login/logout success/failure, initial state  |
| `useDataState.test.js` | 6     | initial state, reactivity, loading flow      |
| `SearchInput.test.js`  | 4     | default props, custom props, emits           |

## Key Testing Patterns

### Mock Setup

Global test setup in `src/__tests__/setup.js`

```javascript
// localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Naive UI component stubs
config.global.stubs = {
  NInput: true,
  NButton: true,
  // ...
}
```

### Pinia Store Testing

Create fresh store per test

```javascript
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())
})
```

### Vue Component Testing

Mount with stubs

```javascript
const wrapper = mount(SearchInput, {
  props: { modelValue: 'test' },
  global: {
    stubs: { NInput: true, NIcon: true },
  },
})
```

### Composable Testing

Direct function calls

```javascript
const { form, openModal, closeModal } = useModal(defaultValues)
openModal()
expect(form.value).toEqual(defaultValues)
```

## Test Categories

### Utility Functions (`src/utils/`)

- Validation rules (required, email, url, hex colors)
- Date formatting and parsing
- String normalization

### Composables (`src/composables/`)

- `useModal` - Modal state and form management
- `useDataState` - List view data state

### Stores (`src/stores/`)

- `auth` - Authentication state, login/logout flows

### Components (`src/components/`)

- Shared components with props and emits

## Test Structure

```text
src/
├── __tests__/
│   └── setup.js           # Global test setup
├── utils/
│   ├── validation.test.js
│   └── dateHelpers.test.js
├── composables/
│   ├── useModal.test.js
│   └── useDataState.test.js
├── stores/
│   └── auth.test.js
└── components/
    └── shared/
        └── SearchInput.test.js
```

## Contributing Tests

1. Follow naming: `<filename>.test.js` next to source file
2. Use descriptive `describe` and `it` blocks
3. Mock external dependencies (localStorage, router, services)
4. Test both success and error scenarios
5. Verify with: `npm test`
