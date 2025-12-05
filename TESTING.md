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

16 test files, 219 tests

| File                   | Tests | Coverage                                                         |
| ---------------------- | ----- | ---------------------------------------------------------------- |
| `validation.test.js`   | 31    | required, email, url, hexColor, dateAfter                        |
| `crudHelpers.test.js`  | 27    | createDataLoader, createSaveHandler, deleteHandler               |
| `fileHelpers.test.js`  | 25    | convertToWebP, blobToWebPFile, formatFileSize, validateFile      |
| `tableHelpers.test.js` | 21    | stringSorter, numberSorter, dateSorter, dateRange                |
| `useTheme.test.js`     | 17    | getStoredTheme, setStoredTheme, createThemeConfig                |
| `dateHelpers.test.js`  | 16    | toMonthFormat, fromMonthFormat, toDateFormat                     |
| `useModal.test.js`     | 14    | openModal, closeModal, openEditModal, resetForm                  |
| `Login.test.js`        | 11    | initial state, handleLogin, form state management                |
| `tokenRefresh.test.js` | 11    | refreshToken, 401 interceptor, request queueing, duplicate guard |
| `ModalFooter.test.js`  | 9     | default props, editing states, events, loading                   |
| `auth.test.js`         | 9     | login/logout, checkAuthStatus, cookie-based auth flow            |
| `BackToTop.test.js`    | 8     | scroll behavior, scrollToTop, lifecycle hooks                    |
| `BackButton.test.js`   | 6     | default props, custom props, route objects                       |
| `useDataState.test.js` | 6     | initial state, reactivity, loading flow                          |
| `SearchInput.test.js`  | 4     | default props, custom props, emits                               |
| `AddButton.test.js`    | 4     | label prop, click event, component rendering                     |

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

### Mocking Browser APIs (Image, Canvas)

For image processing tests, jsdom doesn't support actual image loading or canvas
operations. Use mocks:

```javascript
// Mock Image class - must be constructor function, not arrow function
window.Image = function () {
  this.width = 100
  this.height = 100
  this.onload = null
  const self = this
  Object.defineProperty(this, 'src', {
    set() {
      setTimeout(() => self.onload?.(), 0)
    },
  })
}

// Mock Canvas
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => ({ drawImage: vi.fn() })),
  toBlob: vi.fn((callback) => callback(new Blob(['mock'], { type: 'image/webp' }))),
}
vi.spyOn(document, 'createElement').mockImplementation((tag) => {
  if (tag === 'canvas') return mockCanvas
  return document.createElement(tag)
})
```

## Test Categories

### Utility Functions (`src/utils/`)

- Validation rules (required, email, url, hex colors, dateAfter)
- Date formatting and parsing (toMonthFormat, fromMonthFormat, toDateFormat)
- CRUD helpers (createDataLoader, createSaveHandler, createDeleteHandler)
- Table helpers (string/number/date sorters, date range renderer)
- File helpers (WebP conversion, file size formatting, file validation)
- String normalization

### Composables (`src/composables/`)

- `useModal` - Modal state and form management
- `useDataState` - List view data state
- `useTheme` - Theme detection, storage, and configuration

### Services (`src/services/`)

- `tokenRefresh` - Token refresh mechanism, 401 interceptor, request queueing

### Stores (`src/stores/`)

- `auth` - Authentication state, login/logout flows

### Views (`src/views/`)

- `Login` - Login form, authentication handling

### Components (`src/components/`)

- `SearchInput` - Search input with v-model
- `AddButton` - Button for adding new items
- `BackButton` - Navigation back button
- `BackToTop` - Scroll-to-top button
- `ModalFooter` - Modal save/cancel actions

## Test Structure

```text
src/
├── __tests__/
│   └── setup.js              # Global test setup
├── utils/
│   ├── validation.test.js
│   ├── dateHelpers.test.js
│   ├── crudHelpers.test.js
│   ├── tableHelpers.test.js
│   └── fileHelpers.test.js   # WebP conversion, file validation
├── composables/
│   ├── useModal.test.js
│   ├── useDataState.test.js
│   └── useTheme.test.js
├── services/
│   └── tokenRefresh.test.js  # Token refresh, 401 interceptor
├── stores/
│   └── auth.test.js
├── views/
│   └── Login.test.js
└── components/
    └── shared/
        ├── SearchInput.test.js
        ├── AddButton.test.js
        ├── BackButton.test.js
        ├── BackToTop.test.js
        └── ModalFooter.test.js
```

## Contributing Tests

1. Follow naming: `<filename>.test.js` next to source file
2. Use descriptive `describe` and `it` blocks
3. Mock external dependencies (localStorage, router, services)
4. Test both success and error scenarios
5. Verify with: `npm test`
