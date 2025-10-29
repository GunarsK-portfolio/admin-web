import { api } from './api'
import { validateRequired } from '../utils/validation'

export default {
  getAllCertifications() {
    return api.get('/portfolio/certifications')
  },
  getCertificationById(id) {
    validateRequired(id, 'Certification ID')
    return api.get(`/portfolio/certifications/${encodeURIComponent(id)}`)
  },
  createCertification(certification) {
    validateRequired(certification, 'Certification', { type: 'object' })
    return api.post('/portfolio/certifications', certification)
  },
  updateCertification(id, certification) {
    validateRequired(id, 'Certification ID')
    validateRequired(certification, 'Certification', { type: 'object' })
    return api.put(`/portfolio/certifications/${encodeURIComponent(id)}`, certification)
  },
  deleteCertification(id) {
    validateRequired(id, 'Certification ID')
    return api.delete(`/portfolio/certifications/${encodeURIComponent(id)}`)
  },
}
