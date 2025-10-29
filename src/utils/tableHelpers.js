import { h } from 'vue'
import { NButton, NIcon, NSpace } from 'naive-ui'
import { toMonthFormat, toDateFormat } from './dateHelpers'

/**
 * Creates string comparison sorter (case-insensitive)
 * @param {string} key - Property name to sort by
 * @returns {Function} Sorter function
 */
export const stringSorter = (key) => (a, b) =>
  (a[key] || '').localeCompare(b[key] || '', undefined, { sensitivity: 'base' })

/**
 * Creates number comparison sorter
 * @param {string} key - Property name to sort by
 * @returns {Function} Sorter function
 */
export const numberSorter = (key) => (a, b) => (a[key] || 0) - (b[key] || 0)

/**
 * Creates date comparison sorter
 * @param {string} key - Property name to sort by
 * @returns {Function} Sorter function
 */
export const dateSorter = (key) => (a, b) => {
  const aTime = new Date(a[key] || 0).getTime()
  const bTime = new Date(b[key] || 0).getTime()
  const aValid = !isNaN(aTime) ? aTime : 0
  const bValid = !isNaN(bTime) ? bTime : 0
  return aValid - bValid
}

/**
 * Creates action buttons renderer for table rows
 * @param {Array} actions - Action configs with icon, onClick, type, label properties
 * @returns {Function} Render function
 */
export function createActionsRenderer(actions) {
  return (row) =>
    h(
      NSpace,
      { size: 8 },
      {
        default: () =>
          actions.map((action) =>
            h(
              NButton,
              {
                size: 'small',
                type: action.type || 'default',
                'aria-label': action.label,
                title: action.label,
                onClick: (e) => {
                  e.stopPropagation()
                  action.onClick(row)
                },
              },
              {
                icon: () => h(NIcon, null, { default: () => h(action.icon) }),
              }
            )
          ),
      }
    )
}

/**
 * Creates date range renderer for displaying date ranges
 * @param {Object} options - Configuration with startKey, endKey, currentKey, currentLabel, format
 * @param {string} options.format - 'month' for yyyy-MM or 'full' for yyyy-MM-dd
 * @returns {Function} Render function
 */
export function createDateRangeRenderer(options) {
  const {
    startKey = 'startDate',
    endKey = 'endDate',
    currentKey = 'isCurrent',
    currentLabel = 'Present',
    format = 'month',
  } = options || {}

  return (row) => {
    const formatDate = (date) => {
      if (!date) return 'N/A'
      return format === 'month' ? toMonthFormat(date) : toDateFormat(date)
    }

    const startDate = formatDate(row[startKey])
    const endDate = row[currentKey] ? currentLabel : formatDate(row[endKey])
    return `${startDate} - ${endDate}`
  }
}
