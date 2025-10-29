import { api } from './api'
import { validateRequired } from '../utils/validation'

export default {
  // Skills
  getAllSkills() {
    return api.get('/portfolio/skills')
  },
  getSkillById(id) {
    validateRequired(id, 'Skill ID')
    return api.get(`/portfolio/skills/${encodeURIComponent(id)}`)
  },
  createSkill(skill) {
    validateRequired(skill, 'Skill', { type: 'object' })
    return api.post('/portfolio/skills', skill)
  },
  updateSkill(id, skill) {
    validateRequired(id, 'Skill ID')
    validateRequired(skill, 'Skill', { type: 'object' })
    return api.put(`/portfolio/skills/${encodeURIComponent(id)}`, skill)
  },
  deleteSkill(id) {
    validateRequired(id, 'Skill ID')
    return api.delete(`/portfolio/skills/${encodeURIComponent(id)}`)
  },

  // Skill Types
  getAllSkillTypes() {
    return api.get('/portfolio/skill-types')
  },
  getSkillTypeById(id) {
    validateRequired(id, 'Skill Type ID')
    return api.get(`/portfolio/skill-types/${encodeURIComponent(id)}`)
  },
  createSkillType(skillType) {
    validateRequired(skillType, 'Skill type', { type: 'object' })
    return api.post('/portfolio/skill-types', skillType)
  },
  updateSkillType(id, skillType) {
    validateRequired(id, 'Skill Type ID')
    validateRequired(skillType, 'Skill type', { type: 'object' })
    return api.put(`/portfolio/skill-types/${encodeURIComponent(id)}`, skillType)
  },
  deleteSkillType(id) {
    validateRequired(id, 'Skill Type ID')
    return api.delete(`/portfolio/skill-types/${encodeURIComponent(id)}`)
  },
}
