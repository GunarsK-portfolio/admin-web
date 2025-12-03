import { describe, it, expect } from 'vitest'
import {
  required,
  requiredNumber,
  email,
  url,
  isValidHttpUrl,
  hexColor,
  dateAfter,
  validateRequired,
  normalizeString,
} from './validation'

describe('validation utilities', () => {
  describe('required', () => {
    it('creates rule with default trigger', () => {
      const rule = required('Name')
      expect(rule.required).toBe(true)
      expect(rule.message).toBe('Name is required')
      expect(rule.trigger).toBe('blur')
    })

    it('creates rule with custom trigger', () => {
      const rule = required('Email', 'change')
      expect(rule.trigger).toBe('change')
    })
  })

  describe('requiredNumber', () => {
    it('creates number rule with default trigger', () => {
      const rule = requiredNumber('Age')
      expect(rule.required).toBe(true)
      expect(rule.type).toBe('number')
      expect(rule.message).toBe('Age is required')
      expect(rule.trigger).toBe('change')
    })
  })

  describe('email', () => {
    it('validates correct email addresses', () => {
      const rule = email()
      expect(rule.pattern.test('user@example.com')).toBe(true)
      expect(rule.pattern.test('user.name@domain.co.uk')).toBe(true)
      expect(rule.pattern.test('user+tag@example.com')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      const rule = email()
      expect(rule.pattern.test('invalid')).toBe(false)
      expect(rule.pattern.test('@domain.com')).toBe(false)
      expect(rule.pattern.test('user@')).toBe(false)
      expect(rule.pattern.test('user@domain')).toBe(false)
    })
  })

  describe('url', () => {
    it('validates http/https URLs', () => {
      const rule = url()
      expect(rule.validator(null, 'https://example.com')).toBe(true)
      expect(rule.validator(null, 'http://example.com/path')).toBe(true)
    })

    it('allows empty values', () => {
      const rule = url()
      expect(rule.validator(null, '')).toBe(true)
      expect(rule.validator(null, null)).toBe(true)
    })

    it('rejects invalid URLs', () => {
      const rule = url()
      expect(rule.validator(null, 'not-a-url')).toBeInstanceOf(Error)
    })

    it('rejects disallowed protocols', () => {
      const rule = url()
      expect(rule.validator(null, 'ftp://example.com')).toBeInstanceOf(Error)
      expect(rule.validator(null, 'javascript:alert(1)')).toBeInstanceOf(Error)
    })

    it('supports custom protocols', () => {
      const rule = url({ protocols: ['ftp:'] })
      expect(rule.validator(null, 'ftp://files.example.com')).toBe(true)
      expect(rule.validator(null, 'https://example.com')).toBeInstanceOf(Error)
    })
  })

  describe('isValidHttpUrl', () => {
    it('returns true for valid HTTP/HTTPS URLs', () => {
      expect(isValidHttpUrl('https://example.com')).toBe(true)
      expect(isValidHttpUrl('http://localhost:3000')).toBe(true)
      expect(isValidHttpUrl('https://sub.domain.com/path?query=1')).toBe(true)
    })

    it('returns false for invalid URLs', () => {
      expect(isValidHttpUrl('')).toBe(false)
      expect(isValidHttpUrl(null)).toBe(false)
      expect(isValidHttpUrl('not-a-url')).toBe(false)
      expect(isValidHttpUrl('ftp://example.com')).toBe(false)
    })
  })

  describe('hexColor', () => {
    it('validates 6-digit hex colors', () => {
      const rule = hexColor()
      expect(rule.pattern.test('#FF5733')).toBe(true)
      expect(rule.pattern.test('#000000')).toBe(true)
      expect(rule.pattern.test('#ffffff')).toBe(true)
    })

    it('validates 3-digit hex colors', () => {
      const rule = hexColor()
      expect(rule.pattern.test('#F57')).toBe(true)
      expect(rule.pattern.test('#abc')).toBe(true)
    })

    it('rejects invalid hex colors', () => {
      const rule = hexColor()
      expect(rule.pattern.test('FF5733')).toBe(false) // missing #
      expect(rule.pattern.test('#GGG')).toBe(false) // invalid chars
      expect(rule.pattern.test('#12345')).toBe(false) // wrong length
    })
  })

  describe('dateAfter', () => {
    it('passes when end date is after start date (full date)', () => {
      const rule = dateAfter(() => '2024-01-01')
      expect(rule.validator(null, '2024-06-01')).toBe(true)
    })

    it('passes when end date equals start date', () => {
      const rule = dateAfter(() => '2024-01-01')
      expect(rule.validator(null, '2024-01-01')).toBe(true)
    })

    it('fails when end date is before start date', () => {
      const rule = dateAfter(() => '2024-06-01')
      expect(rule.validator(null, '2024-01-01')).toBeInstanceOf(Error)
    })

    it('handles month format (yyyy-MM)', () => {
      const rule = dateAfter(() => '2024-01')
      expect(rule.validator(null, '2024-06')).toBe(true)
      expect(rule.validator(null, '2023-12')).toBeInstanceOf(Error)
    })

    it('allows empty values', () => {
      const rule = dateAfter(() => '2024-01-01')
      expect(rule.validator(null, null)).toBe(true)
      expect(rule.validator(null, '')).toBe(true)
    })

    it('allows when start date is empty', () => {
      const rule = dateAfter(() => null)
      expect(rule.validator(null, '2024-01-01')).toBe(true)
    })
  })

  describe('validateRequired', () => {
    it('throws for null/undefined values', () => {
      expect(() => validateRequired(null, 'ID')).toThrow('ID is required')
      expect(() => validateRequired(undefined, 'ID')).toThrow('ID is required')
    })

    it('throws for empty strings', () => {
      expect(() => validateRequired('', 'Name')).toThrow('Name is required')
      expect(() => validateRequired('  ', 'Name')).toThrow('Name is required')
    })

    it('allows valid values', () => {
      expect(() => validateRequired('value')).not.toThrow()
      expect(() => validateRequired(0)).not.toThrow()
      expect(() => validateRequired(false)).not.toThrow()
      expect(() => validateRequired([])).not.toThrow()
    })

    describe('type validation', () => {
      it('validates string type', () => {
        expect(() => validateRequired('test', 'Field', { type: 'string' })).not.toThrow()
        expect(() => validateRequired('', 'Field', { type: 'string' })).toThrow(
          'must be a non-empty string'
        )
        expect(() => validateRequired(123, 'Field', { type: 'string' })).toThrow(
          'must be a non-empty string'
        )
      })

      it('validates number type', () => {
        expect(() => validateRequired(42, 'Field', { type: 'number' })).not.toThrow()
        expect(() => validateRequired(0, 'Field', { type: 'number' })).not.toThrow()
        expect(() => validateRequired(NaN, 'Field', { type: 'number' })).toThrow(
          'must be a valid number'
        )
        expect(() => validateRequired('42', 'Field', { type: 'number' })).toThrow(
          'must be a valid number'
        )
      })

      it('validates object type', () => {
        expect(() => validateRequired({}, 'Field', { type: 'object' })).not.toThrow()
        expect(() => validateRequired({ a: 1 }, 'Field', { type: 'object' })).not.toThrow()
        expect(() => validateRequired([], 'Field', { type: 'object' })).toThrow(
          'must be a valid object'
        )
      })

      it('validates array type', () => {
        expect(() => validateRequired([], 'Field', { type: 'array' })).not.toThrow()
        expect(() => validateRequired([1, 2], 'Field', { type: 'array' })).not.toThrow()
        expect(() => validateRequired({}, 'Field', { type: 'array' })).toThrow('must be an array')
      })
    })
  })

  describe('normalizeString', () => {
    it('converts to lowercase', () => {
      expect(normalizeString('HELLO')).toBe('hello')
      expect(normalizeString('MiXeD')).toBe('mixed')
    })

    it('handles null/undefined', () => {
      expect(normalizeString(null)).toBe('')
      expect(normalizeString(undefined)).toBe('')
    })

    it('converts numbers to strings', () => {
      expect(normalizeString(123)).toBe('123')
      expect(normalizeString(0)).toBe('0')
    })
  })
})
