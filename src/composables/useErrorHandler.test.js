import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useErrorHandler } from './useErrorHandler'

// Mock dependencies
const mockPush = vi.fn()
const mockNotification = {
  error: vi.fn(),
  warning: vi.fn(),
  success: vi.fn(),
  info: vi.fn(),
}

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('naive-ui', () => ({
  useNotification: () => mockNotification,
}))

vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}))

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('handleError', () => {
    it('handles 401 errors by redirecting to login', () => {
      const { handleError } = useErrorHandler()
      const error = { response: { status: 401 } }

      handleError(error)

      expect(mockNotification.warning).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Session Expired',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('skips redirect on 401 when skipLogout is true', () => {
      const { handleError } = useErrorHandler()
      const error = { response: { status: 401 } }

      handleError(error, { skipLogout: true })

      expect(mockNotification.warning).not.toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('handles 403 errors with access denied notification', () => {
      const { handleError } = useErrorHandler()
      const error = { response: { status: 403 } }

      handleError(error)

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Access Denied',
          content: 'You do not have permission to perform this action.',
        })
      )
    })

    it('handles 404 errors with not found notification', () => {
      const { handleError } = useErrorHandler()
      const error = { response: { status: 404, data: { message: 'User not found' } } }

      handleError(error)

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Not Found',
          content: 'User not found',
        })
      )
    })

    it('handles 404 with default message when none provided', () => {
      const { handleError } = useErrorHandler()
      const error = { response: { status: 404 } }

      handleError(error)

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Not Found',
          content: 'The requested resource was not found.',
        })
      )
    })

    it('handles 500 errors with server error notification', () => {
      const { handleError } = useErrorHandler()
      const error = { response: { status: 500, data: { message: 'Internal error' } } }

      handleError(error)

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Server Error',
          content: 'Internal error',
        })
      )
    })

    it('handles 502 errors as server errors', () => {
      const { handleError } = useErrorHandler()
      const error = { response: { status: 502 } }

      handleError(error)

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Server Error',
        })
      )
    })

    it('handles 503 errors as server errors', () => {
      const { handleError } = useErrorHandler()
      const error = { response: { status: 503 } }

      handleError(error)

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Server Error',
        })
      )
    })

    it('handles network errors without response', () => {
      const { handleError } = useErrorHandler()
      const error = { message: 'Network Error' }

      handleError(error)

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Network Error',
        })
      )
    })

    it('handles generic errors with custom message', () => {
      const { handleError } = useErrorHandler()
      const error = { response: { status: 418, data: { message: 'I am a teapot' } } }

      handleError(error)

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          content: 'I am a teapot',
        })
      )
    })

    it('handles 408 timeout errors with retry', () => {
      const { handleError } = useErrorHandler()
      const retryFn = vi.fn()
      const error = { response: { status: 408 } }

      handleError(error, { retryFn, retryKey: 'timeout-test' })

      vi.runAllTimers()
      expect(retryFn).toHaveBeenCalled()
    })

    it('passes retry function to network error handler', () => {
      const { handleError } = useErrorHandler()
      const retryFn = vi.fn()
      const error = { message: 'Network Error' }

      handleError(error, { retryFn, retryKey: 'network-test' })

      vi.runAllTimers()
      expect(retryFn).toHaveBeenCalled()
    })
  })

  describe('handle401', () => {
    it('shows warning and redirects to login', () => {
      const { handle401 } = useErrorHandler()

      handle401()

      expect(mockNotification.warning).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Session Expired',
        })
      )
      expect(mockPush).toHaveBeenCalledWith('/login')
    })

    it('does nothing when skipLogout is true', () => {
      const { handle401 } = useErrorHandler()

      handle401(true)

      expect(mockNotification.warning).not.toHaveBeenCalled()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('handle403', () => {
    it('shows access denied notification', () => {
      const { handle403 } = useErrorHandler()

      handle403()

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Access Denied',
          content: 'You do not have permission to perform this action.',
        })
      )
    })
  })

  describe('handle404', () => {
    it('shows not found notification with provided message', () => {
      const { handle404 } = useErrorHandler()

      handle404('Custom not found')

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Not Found',
          content: 'Custom not found',
        })
      )
    })

    it('shows default message when none provided', () => {
      const { handle404 } = useErrorHandler()

      handle404()

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Not Found',
          content: 'The requested resource was not found.',
        })
      )
    })
  })

  describe('handle500', () => {
    it('shows server error notification with provided message', () => {
      const { handle500 } = useErrorHandler()

      handle500('Database connection failed')

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Server Error',
          content: 'Database connection failed',
        })
      )
    })

    it('shows default message when none provided', () => {
      const { handle500 } = useErrorHandler()

      handle500()

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Something went wrong on our end. Please try again later.',
        })
      )
    })
  })

  describe('handleNetworkError', () => {
    it('shows notification when no retry function', () => {
      const { handleNetworkError } = useErrorHandler()

      handleNetworkError()

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Network Error',
          content: 'Unable to connect to the server. Please check your internet connection.',
        })
      )
    })

    it('triggers retry when retry function provided', () => {
      const { handleNetworkError } = useErrorHandler()
      const retryFn = vi.fn()

      handleNetworkError(retryFn, 'test-key')

      vi.runAllTimers()
      expect(retryFn).toHaveBeenCalled()
    })
  })

  describe('handleTimeout', () => {
    it('shows warning when no retry function', () => {
      const { handleTimeout } = useErrorHandler()

      handleTimeout()

      expect(mockNotification.warning).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Request Timeout',
          content: 'The request took too long to complete. Please try again.',
        })
      )
    })

    it('triggers retry when retry function provided', () => {
      const { handleTimeout } = useErrorHandler()
      const retryFn = vi.fn()

      handleTimeout(retryFn, 'timeout-key')

      vi.runAllTimers()
      expect(retryFn).toHaveBeenCalled()
    })
  })

  describe('handleGenericError', () => {
    it('shows error notification with provided message', () => {
      const { handleGenericError } = useErrorHandler()

      handleGenericError('Something unexpected happened')

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          content: 'Something unexpected happened',
        })
      )
    })

    it('shows default message when none provided', () => {
      const { handleGenericError } = useErrorHandler()

      handleGenericError()

      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'An unexpected error occurred. Please try again.',
        })
      )
    })
  })

  describe('showSuccess', () => {
    it('shows success notification', () => {
      const { showSuccess } = useErrorHandler()

      showSuccess('Success!', 'Operation completed')

      expect(mockNotification.success).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success!',
          content: 'Operation completed',
        })
      )
    })

    it('uses default duration of 3000', () => {
      const { showSuccess } = useErrorHandler()

      showSuccess('Title', 'Content')

      expect(mockNotification.success).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 3000,
        })
      )
    })

    it('accepts custom duration', () => {
      const { showSuccess } = useErrorHandler()

      showSuccess('Title', 'Content', 5000)

      expect(mockNotification.success).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 5000,
        })
      )
    })
  })

  describe('showInfo', () => {
    it('shows info notification', () => {
      const { showInfo } = useErrorHandler()

      showInfo('Info', 'Something to know')

      expect(mockNotification.info).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Info',
          content: 'Something to know',
        })
      )
    })

    it('uses default duration of 4000', () => {
      const { showInfo } = useErrorHandler()

      showInfo('Title', 'Content')

      expect(mockNotification.info).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 4000,
        })
      )
    })

    it('accepts custom duration', () => {
      const { showInfo } = useErrorHandler()

      showInfo('Title', 'Content', 5000)

      expect(mockNotification.info).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 5000,
        })
      )
    })
  })

  describe('retry mechanism', () => {
    it('schedules retry with delay', () => {
      const { handleNetworkError } = useErrorHandler()
      const retryFn = vi.fn()

      handleNetworkError(retryFn, 'test-key-1')

      expect(retryFn).not.toHaveBeenCalled()

      vi.runAllTimers()
      expect(retryFn).toHaveBeenCalledTimes(1)
    })

    it('executes retries with exponential backoff before showing final error', () => {
      const { handleNetworkError } = useErrorHandler()
      const retryFn = vi.fn()
      const retryKey = 'backoff-test'

      // Each handleNetworkError call increments the counter immediately
      // but schedules the retry via setTimeout with exponential delays [0, 2000, 5000]ms

      // Call 1: counter 0->1, schedules retry with 0ms delay
      handleNetworkError(retryFn, retryKey)
      // Call 2: counter 1->2, schedules retry with 2000ms delay
      handleNetworkError(retryFn, retryKey)
      // Call 3: counter 2->3, schedules retry with 5000ms delay
      handleNetworkError(retryFn, retryKey)

      // Retries not executed yet - all scheduled as timers
      expect(retryFn).not.toHaveBeenCalled()

      // Call 4: counter is 3 (>= MAX_RETRIES), shows error, no retry scheduled
      handleNetworkError(retryFn, retryKey)
      expect(mockNotification.error).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Network Error' })
      )

      // Now run all scheduled timers - should execute the 3 scheduled retries
      vi.runAllTimers()
      expect(retryFn).toHaveBeenCalledTimes(3)
    })
  })
})
