import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  convertToWebP,
  blobToWebPFile,
  formatFileSize,
  FILE_VALIDATION,
  validateFile,
  createFileValidator,
} from './fileHelpers'

describe('fileHelpers', () => {
  /**
   * Tests for convertToWebP function
   * Uses mocked Image and Canvas since jsdom doesn't support actual image loading
   */
  describe('convertToWebP', () => {
    let originalImage
    let mockCanvas
    let mockContext
    let mockBlob

    beforeEach(() => {
      vi.clearAllMocks()

      // Store original Image constructor to restore later
      originalImage = window.Image

      // Create mock blob that simulates WebP conversion output
      mockBlob = new window.Blob(['mock'], { type: 'image/webp' })

      // Mock canvas 2D context with drawImage spy
      mockContext = {
        drawImage: vi.fn(),
      }

      // Mock canvas element with dimension tracking and toBlob callback
      mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
        toBlob: vi.fn((callback) => {
          callback(mockBlob)
        }),
      }

      // Intercept canvas creation to return our mock
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas
        }
        return document.createElement(tag)
      })

      // Mock Image class - must be a proper constructor function (not arrow function)
      // Simulates 100x100 image that triggers onload immediately when src is set
      window.Image = function () {
        this.width = 100
        this.height = 100
        this.onload = null
        this.onerror = null
        const self = this
        Object.defineProperty(this, 'src', {
          set() {
            setTimeout(() => self.onload?.(), 0)
          },
          get() {
            return ''
          },
        })
      }
    })

    afterEach(() => {
      window.Image = originalImage
      vi.restoreAllMocks()
    })

    // Skip conversion for files already in WebP format
    it('returns original file if already WebP', async () => {
      const webpFile = new window.File(['test'], 'test.webp', { type: 'image/webp' })
      const result = await convertToWebP(webpFile)
      expect(result).toBe(webpFile)
    })

    // Skip conversion for non-image files (PDFs, documents, etc.)
    it('returns original file if not an image', async () => {
      const pdfFile = new window.File(['test'], 'test.pdf', { type: 'application/pdf' })
      const result = await convertToWebP(pdfFile)
      expect(result).toBe(pdfFile)
    })

    // Verify JPEG files are converted to WebP with default quality
    it('converts JPEG to WebP', async () => {
      const jpegFile = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' })

      const result = await convertToWebP(jpegFile)

      expect(result).toBeInstanceOf(window.Blob)
      expect(result.type).toBe('image/webp')
      expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.85)
    })

    // Verify PNG files are converted to WebP
    it('converts PNG to WebP', async () => {
      const pngFile = new window.File(['test'], 'test.png', { type: 'image/png' })

      const result = await convertToWebP(pngFile)

      expect(result).toBeInstanceOf(window.Blob)
      expect(result.type).toBe('image/webp')
    })

    // Verify custom quality option is passed to canvas.toBlob
    it('respects quality option', async () => {
      const jpegFile = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await convertToWebP(jpegFile, { quality: 0.5 })

      expect(mockCanvas.toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.5)
    })

    // Verify maxWidth option resizes canvas while maintaining aspect ratio
    it('resizes image when maxWidth is provided', async () => {
      const jpegFile = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await convertToWebP(jpegFile, { maxWidth: 50 })

      // Canvas should be resized to 50x50 (maintaining aspect ratio from 100x100)
      expect(mockCanvas.width).toBe(50)
      expect(mockCanvas.height).toBe(50)
    })

    // Verify maxHeight option resizes canvas while maintaining aspect ratio
    it('resizes image when maxHeight is provided', async () => {
      const jpegFile = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' })

      await convertToWebP(jpegFile, { maxHeight: 50 })

      // Canvas should be resized to 50x50 (maintaining aspect ratio from 100x100)
      expect(mockCanvas.width).toBe(50)
      expect(mockCanvas.height).toBe(50)
    })

    // Error path: image fails to load
    it('rejects when image fails to load', async () => {
      // Override Image mock to trigger onerror instead of onload
      window.Image = function () {
        this.onerror = null
        const self = this
        Object.defineProperty(this, 'src', {
          set() {
            setTimeout(() => self.onerror?.(), 0)
          },
          get() {
            return ''
          },
        })
      }

      const jpegFile = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' })
      await expect(convertToWebP(jpegFile)).rejects.toThrow('Failed to load image')
    })

    // Error path: canvas.toBlob returns null
    it('rejects when canvas fails to create blob', async () => {
      mockCanvas.toBlob = vi.fn((callback) => callback(null))

      const jpegFile = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' })
      await expect(convertToWebP(jpegFile)).rejects.toThrow('Failed to convert image to WebP')
    })
  })

  /**
   * Tests for blobToWebPFile function
   * Converts a WebP blob to a File object with proper .webp extension
   */
  describe('blobToWebPFile', () => {
    // Basic conversion: replace original extension with .webp
    it('creates File with .webp extension from blob', () => {
      const blob = new window.Blob(['test'], { type: 'image/webp' })
      const result = blobToWebPFile(blob, 'original.jpg')

      expect(result).toBeInstanceOf(window.File)
      expect(result.name).toBe('original.webp')
      expect(result.type).toBe('image/webp')
    })

    // Handle edge case: filename without any extension
    it('handles filenames without extension', () => {
      const blob = new window.Blob(['test'], { type: 'image/webp' })
      const result = blobToWebPFile(blob, 'noextension')

      expect(result.name).toBe('noextension.webp')
    })

    // Handle edge case: filename with multiple dots (e.g., "my.photo.name.jpg")
    it('handles filenames with multiple dots', () => {
      const blob = new window.Blob(['test'], { type: 'image/webp' })
      const result = blobToWebPFile(blob, 'my.photo.name.jpg')

      expect(result.name).toBe('my.photo.name.webp')
    })
  })

  /**
   * Tests for formatFileSize function
   * Human-readable file size formatting (B, KB, MB, GB)
   */
  describe('formatFileSize', () => {
    // Format small values in bytes
    it('formats bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(500)).toBe('500 B')
    })

    // Format kilobytes (1024 bytes = 1 KB)
    it('formats kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    // Format megabytes (1024 * 1024 bytes = 1 MB)
    it('formats megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(5242880)).toBe('5 MB')
    })

    // Handle null/undefined gracefully by returning "0 B"
    it('handles null/undefined', () => {
      expect(formatFileSize(null)).toBe('0 B')
      expect(formatFileSize(undefined)).toBe('0 B')
    })
  })

  /**
   * Tests for FILE_VALIDATION configuration constants
   * Verifies predefined validation rules for different file types
   */
  describe('FILE_VALIDATION', () => {
    // IMAGE config: 10MB max, accepts JPEG/PNG/GIF/WebP
    it('has correct IMAGE config', () => {
      expect(FILE_VALIDATION.IMAGE.maxSize).toBe(10 * 1024 * 1024)
      expect(FILE_VALIDATION.IMAGE.allowedTypes).toContain('image/jpeg')
      expect(FILE_VALIDATION.IMAGE.allowedTypes).toContain('image/webp')
    })

    // DOCUMENT config: 10MB max, accepts PDF and Word documents
    it('has correct DOCUMENT config', () => {
      expect(FILE_VALIDATION.DOCUMENT.maxSize).toBe(10 * 1024 * 1024)
      expect(FILE_VALIDATION.DOCUMENT.allowedTypes).toContain('application/pdf')
    })
  })

  /**
   * Tests for validateFile function
   * Client-side file validation against config rules (size, MIME type)
   */
  describe('validateFile', () => {
    // Valid file passes all checks
    it('returns valid for correct file', () => {
      const file = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 1000 })

      const result = validateFile(file, FILE_VALIDATION.IMAGE)
      expect(result.valid).toBe(true)
    })

    // Null file returns error
    it('returns error for missing file', () => {
      const result = validateFile(null, FILE_VALIDATION.IMAGE)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('No file provided')
    })

    // File exceeding max size returns error with size details
    it('returns error for file too large', () => {
      const file = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 })

      const result = validateFile(file, FILE_VALIDATION.IMAGE)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File size exceeds')
    })

    // Invalid MIME type returns error with allowed types
    it('returns error for invalid MIME type', () => {
      const file = new window.File(['test'], 'test.exe', { type: 'application/x-msdownload' })
      Object.defineProperty(file, 'size', { value: 1000 })

      const result = validateFile(file, FILE_VALIDATION.IMAGE)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })
  })

  /**
   * Tests for createFileValidator factory function
   * Creates Naive UI beforeUpload handler with automatic error messaging
   */
  describe('createFileValidator', () => {
    // Returns a function suitable for Naive UI upload beforeUpload prop
    it('returns function that validates files', () => {
      const message = { error: vi.fn() }
      const validator = createFileValidator(FILE_VALIDATION.IMAGE, message)

      expect(typeof validator).toBe('function')
    })

    // Valid file: returns true, no error message shown
    it('returns true for valid file', () => {
      const message = { error: vi.fn() }
      const validator = createFileValidator(FILE_VALIDATION.IMAGE, message)
      const file = new window.File(['test'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 1000 })

      const result = validator({ file: { file } })
      expect(result).toBe(true)
      expect(message.error).not.toHaveBeenCalled()
    })

    // Invalid file: returns false, shows error via message.error()
    it('returns false and shows error for invalid file', () => {
      const message = { error: vi.fn() }
      const validator = createFileValidator(FILE_VALIDATION.IMAGE, message)
      const file = new window.File(['test'], 'test.exe', { type: 'application/x-msdownload' })
      Object.defineProperty(file, 'size', { value: 1000 })

      const result = validator({ file: { file } })
      expect(result).toBe(false)
      expect(message.error).toHaveBeenCalled()
    })
  })
})
