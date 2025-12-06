// Permission levels - must match backend portfolio-common/middleware/permission.go
export const Level = {
  NONE: 'none',
  READ: 'read',
  EDIT: 'edit',
  DELETE: 'delete',
}

// Permission level hierarchy values for comparison
export const LevelValues = {
  [Level.NONE]: 0,
  [Level.READ]: 1,
  [Level.EDIT]: 2,
  [Level.DELETE]: 3,
}

// Resources - must match backend portfolio-common/middleware/permission.go
export const Resource = {
  PROFILE: 'profile',
  EXPERIENCE: 'experience',
  CERTIFICATIONS: 'certifications',
  SKILLS: 'skills',
  PROJECTS: 'projects',
  MINIATURES: 'miniatures',
  FILES: 'files',
  MESSAGES: 'messages',
  RECIPIENTS: 'recipients',
}
