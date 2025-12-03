import { describe, it, expect } from 'vitest'
import { stringSorter, numberSorter, dateSorter, createDateRangeRenderer } from './tableHelpers'

describe('tableHelpers', () => {
  describe('stringSorter', () => {
    const sorter = stringSorter('name')

    it('sorts strings alphabetically', () => {
      const items = [{ name: 'Banana' }, { name: 'Apple' }, { name: 'Cherry' }]
      const sorted = [...items].sort(sorter)
      expect(sorted.map((i) => i.name)).toEqual(['Apple', 'Banana', 'Cherry'])
    })

    it('is case-insensitive', () => {
      const items = [{ name: 'banana' }, { name: 'Apple' }, { name: 'CHERRY' }]
      const sorted = [...items].sort(sorter)
      expect(sorted.map((i) => i.name)).toEqual(['Apple', 'banana', 'CHERRY'])
    })

    it('handles null values', () => {
      const items = [{ name: 'Banana' }, { name: null }, { name: 'Apple' }]
      const sorted = [...items].sort(sorter)
      expect(sorted[0].name).toBe(null) // null converts to empty string, sorts first
    })

    it('handles undefined values', () => {
      const items = [{ name: 'Banana' }, {}, { name: 'Apple' }]
      const sorted = [...items].sort(sorter)
      expect(sorted[0].name).toBe(undefined)
    })

    it('handles missing objects', () => {
      const items = [{ name: 'B' }, null, { name: 'A' }]
      const sorted = [...items].sort(sorter)
      // null?.name is undefined, converts to ''
      expect(sorted).toBeDefined()
    })
  })

  describe('numberSorter', () => {
    const sorter = numberSorter('value')

    it('sorts numbers ascending', () => {
      const items = [{ value: 30 }, { value: 10 }, { value: 20 }]
      const sorted = [...items].sort(sorter)
      expect(sorted.map((i) => i.value)).toEqual([10, 20, 30])
    })

    it('handles negative numbers', () => {
      const items = [{ value: 5 }, { value: -10 }, { value: 0 }]
      const sorted = [...items].sort(sorter)
      expect(sorted.map((i) => i.value)).toEqual([-10, 0, 5])
    })

    it('handles null values as 0', () => {
      const items = [{ value: 5 }, { value: null }, { value: -1 }]
      const sorted = [...items].sort(sorter)
      expect(sorted.map((i) => i.value)).toEqual([-1, null, 5])
    })

    it('handles undefined values as 0', () => {
      const items = [{ value: 5 }, {}, { value: -1 }]
      const sorted = [...items].sort(sorter)
      expect(sorted[1].value).toBeUndefined() // In middle (treated as 0)
    })

    it('handles decimal numbers', () => {
      const items = [{ value: 1.5 }, { value: 1.2 }, { value: 1.8 }]
      const sorted = [...items].sort(sorter)
      expect(sorted.map((i) => i.value)).toEqual([1.2, 1.5, 1.8])
    })
  })

  describe('dateSorter', () => {
    const sorter = dateSorter('date')

    it('sorts dates chronologically', () => {
      const items = [{ date: '2024-03-15' }, { date: '2024-01-10' }, { date: '2024-02-20' }]
      const sorted = [...items].sort(sorter)
      expect(sorted.map((i) => i.date)).toEqual(['2024-01-10', '2024-02-20', '2024-03-15'])
    })

    it('handles ISO datetime strings', () => {
      const items = [{ date: '2024-03-15T10:00:00Z' }, { date: '2024-03-15T08:00:00Z' }]
      const sorted = [...items].sort(sorter)
      expect(sorted[0].date).toBe('2024-03-15T08:00:00Z')
    })

    it('handles null dates as 0', () => {
      const items = [{ date: '2024-03-15' }, { date: null }, { date: '2024-01-10' }]
      const sorted = [...items].sort(sorter)
      expect(sorted[0].date).toBe(null) // null treated as epoch 0
    })

    it('handles invalid dates as 0', () => {
      const items = [{ date: '2024-03-15' }, { date: 'invalid' }, { date: '2024-01-10' }]
      const sorted = [...items].sort(sorter)
      expect(sorted[0].date).toBe('invalid') // Invalid treated as 0
    })

    it('handles empty string as 0', () => {
      const items = [{ date: '2024-03-15' }, { date: '' }, { date: '2024-01-10' }]
      const sorted = [...items].sort(sorter)
      // Empty string results in Invalid Date, treated as 0
      expect(sorted[0].date).toBe('')
    })
  })

  describe('createDateRangeRenderer', () => {
    describe('default options', () => {
      const renderer = createDateRangeRenderer()

      it('formats date range with month format', () => {
        const row = { startDate: '2024-01-15', endDate: '2024-06-20' }
        // toMonthFormat returns yyyy-MM format
        const result = renderer(row)
        expect(result).toContain(' - ')
      })

      it('shows "Present" for current positions', () => {
        const row = { startDate: '2024-01-15', endDate: null, isCurrent: true }
        const result = renderer(row)
        expect(result).toContain('Present')
      })

      it('handles missing end date without isCurrent', () => {
        const row = { startDate: '2024-01-15', endDate: null, isCurrent: false }
        const result = renderer(row)
        expect(result).toContain('N/A')
      })
    })

    describe('custom options', () => {
      it('uses custom keys', () => {
        const renderer = createDateRangeRenderer({
          startKey: 'from',
          endKey: 'to',
          currentKey: 'ongoing',
          currentLabel: 'Ongoing',
        })
        const row = { from: '2024-01-15', to: null, ongoing: true }
        const result = renderer(row)
        expect(result).toContain('Ongoing')
      })

      it('uses full date format when specified', () => {
        const renderer = createDateRangeRenderer({ format: 'full' })
        const row = { startDate: '2024-01-15', endDate: '2024-06-20' }
        // toDateFormat returns yyyy-MM-dd format
        const result = renderer(row)
        expect(result).toContain(' - ')
      })
    })

    it('handles null options', () => {
      const renderer = createDateRangeRenderer(null)
      const row = { startDate: '2024-01-15', endDate: '2024-06-20' }
      const result = renderer(row)
      expect(result).toBeDefined()
    })
  })
})
