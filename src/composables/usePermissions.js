import { useAuthStore } from '@/stores/auth'
import { Resource, Level } from '@/constants/permissions'

export function usePermissions() {
  const authStore = useAuthStore()

  const can = (resource, level) => authStore.hasPermission(resource, level)
  const canRead = (resource) => authStore.canRead(resource)
  const canEdit = (resource) => authStore.canEdit(resource)
  const canDelete = (resource) => authStore.canDelete(resource)

  return { can, canRead, canEdit, canDelete, Resource, Level }
}
