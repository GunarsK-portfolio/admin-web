import { api } from './api'

export default {
  getProfile() {
    return api.get('/portfolio/profile')
  },
  updateProfile(data) {
    return api.put('/portfolio/profile', data)
  },
  updateProfileAvatar(fileId) {
    return api.put('/portfolio/profile/avatar', { fileId })
  },
  deleteProfileAvatar() {
    return api.delete('/portfolio/profile/avatar')
  },
  updateProfileResume(fileId) {
    return api.put('/portfolio/profile/resume', { fileId })
  },
  deleteProfileResume() {
    return api.delete('/portfolio/profile/resume')
  },
}
