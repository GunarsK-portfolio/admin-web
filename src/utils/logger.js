import pino from 'pino'

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

class Logger {
  constructor(pinoInstance) {
    this.pino = pinoInstance
    this.context = {}
  }

  setContext(context) {
    this.context = { ...this.context, ...context }
  }

  clearContext(keys = null) {
    if (!keys) {
      this.context = {}
    } else if (Array.isArray(keys)) {
      keys.forEach((key) => delete this.context[key])
    } else {
      delete this.context[keys]
    }
  }

  child(bindings) {
    const childLogger = new Logger(this.pino.child(bindings))
    childLogger.context = { ...this.context }
    return childLogger
  }

  _mergeContext(data = {}) {
    return { ...this.context, ...data }
  }

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

export const logger = new Logger(baseLogger)

/**
 * Sets user context for logging
 * @param {Object} user - User object
 */
export function setUserContext(user) {
  logger.setContext({
    user: {
      id: user.id,
      email: user.email,
    },
  })
}

/**
 * Clears user context from logging
 */
export function clearUserContext() {
  logger.clearContext(['user'])
}
