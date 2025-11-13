<template>
  <div class="page">
    <n-space vertical size="large" class="page-container-narrow">
      <BackButton />

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

          <n-grid :x-gap="24" :y-gap="24" :cols="1">
            <n-grid-item>
              <n-card title="Avatar" class="profile-card">
                <n-space vertical>
                  <div v-if="formData.avatarFile">
                    <n-space vertical align="center">
                      <n-avatar
                        :size="120"
                        :src="addSourceToFileUrl(formData.avatarFile?.url)"
                        round
                      >
                        <template #fallback>
                          {{ formData.name?.charAt(0)?.toUpperCase() || 'U' }}
                        </template>
                      </n-avatar>
                      <n-text depth="3" class="file-info">
                        {{ formData.avatarFile.fileName }} ({{
                          formatFileSize(formData.avatarFile.fileSize)
                        }})
                      </n-text>
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
                    </n-space>
                  </div>
                  <n-upload
                    v-model:file-list="avatarFileList"
                    :custom-request="handleAvatarSelect"
                    :show-file-list="false"
                    :max="1"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    :disabled="uploadingAvatar"
                  >
                    <n-upload-dragger>
                      <div class="upload-icon">
                        <n-icon size="48" :depth="3">
                          <CloudUploadOutline />
                        </n-icon>
                      </div>
                      <n-text class="upload-text">
                        {{
                          formData.avatarFile
                            ? 'Click or drag to replace avatar'
                            : 'Click or drag avatar image to this area to upload'
                        }}
                      </n-text>
                      <n-text depth="3" class="upload-hint">
                        Supported formats: JPEG, PNG, GIF, WebP (Max 10MB)
                      </n-text>
                    </n-upload-dragger>
                  </n-upload>
                </n-space>
              </n-card>
            </n-grid-item>

            <n-grid-item>
              <n-card title="Resume" class="profile-card">
                <n-space vertical>
                  <div v-if="formData.resumeFile">
                    <n-space vertical>
                      <n-space align="center">
                        <n-icon size="48" color="#0ea5e9">
                          <DocumentTextOutline />
                        </n-icon>
                        <n-space vertical :size="4">
                          <n-text strong>{{ formData.resumeFile.fileName }}</n-text>
                          <n-text depth="3" class="file-info">
                            {{ formatFileSize(formData.resumeFile.fileSize) }}
                          </n-text>
                        </n-space>
                      </n-space>
                      <n-space>
                        <n-button
                          tag="a"
                          :href="addSourceToFileUrl(formData.resumeFile.url)"
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                        >
                          <template #icon>
                            <n-icon><OpenOutline /></n-icon>
                          </template>
                          View Resume
                        </n-button>
                        <n-button
                          type="error"
                          size="small"
                          :loading="deletingResume"
                          @click="handleDeleteResume"
                        >
                          <template #icon>
                            <n-icon><TrashOutline /></n-icon>
                          </template>
                          Remove
                        </n-button>
                      </n-space>
                    </n-space>
                  </div>
                  <n-upload
                    v-model:file-list="resumeFileList"
                    :custom-request="handleResumeUpload"
                    :show-file-list="false"
                    :max="1"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    :disabled="uploadingResume"
                  >
                    <n-upload-dragger>
                      <div class="upload-icon">
                        <n-icon size="48" :depth="3">
                          <CloudUploadOutline />
                        </n-icon>
                      </div>
                      <n-text class="upload-text">
                        Click or drag resume file to this area to upload
                      </n-text>
                      <n-text depth="3" class="upload-hint">
                        Supported formats: PDF, DOC, DOCX (Max 10MB)
                      </n-text>
                    </n-upload-dragger>
                  </n-upload>
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

    <ImageCropperModal
      v-model:show="showCropperModal"
      :image-src="selectedImageSrc"
      title="Crop Avatar"
      confirm-text="Upload Avatar"
      :circular="true"
      :aspect-ratio="1"
      @crop="handleAvatarCrop"
      @cancel="handleCropperCancel"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
  NSpin,
  NUpload,
  NUploadDragger,
  NAvatar,
} from 'naive-ui'
import {
  SaveOutline,
  TrashOutline,
  CloudUploadOutline,
  DocumentTextOutline,
  OpenOutline,
} from '@vicons/ionicons5'
import BackButton from '../components/shared/BackButton.vue'
import { useViewServices } from '../composables/useViewServices'
import profileService from '../services/profile'
import filesService from '../services/files'
import { logger } from '../utils/logger'
import { formatFileSize } from '../utils/fileHelpers'
import { required, email, validateForm } from '../utils/validation'
import { createDataLoader } from '../utils/crudHelpers'
import { addSourceToFileUrl } from '../utils/fileUrl'
import ImageCropperModal from '../components/shared/ImageCropperModal.vue'

const { message } = useViewServices()
const formRef = ref(null)

const loading = ref(false)
const saving = ref(false)
const uploadingAvatar = ref(false)
const deletingAvatar = ref(false)
const uploadingResume = ref(false)
const deletingResume = ref(false)

const showCropperModal = ref(false)
const selectedImageSrc = ref('')
const selectedImageFile = ref(null)
const avatarFileList = ref([])
const resumeFileList = ref([])

const formData = ref({
  id: null,
  name: '',
  title: '',
  tagline: '',
  email: '',
  phone: '',
  location: '',
  avatarFileId: null,
  avatarFile: null,
  resumeFileId: null,
  resumeFile: null,
})

const rules = {
  name: [required('Full name')],
  email: [email()],
}

const loadProfile = createDataLoader({
  loading,
  data: formData,
  service: profileService.getProfile,
  entityName: 'profile',
  message,
  transform: (data) => ({
    id: data.id,
    name: data.name || '',
    title: data.title || '',
    tagline: data.tagline || '',
    email: data.email || '',
    phone: data.phone || '',
    location: data.location || '',
    avatarFileId: data.avatarFileId || null,
    avatarFile: data.avatarFile || null,
    resumeFileId: data.resumeFileId || null,
    resumeFile: data.resumeFile || null,
  }),
})

async function handleSave() {
  if (!(await validateForm(formRef))) return

  saving.value = true
  try {
    await profileService.updateProfile(formData.value)
    message.success('Profile updated successfully')
  } catch (error) {
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
    formData.value.avatarFile = null
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
    formData.value.resumeFile = null
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

async function handleAvatarSelect({ file }) {
  // Read the file and show cropper modal
  const reader = new window.FileReader()
  reader.onload = (e) => {
    selectedImageSrc.value = e.target.result
    selectedImageFile.value = file.file
    showCropperModal.value = true
  }
  reader.readAsDataURL(file.file)
  return { file }
}

async function handleAvatarCrop(croppedBlob) {
  uploadingAvatar.value = true
  showCropperModal.value = false

  try {
    // Create a File object from the blob
    const croppedFile = new window.File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' })

    const uploadResponse = await filesService.uploadFile(croppedFile, 'portfolio-image')
    const fileId = uploadResponse.data.id

    await profileService.updateProfileAvatar(fileId)

    logger.info('Avatar uploaded successfully', { fileId })
    message.success('Avatar uploaded successfully')

    // Reload profile to get the updated file object with URL
    await loadProfile()
  } catch (error) {
    logger.error('Failed to upload avatar', {
      error: error.message,
      status: error.response?.status,
    })
    message.error('Failed to upload avatar')
  } finally {
    uploadingAvatar.value = false
    selectedImageSrc.value = ''
    selectedImageFile.value = null
    avatarFileList.value = []
  }
}

function handleCropperCancel() {
  selectedImageSrc.value = ''
  selectedImageFile.value = null
  avatarFileList.value = []
}

async function handleResumeUpload({ file }) {
  uploadingResume.value = true
  try {
    const uploadResponse = await filesService.uploadFile(file.file, 'document')
    const fileId = uploadResponse.data.id

    await profileService.updateProfileResume(fileId)

    logger.info('Resume uploaded successfully', { fileId })
    message.success('Resume uploaded successfully')

    // Reload profile to get the updated file object with URL
    await loadProfile()

    return { file }
  } catch (error) {
    logger.error('Failed to upload resume', {
      error: error.message,
      status: error.response?.status,
    })
    message.error('Failed to upload resume')
    return false
  } finally {
    uploadingResume.value = false
    resumeFileList.value = []
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
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

.file-info {
  font-size: 12px;
}

.upload-icon {
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
}

.upload-hint {
  font-size: 12px;
  margin-top: 8px;
}
</style>
