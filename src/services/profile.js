import { api } from './api'

export default {
  getProfile() {
    return api.get('/portfolio/profile')
  },
  updateProfile(data) {
    return api.put('/portfolio/profile', data)
  },
  updateProfileAvatar(fileId) {
    return api.put('/portfolio/profile/avatar', { file_id: fileId })
  },
  deleteProfileAvatar() {
    return api.delete('/portfolio/profile/avatar')
  },
  updateProfileResume(fileId) {
    return api.put('/portfolio/profile/resume', { file_id: fileId })
  },
  deleteProfileResume() {
    return api.delete('/portfolio/profile/resume')
  },
}
