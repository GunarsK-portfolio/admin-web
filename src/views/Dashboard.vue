<template>
  <div class="dashboard-page">
    <div class="dashboard-container">
      <h2 style="font-size: 32px; font-weight: bold; margin-bottom: 24px">Content Management</h2>

      <n-grid :cols="3" :x-gap="24" :y-gap="24" responsive="screen">
        <n-grid-item>
          <n-card>
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px">Profile</h3>
            <p style="margin-bottom: 16px">Manage your personal information and bio</p>
            <div style="text-align: right">
              <n-button type="primary" size="small" @click="$router.push('/profile')">
                Edit Profile
              </n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px">Work Experience</h3>
            <p style="margin-bottom: 16px">Add, edit, or remove work experience entries</p>
            <div style="text-align: right">
              <n-button type="primary" size="small">Manage</n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px">Certifications</h3>
            <p style="margin-bottom: 16px">Manage your professional certifications</p>
            <div style="text-align: right">
              <n-button type="primary" size="small">Manage</n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px">
              Miniature Projects
            </h3>
            <p style="margin-bottom: 16px">Add and manage your miniature painting projects</p>
            <div style="text-align: right">
              <n-button type="primary" size="small">Manage</n-button>
            </div>
          </n-card>
        </n-grid-item>

        <n-grid-item>
          <n-card>
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 8px">Images</h3>
            <p style="margin-bottom: 16px">Upload and manage project images</p>
            <div style="text-align: right">
              <n-button type="primary" size="small">Upload</n-button>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-alert type="info" style="margin-top: 32px">
        This is a basic admin dashboard. Full CRUD functionality can be implemented by creating
        dedicated management pages for each content type.
      </n-alert>
    </div>
  </div>
</template>

<script setup>
import { NGrid, NGridItem, NCard, NAlert, NButton } from 'naive-ui'
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  padding: 24px;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
