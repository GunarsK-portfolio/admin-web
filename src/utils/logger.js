import pino from 'pino'

/**
 * Structured logger for admin-web using pino
 *
 * Features:
 * - Structured JSON logging
 * - Log levels: trace, debug, info, warn, error, fatal
 * - Context enrichment (user, session, request info)
 * - Pretty printing in development
 * - Production-ready for sending to backend
 *
 * Usage:
 * import { logger } from '@/utils/logger'
 *
 * logger.info('User logged in', { userId: 123 })
 * logger.error('API request failed', { error, endpoint: '/api/profile' })
 * logger.warn('Token expiring soon', { ttl: 60 })
 */

// Determine log level based on environment
const getLogLevel = () => {
  if (import.meta.env.DEV) return 'debug'
  if (import.meta.env.PROD) return 'info'
  return 'info'
}

// Browser transport with pretty printing in development
const browserTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'HH:MM:ss',
    ignore: 'pid,hostname',
  },
}

// Create base logger
const baseLogger = pino({
  level: getLogLevel(),
  browser: {
    asObject: true,
    // Use pretty printing in development, JSON in production
    ...(import.meta.env.DEV ? browserTransport : {}),
  },
  base: {
    app: 'admin-web',
    env: import.meta.env.MODE,
  },
})

/**
 * Enhanced logger with context support
 */
class Logger {
  constructor(pinoInstance) {
    this.pino = pinoInstance
    this.context = {}
  }

  /**
   * Set global context that will be included in all logs
   */
  setContext(context) {
    this.context = { ...this.context, ...context }
  }

  /**
   * Clear specific context keys or all context
   */
  clearContext(keys = null) {
    if (!keys) {
      this.context = {}
    } else if (Array.isArray(keys)) {
      keys.forEach((key) => delete this.context[key])
    } else {
      delete this.context[keys]
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(bindings) {
    const childLogger = new Logger(this.pino.child(bindings))
    childLogger.context = { ...this.context }
    return childLogger
  }

  /**
   * Merge context with log data
   */
  _mergeContext(data = {}) {
    return { ...this.context, ...data }
  }

  /**
   * Log methods
   */
  trace(msg, data) {
    this.pino.trace(this._mergeContext(data), msg)
  }

  debug(msg, data) {
    this.pino.debug(this._mergeContext(data), msg)
  }

  info(msg, data) {
    this.pino.info(this._mergeContext(data), msg)
  }

  warn(msg, data) {
    this.pino.warn(this._mergeContext(data), msg)
  }

  error(msg, data) {
    // If data is an Error object, extract stack trace
    if (data instanceof Error) {
      this.pino.error(
        this._mergeContext({
          error: {
            message: data.message,
            stack: data.stack,
            name: data.name,
          },
        }),
        msg
      )
    } else {
      this.pino.error(this._mergeContext(data), msg)
    }
  }

  fatal(msg, data) {
    this.pino.fatal(this._mergeContext(data), msg)
  }

  /**
   * Log HTTP request/response
   */
  logRequest(config, data = {}) {
    this.debug('HTTP Request', {
      ...data,
      http: {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: this._sanitizeHeaders(config.headers),
      },
    })
  }

  logResponse(response, data = {}) {
    this.debug('HTTP Response', {
      ...data,
      http: {
        status: response.status,
        statusText: response.statusText,
        url: response.config?.url,
        duration: response.config?.metadata?.duration,
      },
    })
  }

  logError(error, context = {}) {
    const errorData = {
      ...context,
      error: {
        message: error.message,
        stack: error.stack,
      },
    }

    if (error.response) {
      errorData.http = {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      }
    }

    this.error('Error occurred', errorData)
  }

  /**
   * Sanitize headers to remove sensitive information
   */
  _sanitizeHeaders(headers = {}) {
    const sanitized = { ...headers }
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key']

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]'
      }
    })

    return sanitized
  }
}

// Export singleton logger instance
export const logger = new Logger(baseLogger)

/**
 * Helper to set user context when user logs in
 */
export function setUserContext(user) {
  logger.setContext({
    user: {
      id: user.id,
      email: user.email,
      // Don't log sensitive fields
    },
  })
}

/**
 * Helper to clear user context when user logs out
 */
export function clearUserContext() {
  logger.clearContext(['user'])
}
