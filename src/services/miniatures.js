import { api } from './api'
import { validateRequired } from '../utils/validation'

export default {
  // Themes
  getAllThemes() {
    return api.get('/miniatures/themes')
  },
  getThemeById(id) {
    validateRequired(id, 'Theme ID')
    return api.get(`/miniatures/themes/${encodeURIComponent(id)}`)
  },
  createTheme(theme) {
    validateRequired(theme, 'Theme', { type: 'object' })
    return api.post('/miniatures/themes', theme)
  },
  updateTheme(id, theme) {
    validateRequired(id, 'Theme ID')
    validateRequired(theme, 'Theme', { type: 'object' })
    return api.put(`/miniatures/themes/${encodeURIComponent(id)}`, theme)
  },
  deleteTheme(id) {
    validateRequired(id, 'Theme ID')
    return api.delete(`/miniatures/themes/${encodeURIComponent(id)}`)
  },

  // Projects
  getAllProjects() {
    return api.get('/miniatures/projects')
  },
  getProjectById(id) {
    validateRequired(id, 'Project ID')
    return api.get(`/miniatures/projects/${encodeURIComponent(id)}`)
  },
  createProject(project) {
    validateRequired(project, 'Project', { type: 'object' })
    return api.post('/miniatures/projects', project)
  },
  updateProject(id, project) {
    validateRequired(id, 'Project ID')
    validateRequired(project, 'Project', { type: 'object' })
    return api.put(`/miniatures/projects/${encodeURIComponent(id)}`, project)
  },
  deleteProject(id) {
    validateRequired(id, 'Project ID')
    return api.delete(`/miniatures/projects/${encodeURIComponent(id)}`)
  },
  addImageToProject(projectId, fileId, caption = '') {
    validateRequired(projectId, 'Project ID')
    validateRequired(fileId, 'File ID')
    return api.post(`/miniatures/projects/${encodeURIComponent(projectId)}/images`, {
      fileId,
      caption,
    })
  },
  deleteProjectImage(imageId) {
    validateRequired(imageId, 'Image ID')
    return api.delete(`/files/${encodeURIComponent(imageId)}`)
  },

  // Techniques
  getAllTechniques() {
    return api.get('/miniatures/techniques')
  },

  // Paints
  getAllPaints() {
    return api.get('/miniatures/paints')
  },
  getPaintById(id) {
    validateRequired(id, 'Paint ID')
    return api.get(`/miniatures/paints/${encodeURIComponent(id)}`)
  },
  createPaint(paint) {
    validateRequired(paint, 'Paint', { type: 'object' })
    return api.post('/miniatures/paints', paint)
  },
  updatePaint(id, paint) {
    validateRequired(id, 'Paint ID')
    validateRequired(paint, 'Paint', { type: 'object' })
    return api.put(`/miniatures/paints/${encodeURIComponent(id)}`, paint)
  },
  deletePaint(id) {
    validateRequired(id, 'Paint ID')
    return api.delete(`/miniatures/paints/${encodeURIComponent(id)}`)
  },
}
