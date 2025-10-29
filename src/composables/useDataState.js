import { ref } from 'vue'

/**
 * Creates standard data state for list views
 * Provides refs for data array, loading state, and search term
 *
 * @param {Array} [initialData=[]] - Initial data array
 * @returns {Object} Data state object
 *
 * @example
 * const { data, loading, search } = useDataState()
 *
 * // Use in data loading
 * loading.value = true
 * const response = await service.getAll()
 * data.value = response.data
 * loading.value = false
 *
 * // Use with search filter
 * const filtered = createSearchFilter(data, search, ['name', 'email'])
 */
export function useDataState(initialData = []) {
  const data = ref(initialData)
  const loading = ref(false)
  const search = ref('')

  return {
    data,
    loading,
    search,
  }
}
