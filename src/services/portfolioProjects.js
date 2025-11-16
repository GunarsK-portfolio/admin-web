import { api } from './api'
import { validateRequired } from '../utils/validation'

export default {
  getAllProjects() {
    return api.get('/portfolio/projects')
  },
  getProjectById(id) {
    validateRequired(id, 'Project ID')
    return api.get(`/portfolio/projects/${encodeURIComponent(id)}`)
  },
  createProject(project) {
    validateRequired(project, 'Project', { type: 'object' })
    return api.post('/portfolio/projects', project)
  },
  updateProject(id, project) {
    validateRequired(id, 'Project ID')
    validateRequired(project, 'Project', { type: 'object' })
    return api.put(`/portfolio/projects/${encodeURIComponent(id)}`, project)
  },
  deleteProject(id) {
    validateRequired(id, 'Project ID')
    return api.delete(`/portfolio/projects/${encodeURIComponent(id)}`)
  },
}
