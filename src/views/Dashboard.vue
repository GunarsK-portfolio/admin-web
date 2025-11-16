<template>
  <div class="page">
    <div class="page-container">
      <h2 class="dashboard-title">Content Management</h2>

      <n-grid :cols="3" :x-gap="24" :y-gap="24" responsive="screen">
        <n-grid-item>
          <n-card>
            <h3 class="card-title">Profile</h3>
            <p class="card-description">Manage your personal information and bio</p>
            <div class="card-actions">
              <n-button type="primary" size="small" @click="router.push({ name: 'Profile' })">
                Edit Profile
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <h3 class="card-title">Skills</h3>
            <p class="card-description">Manage your skills and skill categories</p>
            <div class="card-actions">
              <n-button type="primary" size="small" @click="router.push({ name: 'Skills' })">
                Manage Skills
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <h3 class="card-title">Work Experience</h3>
            <p class="card-description">Add, edit, or remove work experience entries</p>
            <div class="card-actions">
              <n-button
                type="primary"
                size="small"
                @click="router.push({ name: 'WorkExperience' })"
              >
                Manage
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <h3 class="card-title">Certifications</h3>
            <p class="card-description">Manage your professional certifications</p>
            <div class="card-actions">
              <n-button
                type="primary"
                size="small"
                @click="router.push({ name: 'Certifications' })"
              >
                Manage
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <h3 class="card-title">Portfolio Projects</h3>
            <p class="card-description">Manage your professional software projects</p>
            <div class="card-actions">
              <n-button
                type="primary"
                size="small"
                @click="router.push({ name: 'PortfolioProjects' })"
              >
                Manage
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <h3 class="card-title">Miniatures</h3>
            <p class="card-description">Manage projects, themes, and paint collection</p>
            <div class="card-actions">
              <n-button type="primary" size="small" @click="router.push({ name: 'Miniatures' })">
                Manage
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <h3 class="card-title">Images</h3>
            <p class="card-description">Upload and manage project images</p>
            <div class="card-actions">
              <n-button type="primary" size="small">Upload</n-button>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-alert type="info" class="dashboard-info">
        This is a basic admin dashboard. Full CRUD functionality can be implemented by creating
        dedicated management pages for each content type.
      </n-alert>
    </div>
  </div>
</template>

<script setup>
import { NGrid, NGridItem, NCard, NAlert, NButton } from 'naive-ui'
import { useViewServices } from '../composables/useViewServices'

const { router } = useViewServices()
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
