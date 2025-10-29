import { api } from './api'
import { validateRequired } from '../utils/validation'

export default {
  getProfile() {
    return api.get('/portfolio/profile')
  },
  updateProfile(data) {
    validateRequired(data, 'Profile data', { type: 'object' })
    return api.put('/portfolio/profile', data)
  },
  updateProfileAvatar(fileId) {
    validateRequired(fileId, 'File ID')
    return api.put('/portfolio/profile/avatar', { fileId })
  },
  deleteProfileAvatar() {
    return api.delete('/portfolio/profile/avatar')
  },
  updateProfileResume(fileId) {
    validateRequired(fileId, 'File ID')
    return api.put('/portfolio/profile/resume', { fileId })
  },
  deleteProfileResume() {
    return api.delete('/portfolio/profile/resume')
  },
}
