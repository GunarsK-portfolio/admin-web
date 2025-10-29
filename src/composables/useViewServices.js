import { useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'

/**
 * Provides standard services used across all views
 * Initializes router, message, and dialog instances
 *
 * @returns {Object} View services object
 *
 * @example
 * const { router, message, dialog } = useViewServices()
 *
 * // Use router for navigation
 * router.push('/dashboard')
 *
 * // Use message for notifications
 * message.success('Saved successfully')
 *
 * // Use dialog for confirmations
 * dialog.warning({ title: 'Confirm', content: 'Are you sure?' })
 */
export function useViewServices() {
  const router = useRouter()
  const message = useMessage()
  const dialog = useDialog()

  return {
    router,
    message,
    dialog,
  }
}
