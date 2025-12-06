<template>
  <div class="page">
    <div class="page-container">
      <h2 class="dashboard-title">Content Management</h2>

      <n-grid :cols="3" :x-gap="24" :y-gap="24" responsive="screen">
        <n-grid-item v-if="canRead(Resource.PROFILE)">
          <n-card>
            <h3 class="card-title">Profile</h3>
            <p class="card-description">Manage your personal information and bio</p>
            <div class="card-actions">
              <n-button type="primary" size="small" @click="router.push({ name: 'Profile' })">
                {{ canEdit(Resource.PROFILE) ? 'Edit Profile' : 'View Profile' }}
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item v-if="canRead(Resource.SKILLS)">
          <n-card>
            <h3 class="card-title">Skills</h3>
            <p class="card-description">Manage your skills and skill categories</p>
            <div class="card-actions">
              <n-button type="primary" size="small" @click="router.push({ name: 'Skills' })">
                {{ canEdit(Resource.SKILLS) ? 'Manage' : 'View' }}
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item v-if="canRead(Resource.EXPERIENCE)">
          <n-card>
            <h3 class="card-title">Work Experience</h3>
            <p class="card-description">Add, edit, or remove work experience entries</p>
            <div class="card-actions">
              <n-button
                type="primary"
                size="small"
                @click="router.push({ name: 'WorkExperience' })"
              >
                {{ canEdit(Resource.EXPERIENCE) ? 'Manage' : 'View' }}
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item v-if="canRead(Resource.CERTIFICATIONS)">
          <n-card>
            <h3 class="card-title">Certifications</h3>
            <p class="card-description">Manage your professional certifications</p>
            <div class="card-actions">
              <n-button
                type="primary"
                size="small"
                @click="router.push({ name: 'Certifications' })"
              >
                {{ canEdit(Resource.CERTIFICATIONS) ? 'Manage' : 'View' }}
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item v-if="canRead(Resource.PROJECTS)">
          <n-card>
            <h3 class="card-title">Portfolio Projects</h3>
            <p class="card-description">Manage your professional software projects</p>
            <div class="card-actions">
              <n-button
                type="primary"
                size="small"
                @click="router.push({ name: 'PortfolioProjects' })"
              >
                {{ canEdit(Resource.PROJECTS) ? 'Manage' : 'View' }}
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item v-if="canRead(Resource.MINIATURES)">
          <n-card>
            <h3 class="card-title">Miniatures</h3>
            <p class="card-description">Manage projects, themes, and paint collection</p>
            <div class="card-actions">
              <n-button type="primary" size="small" @click="router.push({ name: 'Miniatures' })">
                {{ canEdit(Resource.MINIATURES) ? 'Manage' : 'View' }}
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item v-if="canRead(Resource.MESSAGES)">
          <n-card>
            <h3 class="card-title">Messaging</h3>
            <p class="card-description">Manage contact form recipients and view messages</p>
            <div class="card-actions">
              <n-button type="primary" size="small" @click="router.push({ name: 'Messaging' })">
                {{ canEdit(Resource.MESSAGES) ? 'Manage' : 'View' }}
              </n-button>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>
  </div>
</template>

<script setup>
import { NGrid, NGridItem, NCard, NButton } from 'naive-ui'
import { useViewServices } from '../composables/useViewServices'
import { usePermissions } from '../composables/usePermissions'

const { router } = useViewServices()
const { canRead, canEdit, Resource } = usePermissions()
</script>

<style scoped>
.dashboard-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-description {
  margin-bottom: 16px;
}

.card-actions {
  text-align: right;
}

.dashboard-info {
  margin-top: 32px;
}
</style>
