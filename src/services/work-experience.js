import { api } from './api'

export default {
  getAllWorkExperience() {
    return api.get('/portfolio/experience')
  },
  getWorkExperienceById(id) {
    return api.get(`/portfolio/experience/${id}`)
  },
  createWorkExperience(experience) {
    return api.post('/portfolio/experience', experience)
  },
  updateWorkExperience(id, experience) {
    return api.put(`/portfolio/experience/${id}`, experience)
  },
  deleteWorkExperience(id) {
    return api.delete(`/portfolio/experience/${id}`)
  },
}
