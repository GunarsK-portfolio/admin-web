import { api } from './api'
import { validateRequired } from '../utils/validation'

export default {
  getAllWorkExperiences() {
    return api.get('/portfolio/experience')
  },
  getWorkExperienceById(id) {
    validateRequired(id, 'Work Experience ID')
    return api.get(`/portfolio/experience/${encodeURIComponent(id)}`)
  },
  createWorkExperience(experience) {
    validateRequired(experience, 'Work experience', { type: 'object' })
    return api.post('/portfolio/experience', experience)
  },
  updateWorkExperience(id, experience) {
    validateRequired(id, 'Work Experience ID')
    validateRequired(experience, 'Work experience', { type: 'object' })
    return api.put(`/portfolio/experience/${encodeURIComponent(id)}`, experience)
  },
  deleteWorkExperience(id) {
    validateRequired(id, 'Work Experience ID')
    return api.delete(`/portfolio/experience/${encodeURIComponent(id)}`)
  },
}
