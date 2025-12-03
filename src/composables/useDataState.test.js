import { describe, it, expect } from 'vitest'
import { useDataState } from './useDataState'

describe('useDataState', () => {
  describe('initial state', () => {
    it('initializes with empty array by default', () => {
      const { data, loading, search } = useDataState()
      expect(data.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(search.value).toBe('')
    })

    it('accepts initial data', () => {
      const initialData = [{ id: 1 }, { id: 2 }]
      const { data } = useDataState(initialData)
      expect(data.value).toEqual(initialData)
    })
  })

  describe('reactivity', () => {
    it('data ref is reactive', () => {
      const { data } = useDataState()
      data.value = [{ id: 1 }]
      expect(data.value).toHaveLength(1)

      data.value.push({ id: 2 })
      expect(data.value).toHaveLength(2)
    })

    it('loading ref is reactive', () => {
      const { loading } = useDataState()
      expect(loading.value).toBe(false)

      loading.value = true
      expect(loading.value).toBe(true)
    })

    it('search ref is reactive', () => {
      const { search } = useDataState()
      expect(search.value).toBe('')

      search.value = 'test query'
      expect(search.value).toBe('test query')
    })
  })

  describe('typical usage pattern', () => {
    it('simulates data loading flow', async () => {
      const { data, loading } = useDataState()

      // Start loading
      loading.value = true
      expect(loading.value).toBe(true)
      expect(data.value).toEqual([])

      // Simulate API response
      const mockData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]
      data.value = mockData
      loading.value = false

      expect(loading.value).toBe(false)
      expect(data.value).toEqual(mockData)
    })
  })
})
