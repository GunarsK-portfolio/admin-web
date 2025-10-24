<template>
  <div class="profile-page">
    <n-space vertical size="large" class="profile-container">
      <n-button text @click="router.push('/dashboard')">
        <template #icon>
          <n-icon><ArrowBackOutline /></n-icon>
        </template>
        Back to Dashboard
      </n-button>

      <n-page-header
        title="Profile Management"
        subtitle="Manage your personal information and portfolio details"
      />

      <n-spin :show="loading">
        <n-form ref="formRef" :model="formData" :rules="rules">
          <n-card title="Basic Information" class="profile-card">
            <n-form-item label="Full Name" path="name">
              <n-input
                v-model:value="formData.name"
                placeholder="Enter your full name"
                :disabled="saving"
              />
            </n-form-item>

            <n-form-item label="Professional Title" path="title">
              <n-input
                v-model:value="formData.title"
                placeholder="e.g., Senior Software Engineer"
                :disabled="saving"
              />
            </n-form-item>

            <n-form-item label="Bio / Tagline" path="tagline">
              <n-input
                v-model:value="formData.tagline"
                type="textarea"
                placeholder="Brief description about yourself"
                :autosize="{ minRows: 3, maxRows: 6 }"
                :disabled="saving"
              />
            </n-form-item>
          </n-card>

          <n-card title="Contact Information" class="profile-card">
            <n-form-item label="Email" path="email">
              <n-input
                v-model:value="formData.email"
                placeholder="contact@example.com"
                :disabled="saving"
              />
            </n-form-item>

            <n-form-item label="Phone" path="phone">
              <n-input
                v-model:value="formData.phone"
                placeholder="+1 (555) 123-4567"
                :disabled="saving"
              />
            </n-form-item>

            <n-form-item label="Location" path="location">
              <n-input
                v-model:value="formData.location"
                placeholder="City, Country"
                :disabled="saving"
              />
            </n-form-item>
          </n-card>

          <n-grid :x-gap="24" :y-gap="24" :cols="1" :m="2">
            <n-grid-item>
              <n-card title="Avatar" class="profile-card">
                <n-space vertical>
                  <div v-if="formData.avatarFileId">
                    <n-text>Current avatar ID: {{ formData.avatarFileId }}</n-text>
                    <n-button
                      type="error"
                      size="small"
                      :loading="deletingAvatar"
                      @click="handleDeleteAvatar"
                    >
                      <template #icon>
                        <n-icon><TrashOutline /></n-icon>
                      </template>
                      Remove Avatar
                    </n-button>
                  </div>
                  <n-alert v-else type="info">
                    No avatar uploaded yet. Upload functionality coming soon.
                  </n-alert>
                </n-space>
              </n-card>
            </n-grid-item>

            <n-grid-item>
              <n-card title="Resume" class="profile-card">
                <n-space vertical>
                  <div v-if="formData.resumeFileId">
                    <n-text>Current resume ID: {{ formData.resumeFileId }}</n-text>
                    <n-button
                      type="error"
                      size="small"
                      :loading="deletingResume"
                      @click="handleDeleteResume"
                    >
                      <template #icon>
                        <n-icon><TrashOutline /></n-icon>
                      </template>
                      Remove Resume
                    </n-button>
                  </div>
                  <n-alert v-else type="info">
                    No resume uploaded yet. Upload functionality coming soon.
                  </n-alert>
                </n-space>
              </n-card>
            </n-grid-item>
          </n-grid>

          <n-space>
            <n-button type="primary" :loading="saving" @click="handleSave">
              <template #icon>
                <n-icon><SaveOutline /></n-icon>
              </template>
              Save Changes
            </n-button>
            <n-button :disabled="saving || loading" @click="loadProfile">Reset</n-button>
          </n-space>
        </n-form>
      </n-spin>
    </n-space>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpace,
  NPageHeader,
  NButton,
  NIcon,
  NCard,
  NGrid,
  NGridItem,
  NForm,
  NFormItem,
  NInput,
  NText,
  NAlert,
  NSpin,
  useMessage,
} from 'naive-ui'
import { ArrowBackOutline, SaveOutline, TrashOutline } from '@vicons/ionicons5'
import profileService from '../services/profile'
import { logger } from '../utils/logger'

const router = useRouter()
const message = useMessage()
const formRef = ref(null)

const loading = ref(false)
const saving = ref(false)
const deletingAvatar = ref(false)
const deletingResume = ref(false)

const formData = ref({
  id: null,
  name: '',
  title: '',
  tagline: '',
  email: '',
  phone: '',
  location: '',
  avatarFileId: null,
  resumeFileId: null,
})

const rules = {
  name: [{ required: true, message: 'Full name is required', trigger: 'blur' }],
  email: [
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email',
      trigger: 'blur',
    },
  ],
}

async function loadProfile() {
  loading.value = true
  try {
    const response = await profileService.getProfile()
    if (response.data) {
      formData.value = {
        id: response.data.id,
        name: response.data.name || '',
        title: response.data.title || '',
        tagline: response.data.tagline || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        location: response.data.location || '',
        avatarFileId: response.data.avatarFileId || null,
        resumeFileId: response.data.resumeFileId || null,
      }
    }
  } catch (error) {
    logger.error('Failed to load profile', {
      error: error.message,
      status: error.response?.status,
    })
    message.error('Failed to load profile data')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  try {
    await formRef.value?.validate()
    saving.value = true

    await profileService.updateProfile(formData.value)
    message.success('Profile updated successfully')
  } catch (error) {
    if (error?.errors) {
      return
    }
    logger.error('Failed to update profile', {
      error: error.message,
      status: error.response?.status,
    })
    message.error(error.response?.data?.error || 'Failed to update profile')
  } finally {
    saving.value = false
  }
}

async function handleDeleteAvatar() {
  deletingAvatar.value = true
  try {
    await profileService.deleteProfileAvatar()
    formData.value.avatarFileId = null
    message.success('Avatar removed successfully')
  } catch (error) {
    logger.error('Failed to delete avatar', {
      error: error.message,
      status: error.response?.status,
    })
    message.error('Failed to remove avatar')
  } finally {
    deletingAvatar.value = false
  }
}

async function handleDeleteResume() {
  deletingResume.value = true
  try {
    await profileService.deleteProfileResume()
    formData.value.resumeFileId = null
    message.success('Resume removed successfully')
  } catch (error) {
    logger.error('Failed to delete resume', {
      error: error.message,
      status: error.response?.status,
    })
    message.error('Failed to remove resume')
  } finally {
    deletingResume.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  width: 100%;
  padding: 24px;
  min-height: 100vh;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.profile-card {
  margin-bottom: 24px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

html.dark .profile-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
