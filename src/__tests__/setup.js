import { vi, afterEach } from 'vitest'
import { config } from '@vue/test-utils'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock naive-ui notification
vi.mock('naive-ui', async () => {
  const actual = await vi.importActual('naive-ui')
  return {
    ...actual,
    useNotification: () => ({
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    }),
  }
})

// Global stubs for naive-ui components
config.global.stubs = {
  NInput: true,
  NButton: true,
  NIcon: true,
  NForm: true,
  NFormItem: true,
  NSpace: true,
  NDataTable: true,
  NModal: true,
  NSelect: true,
  NDatePicker: true,
}

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReset()
  localStorageMock.setItem.mockReset()
  localStorageMock.removeItem.mockReset()
})
