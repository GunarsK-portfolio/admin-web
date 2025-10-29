import { api } from './api'

export default {
  // Skills
  getAllSkills() {
    return api.get('/portfolio/skills')
  },
  getSkillById(id) {
    return api.get(`/portfolio/skills/${encodeURIComponent(id)}`)
  },
  createSkill(skill) {
    return api.post('/portfolio/skills', skill)
  },
  updateSkill(id, skill) {
    return api.put(`/portfolio/skills/${encodeURIComponent(id)}`, skill)
  },
  deleteSkill(id) {
    return api.delete(`/portfolio/skills/${encodeURIComponent(id)}`)
  },

  // Skill Types
  getAllSkillTypes() {
    return api.get('/portfolio/skill-types')
  },
  getSkillTypeById(id) {
    return api.get(`/portfolio/skill-types/${encodeURIComponent(id)}`)
  },
  createSkillType(skillType) {
    return api.post('/portfolio/skill-types', skillType)
  },
  updateSkillType(id, skillType) {
    return api.put(`/portfolio/skill-types/${encodeURIComponent(id)}`, skillType)
  },
  deleteSkillType(id) {
    return api.delete(`/portfolio/skill-types/${encodeURIComponent(id)}`)
  },
}
