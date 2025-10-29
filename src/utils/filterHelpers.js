import { computed } from 'vue'
import { normalizeString } from './validation'

/**
 * Creates a computed property for filtering an array of items by search term
 * @param {import('vue').Ref} items - Ref containing array of items to filter
 * @param {import('vue').Ref} searchTerm - Ref containing search query string
 * @param {string[]} fields - Array of field names to search in
 * @returns {import('vue').ComputedRef} Computed ref with filtered items
 *
 * @example
 * const filteredItems = createSearchFilter(items, search, ['name', 'description'])
 *
 * @example
 * // For nested fields, use dot notation
 * const filteredSkills = createSearchFilter(skills, search, ['skill', 'skillType.name'])
 */
export function createSearchFilter(items, searchTerm, fields) {
  return computed(() => {
    if (!searchTerm.value) return items.value

    const searchLower = normalizeString(searchTerm.value)

    return items.value.filter((item) => {
      return fields.some((field) => {
        // Handle nested fields with dot notation (e.g., 'skillType.name')
        const value = field.split('.').reduce((obj, key) => obj?.[key], item)
        const normalized = normalizeString(value)
        return normalized.includes(searchLower)
      })
    })
  })
}
