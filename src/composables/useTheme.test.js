import { describe, it, expect, vi, beforeEach } from 'vitest'
import { THEMES, getStoredTheme, setStoredTheme, createThemeConfig } from './useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('THEMES constant', () => {
    it('has LIGHT theme', () => {
      expect(THEMES.LIGHT).toBe('light')
    })

    it('has DARK theme', () => {
      expect(THEMES.DARK).toBe('dark')
    })
  })

  describe('getStoredTheme', () => {
    it('returns saved theme from localStorage when valid', () => {
      localStorage.getItem.mockReturnValue('dark')
      expect(getStoredTheme()).toBe('dark')
    })

    it('returns light when saved theme is light', () => {
      localStorage.getItem.mockReturnValue('light')
      expect(getStoredTheme()).toBe('light')
    })

    it('ignores invalid saved theme', () => {
      localStorage.getItem.mockReturnValue('invalid-theme')
      // Mock matchMedia to return false (light preference)
      window.matchMedia = vi.fn().mockReturnValue({ matches: false })
      expect(getStoredTheme()).toBe('light')
    })

    it('falls back to system dark preference when no saved theme', () => {
      localStorage.getItem.mockReturnValue(null)
      window.matchMedia = vi.fn().mockReturnValue({ matches: true })
      expect(getStoredTheme()).toBe('dark')
    })

    it('falls back to light when no saved theme and system prefers light', () => {
      localStorage.getItem.mockReturnValue(null)
      window.matchMedia = vi.fn().mockReturnValue({ matches: false })
      expect(getStoredTheme()).toBe('light')
    })
  })

  describe('setStoredTheme', () => {
    it('saves valid light theme', () => {
      const result = setStoredTheme('light')
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
    })

    it('saves valid dark theme', () => {
      const result = setStoredTheme('dark')
      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
    })

    it('rejects invalid theme', () => {
      const result = setStoredTheme('invalid')
      expect(result).toBe(false)
      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('rejects null theme', () => {
      const result = setStoredTheme(null)
      expect(result).toBe(false)
    })

    it('rejects undefined theme', () => {
      const result = setStoredTheme(undefined)
      expect(result).toBe(false)
    })
  })

  describe('createThemeConfig', () => {
    it('returns light as null by default', () => {
      const config = createThemeConfig({})
      expect(config[THEMES.LIGHT]).toBe(null)
    })

    it('includes provided theme mapping', () => {
      const darkTheme = { primaryColor: '#333' }
      const config = createThemeConfig({ [THEMES.DARK]: darkTheme })
      expect(config[THEMES.DARK]).toEqual(darkTheme)
    })

    it('preserves light null even with other themes', () => {
      const darkTheme = { primaryColor: '#333' }
      const config = createThemeConfig({ [THEMES.DARK]: darkTheme })
      expect(config[THEMES.LIGHT]).toBe(null)
    })

    it('allows overriding light theme', () => {
      const lightTheme = { primaryColor: '#fff' }
      const config = createThemeConfig({ [THEMES.LIGHT]: lightTheme })
      expect(config[THEMES.LIGHT]).toEqual(lightTheme)
    })

    it('handles empty config', () => {
      const config = createThemeConfig()
      expect(config[THEMES.LIGHT]).toBe(null)
    })
  })
})
