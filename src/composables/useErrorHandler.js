import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotification } from 'naive-ui'

/**
 * Centralized error handling composable for admin panel
 * Handles different types of errors with appropriate UI responses
 *
 * Usage:
 * const { handleError } = useErrorHandler()
 * catch (error) { handleError(error) }
 */
export function useErrorHandler() {
  const router = useRouter()
  const notification = useNotification()

  // Track retry attempts per request to prevent infinite loops
  const retryAttempts = ref(new Map())
  const MAX_RETRIES = 3

  /**
   * Automatic retry with exponential backoff
   * Delays: 0ms (immediate), 2000ms (2s), 5000ms (5s)
   * Shows notification only on final failure to avoid notification spam
   */
  const createAutoRetry = (retryFn, retryKey, errorContext = {}) => {
    if (!retryFn) return

    const attempts = retryAttempts.value.get(retryKey) || 0

    if (attempts >= MAX_RETRIES) {
      // Show error notification only on final failure with context-specific message
      const { title, message } = errorContext
      notification.error({
        title: title || 'Request Failed',
        content:
          message ||
          `Unable to complete request after ${MAX_RETRIES} attempts. Please refresh the page and try again.`,
        duration: 10000,
        closable: true,
      })
      // Reset attempts after showing final error
      retryAttempts.value.delete(retryKey)
      return
    }

    // Calculate delay: 0ms (immediate), 2000ms, 5000ms
    const delays = [0, 2000, 5000]
    const delay = delays[attempts] || 5000

    // Increment retry count
    retryAttempts.value.set(retryKey, attempts + 1)

    // Automatically retry after delay
    setTimeout(() => {
      retryFn()
      // Reset counter after successful completion
      setTimeout(() => {
        retryAttempts.value.delete(retryKey)
      }, 5000)
    }, delay)
  }

  /**
   * Main error handler - routes to appropriate handler based on error type
   */
  const handleError = (error, context = {}) => {
    console.error('Error occurred:', error, context)

    // Extract error info
    const status = error.response?.status || error.status
    const message = error.response?.data?.message || error.message

    // Create a unique key for retry tracking
    const retryKey = context.retryKey || `${Date.now()}-${Math.random()}`

    // Route to appropriate handler
    switch (status) {
      case 401:
        handle401(context.skipLogout)
        break
      case 403:
        handle403()
        break
      case 404:
        handle404(message)
        break
      case 500:
      case 502:
      case 503:
        handle500(message)
        break
      case 408: // Timeout
        handleTimeout(context.retryFn, retryKey)
        break
      default:
        // Network error or unknown error
        if (!error.response) {
          handleNetworkError(context.retryFn, retryKey)
        } else {
          handleGenericError(message)
        }
    }
  }

  /**
   * 401 - Unauthorized
   * Redirect to login (token expired or invalid)
   */
  const handle401 = (skipLogout = false) => {
    if (!skipLogout) {
      notification.warning({
        title: 'Session Expired',
        content: 'Your session has expired. Please log in again.',
        duration: 5000,
      })
      // Let auth store handle logout and redirect
      router.push('/login')
    }
  }

  /**
   * 403 - Forbidden
   * Show notification (user doesn't have permission)
   */
  const handle403 = () => {
    notification.error({
      title: 'Access Denied',
      content: 'You do not have permission to perform this action.',
      duration: 5000,
      closable: true,
    })
  }

  /**
   * 404 - Not Found
   * Show error notification
   */
  const handle404 = (message) => {
    notification.error({
      title: 'Not Found',
      content: message || 'The requested resource was not found.',
      duration: 5000,
      closable: true,
    })
  }

  /**
   * 500 - Server Error
   * Show error notification with retry option
   */
  const handle500 = (message) => {
    notification.error({
      title: 'Server Error',
      content: message || 'Something went wrong on our end. Please try again later.',
      duration: 8000,
      closable: true,
    })
  }

  /**
   * Network Error
   * Automatically retries with exponential backoff (max 3 attempts)
   * Shows notification only on final failure
   */
  const handleNetworkError = (retryFn, retryKey) => {
    if (retryFn) {
      // Trigger automatic retry with network-specific error message
      createAutoRetry(retryFn, retryKey, {
        title: 'Network Error',
        message:
          'Unable to connect to the server after 3 attempts. Please check your internet connection and refresh the page.',
      })
    } else {
      // No retry function provided, just show error
      notification.error({
        title: 'Network Error',
        content: 'Unable to connect to the server. Please check your internet connection.',
        duration: 8000,
        closable: true,
      })
    }
  }

  /**
   * Timeout Error
   * Automatically retries with exponential backoff (max 3 attempts)
   * Shows notification only on final failure
   */
  const handleTimeout = (retryFn, retryKey) => {
    if (retryFn) {
      // Trigger automatic retry with timeout-specific error message
      createAutoRetry(retryFn, retryKey, {
        title: 'Request Timeout',
        message:
          'The request took too long to complete after 3 attempts. Please check your connection and try again.',
      })
    } else {
      // No retry function provided, just show warning
      notification.warning({
        title: 'Request Timeout',
        content: 'The request took too long to complete. Please try again.',
        duration: 6000,
        closable: true,
      })
    }
  }

  /**
   * Generic Error
   * Show error notification with custom message
   */
  const handleGenericError = (message) => {
    notification.error({
      title: 'Error',
      content: message || 'An unexpected error occurred. Please try again.',
      duration: 6000,
      closable: true,
    })
  }

  /**
   * Success notification helper
   */
  const showSuccess = (title, content, duration = 3000) => {
    notification.success({
      title,
      content,
      duration,
    })
  }

  /**
   * Info notification helper
   */
  const showInfo = (title, content, duration = 4000) => {
    notification.info({
      title,
      content,
      duration,
    })
  }

  return {
    handleError,
    handle401,
    handle403,
    handle404,
    handle500,
    handleNetworkError,
    handleTimeout,
    handleGenericError,
    showSuccess,
    showInfo,
  }
}
