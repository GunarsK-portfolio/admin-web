import { api } from './api'

export default {
  getAllWorkExperience() {
    return api.get('/portfolio/experience')
  },
  getWorkExperienceById(id) {
    return api.get(`/portfolio/experience/${encodeURIComponent(id)}`)
  },
  createWorkExperience(experience) {
    return api.post('/portfolio/experience', experience)
  },
  updateWorkExperience(id, experience) {
    return api.put(`/portfolio/experience/${encodeURIComponent(id)}`, experience)
  },
  deleteWorkExperience(id) {
    return api.delete(`/portfolio/experience/${encodeURIComponent(id)}`)
  },
}
