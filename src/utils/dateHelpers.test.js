import { describe, it, expect } from 'vitest'
import { toMonthFormat, fromMonthFormat, toDateFormat, toDateTimeFormat } from './dateHelpers'

describe('dateHelpers', () => {
  describe('toMonthFormat', () => {
    it('converts yyyy-MM-dd to yyyy-MM', () => {
      expect(toMonthFormat('2024-06-15')).toBe('2024-06')
      expect(toMonthFormat('2023-01-01')).toBe('2023-01')
      expect(toMonthFormat('2025-12-31')).toBe('2025-12')
    })

    it('handles already formatted month strings', () => {
      expect(toMonthFormat('2024-06')).toBe('2024-06')
    })

    it('returns null for invalid inputs', () => {
      expect(toMonthFormat(null)).toBe(null)
      expect(toMonthFormat('')).toBe(null)
      expect(toMonthFormat('invalid')).toBe(null)
      expect(toMonthFormat('2024-13')).toBe(null) // invalid month
      expect(toMonthFormat('2024-00')).toBe(null) // invalid month
    })

    it('returns null for non-string inputs', () => {
      expect(toMonthFormat(123)).toBe(null)
      expect(toMonthFormat({})).toBe(null)
    })
  })

  describe('fromMonthFormat', () => {
    it('converts yyyy-MM to yyyy-MM-dd (first day)', () => {
      expect(fromMonthFormat('2024-06')).toBe('2024-06-01')
      expect(fromMonthFormat('2023-01')).toBe('2023-01-01')
      expect(fromMonthFormat('2025-12')).toBe('2025-12-01')
    })

    it('returns null for invalid inputs', () => {
      expect(fromMonthFormat(null)).toBe(null)
      expect(fromMonthFormat('')).toBe(null)
      expect(fromMonthFormat('invalid')).toBe(null)
      expect(fromMonthFormat('2024-6')).toBe(null) // single digit month
      expect(fromMonthFormat('2024-13')).toBe(null) // invalid month
    })

    it('returns null for non-string inputs', () => {
      expect(fromMonthFormat(123)).toBe(null)
      expect(fromMonthFormat({})).toBe(null)
    })
  })

  describe('toDateFormat', () => {
    it('extracts date from full timestamp', () => {
      expect(toDateFormat('2024-06-15T10:30:00Z')).toBe('2024-06-15')
      expect(toDateFormat('2024-06-15 10:30:00')).toBe('2024-06-15')
    })

    it('handles plain date strings', () => {
      expect(toDateFormat('2024-06-15')).toBe('2024-06-15')
      expect(toDateFormat('2024-01-01')).toBe('2024-01-01')
    })

    it('returns default value for null/empty', () => {
      expect(toDateFormat(null)).toBe(null)
      expect(toDateFormat('')).toBe(null)
      expect(toDateFormat(null, 'N/A')).toBe('N/A')
    })

    it('returns default value for invalid formats', () => {
      expect(toDateFormat('invalid')).toBe(null)
      expect(toDateFormat('2024-13-01')).toBe(null) // invalid month
      expect(toDateFormat('2024-01-32')).toBe(null) // invalid day
    })
  })

  describe('toDateTimeFormat', () => {
    it('formats date objects', () => {
      const date = new Date('2024-06-15T10:30:00Z')
      const result = toDateTimeFormat(date)
      // Result format depends on locale, just check it's not the default
      expect(result).not.toBe('—')
      expect(typeof result).toBe('string')
    })

    it('formats date strings', () => {
      const result = toDateTimeFormat('2024-06-15T10:30:00Z')
      expect(result).not.toBe('—')
      expect(typeof result).toBe('string')
    })

    it('returns default for null/undefined', () => {
      expect(toDateTimeFormat(null)).toBe('—')
      expect(toDateTimeFormat(undefined)).toBe('—')
      expect(toDateTimeFormat('')).toBe('—')
    })

    it('returns default for invalid dates', () => {
      expect(toDateTimeFormat('invalid-date')).toBe('—')
    })

    it('allows custom default value', () => {
      expect(toDateTimeFormat(null, 'N/A')).toBe('N/A')
      expect(toDateTimeFormat('invalid', 'No date')).toBe('No date')
    })
  })
})
