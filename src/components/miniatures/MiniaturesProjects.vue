<template>
  <n-space vertical :size="16">
    <n-space justify="space-between">
      <SearchInput
        v-model="search"
        placeholder="Search projects..."
        aria-label="Search miniature projects"
      />
      <AddButton label="Add Project" @click="openModal" />
    </n-space>

    <n-spin :show="loading" aria-label="Loading miniature projects">
      <n-data-table :columns="columns" :data="filteredProjects" :pagination="{ pageSize: 10 }" />
    </n-spin>
  </n-space>

  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="editing ? 'Edit Project' : 'Add Project'"
    class="modal-large"
  >
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
      <n-collapse :default-expanded-names="['basic']">
        <!-- Basic Information Section -->
        <n-collapse-item title="Basic Information" name="basic">
          <n-form-item label="Project Title" path="name">
            <n-input v-model:value="form.name" placeholder="Enter project title" />
          </n-form-item>

          <n-form-item label="Theme" path="themeId">
            <n-select
              v-model:value="form.themeId"
              :options="themeOptions"
              placeholder="Select theme (optional)"
              class="full-width"
              clearable
            />
          </n-form-item>

          <n-form-item label="Description" path="description">
            <n-input
              v-model:value="form.description"
              type="textarea"
              placeholder="Enter project description"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
          </n-form-item>
        </n-collapse-item>

        <!-- Project Details Section -->
        <n-collapse-item title="Project Details" name="details">
          <n-grid :cols="2" :x-gap="16">
            <n-form-item-gi label="Scale" path="scale">
              <n-input v-model:value="form.scale" placeholder="e.g., 28mm, 1:35" />
            </n-form-item-gi>

            <n-form-item-gi label="Manufacturer" path="manufacturer">
              <n-input v-model:value="form.manufacturer" placeholder="e.g., Games Workshop" />
            </n-form-item-gi>
          </n-grid>

          <n-grid :cols="2" :x-gap="16">
            <n-form-item-gi label="Difficulty" path="difficulty">
              <n-select
                v-model:value="form.difficulty"
                :options="difficultyOptions"
                placeholder="Select difficulty"
                class="full-width"
                clearable
              />
            </n-form-item-gi>

            <n-form-item-gi label="Time Spent (hours)" path="timeSpent">
              <n-input-number
                v-model:value="form.timeSpent"
                :min="0"
                :step="0.5"
                placeholder="Hours"
                class="full-width"
              />
            </n-form-item-gi>
          </n-grid>
        </n-collapse-item>

        <!-- Metadata Section -->
        <n-collapse-item title="Metadata" name="metadata">
          <n-grid :cols="2" :x-gap="16">
            <n-form-item-gi label="Completed Date" path="completedDate">
              <n-date-picker
                v-model:formatted-value="form.completedDate"
                type="date"
                value-format="yyyy-MM-dd"
                class="full-width"
                clearable
              />
            </n-form-item-gi>

            <n-form-item-gi label="Display Order" path="displayOrder">
              <n-input-number
                v-model:value="form.displayOrder"
                :min="0"
                placeholder="Order"
                class="full-width"
              />
            </n-form-item-gi>
          </n-grid>
        </n-collapse-item>

        <!-- Images Section (only for editing existing projects) -->
        <n-collapse-item v-if="editing" title="Project Images" name="images">
          <n-space vertical :size="16">
            <!-- Image Gallery -->
            <div v-if="projectImages.length > 0" class="image-gallery">
              <n-space :size="12">
                <div v-for="image in projectImages" :key="image.id" class="image-card">
                  <n-image
                    :src="image.url"
                    :alt="image.caption || `${form.name || 'Miniature'} project image`"
                    object-fit="cover"
                    height="120"
                    width="120"
                  />
                  <div class="image-actions">
                    <n-button
                      size="small"
                      type="error"
                      :loading="deletingImage === image.id"
                      @click="handleDeleteImage(image.id)"
                    >
                      <template #icon>
                        <n-icon><TrashOutline /></n-icon>
                      </template>
                    </n-button>
                  </div>
                  <div v-if="image.caption" class="image-caption">
                    {{ image.caption }}
                  </div>
                </div>
              </n-space>
            </div>
            <n-empty v-else description="No images uploaded yet" size="small" />

            <!-- Upload Section -->
            <n-upload
              v-model:file-list="fileList"
              :custom-request="handleImageUpload"
              :before-upload="validateImageFile"
              :show-file-list="false"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              :disabled="uploadingImage"
              multiple
            >
              <n-upload-dragger>
                <div class="upload-icon">
                  <n-icon size="48" :depth="3">
                    <CloudUploadOutline />
                  </n-icon>
                </div>
                <n-text class="upload-text"> Click or drag images to upload </n-text>
                <n-text depth="3" class="upload-hint">
                  Supported formats: JPEG, PNG, GIF, WebP (Max 10MB)
                </n-text>
              </n-upload-dragger>
            </n-upload>
          </n-space>
        </n-collapse-item>
      </n-collapse>
    </n-form>

    <template #footer>
      <ModalFooter :loading="saving" :editing="editing" @cancel="closeModal" @save="handleSave" />
    </template>
  </n-modal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  NSpace,
  NSpin,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NDatePicker,
  NCollapse,
  NCollapseItem,
  NGrid,
  NFormItemGi,
  NUpload,
  NUploadDragger,
  NImage,
  NEmpty,
  NButton,
  NIcon,
  NText,
} from 'naive-ui'
import { CreateOutline, TrashOutline, CloudUploadOutline } from '@vicons/ionicons5'
import filesService from '../../services/files'
import miniaturesService from '../../services/miniatures'
import { required, validateForm } from '../../utils/validation'
import { createActionsRenderer, stringSorter, numberSorter } from '../../utils/tableHelpers'
import { toDateFormat } from '../../utils/dateHelpers'
import { createSearchFilter } from '../../utils/filterHelpers'
import { createDataLoader, createSaveHandler, createDeleteHandler } from '../../utils/crudHelpers'
import { createFileValidator, FILE_VALIDATION } from '../../utils/fileHelpers'
import { useViewServices } from '../../composables/useViewServices'
import { useModal } from '../../composables/useModal'
import { useDataState } from '../../composables/useDataState'
import SearchInput from '../shared/SearchInput.vue'
import AddButton from '../shared/AddButton.vue'
import ModalFooter from '../shared/ModalFooter.vue'

// Services
const { message, dialog } = useViewServices()

// Data state
const { data: projects, loading, search } = useDataState()
const themes = ref([])

// Modal state
const { showModal, editing, form, formRef, openModal, closeModal, openEditModal, resetForm } =
  useModal({
    name: '',
    themeId: null,
    description: '',
    scale: '',
    manufacturer: '',
    difficulty: null,
    timeSpent: null,
    completedDate: null,
    displayOrder: 0,
  })

// Saving state
const saving = ref(false)

// Image state
const projectImages = computed(() => editing.value?.images || [])
const uploadingImage = ref(false)
const deletingImage = ref(null)
const fileList = ref([])

// Image validation
const validateImageFile = createFileValidator(FILE_VALIDATION.IMAGE, message)

const difficultyOptions = [
  { label: 'Beginner', value: 'Beginner' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Advanced', value: 'Advanced' },
  { label: 'Expert', value: 'Expert' },
]

const themeOptions = computed(() => themes.value.map((t) => ({ label: t.name, value: t.id })))

const rules = {
  name: [required('Project title')],
}

const filteredProjects = createSearchFilter(projects, search, [
  'name',
  'description',
  'scale',
  'manufacturer',
  'difficulty',
])

const loadProjects = createDataLoader({
  loading,
  data: projects,
  service: miniaturesService.getAllProjects,
  entityName: 'projects',
  message,
})

const loadThemes = async () => {
  try {
    const response = await miniaturesService.getAllThemes()
    themes.value = response.data || []
  } catch (error) {
    console.error('Failed to load themes:', error)
  }
}

function handleEdit(project) {
  openEditModal(project, (p) => ({
    name: p.name,
    themeId: p.themeId ?? null,
    description: p.description ?? '',
    scale: p.scale ?? '',
    manufacturer: p.manufacturer ?? '',
    difficulty: p.difficulty ?? null,
    timeSpent: p.timeSpent ?? null,
    completedDate: toDateFormat(p.completedDate),
    displayOrder: p.displayOrder ?? 0,
  }))
}

const handleSave = createSaveHandler({
  formRef,
  saving,
  editing,
  form,
  showModal,
  service: {
    create: miniaturesService.createProject,
    update: miniaturesService.updateProject,
  },
  entityName: 'Project',
  message,
  onSuccess: loadProjects,
  resetForm: () => resetForm(),
  validateForm,
  transformPayload: (formData) => ({
    ...formData,
    themeId: formData.themeId ?? undefined,
    description: formData.description ?? undefined,
    scale: formData.scale ?? undefined,
    manufacturer: formData.manufacturer ?? undefined,
    difficulty: formData.difficulty ?? undefined,
    timeSpent: formData.timeSpent ?? undefined,
    completedDate: formData.completedDate ?? undefined,
    displayOrder: formData.displayOrder ?? 0,
  }),
})

const handleDelete = createDeleteHandler({
  dialog,
  service: miniaturesService.deleteProject,
  entityName: 'Project',
  message,
  onSuccess: loadProjects,
  getConfirmText: (project) => `"${project.name}"`,
})

// Image handlers
async function refreshProject(projectId) {
  const response = await miniaturesService.getProjectById(projectId)
  const updatedProject = response.data

  // Update project in local list
  const index = projects.value.findIndex((p) => p.id === projectId)
  if (index !== -1) {
    projects.value[index] = updatedProject
  }

  // Update editing object if this is the currently edited project
  if (editing.value?.id === projectId) {
    editing.value = updatedProject
  }

  return updatedProject
}

async function handleImageUpload({ file }) {
  if (!editing.value) return

  uploadingImage.value = true
  try {
    // Upload file to files-api
    const uploadResponse = await filesService.uploadFile(file.file, 'miniature-image')
    const fileId = uploadResponse.data.id

    // Link uploaded file to project
    await miniaturesService.addImageToProject(editing.value.id, fileId)

    message.success('Image uploaded successfully')

    // Refresh only the updated project
    await refreshProject(editing.value.id)

    // Clear the file list to prevent re-upload
    fileList.value = []
  } catch (error) {
    console.error('Failed to upload image:', error)
    message.error(error.response?.data?.error || 'Failed to upload image')
  } finally {
    uploadingImage.value = false
  }
}

async function handleDeleteImage(imageId) {
  deletingImage.value = imageId
  try {
    await miniaturesService.deleteProjectImage(imageId)
    message.success('Image deleted successfully')

    // Refresh only the updated project
    await refreshProject(editing.value.id)
  } catch (error) {
    console.error('Failed to delete image:', error)
    message.error(error.response?.data?.error || 'Failed to delete image')
  } finally {
    deletingImage.value = null
  }
}

const columns = [
  { title: 'Title', key: 'name', sorter: stringSorter('name') },
  { title: 'Theme', key: 'theme.name', render: (row) => row.theme?.name ?? '—' },
  { title: 'Scale', key: 'scale' },
  { title: 'Difficulty', key: 'difficulty' },
  {
    title: 'Completed',
    key: 'completedDate',
    render: (row) => toDateFormat(row.completedDate, 'N/A'),
  },
  { title: 'Order', key: 'displayOrder', width: 80, sorter: numberSorter('displayOrder') },
  {
    title: 'Actions',
    key: 'actions',
    render: createActionsRenderer([
      { icon: CreateOutline, onClick: handleEdit, label: 'Edit project' },
      { icon: TrashOutline, onClick: handleDelete, type: 'error', label: 'Delete project' },
    ]),
  },
]

onMounted(() => {
  loadProjects()
  loadThemes()
})
</script>

<style scoped>
.image-gallery {
  width: 100%;
}

.image-card {
  position: relative;
  display: inline-block;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--n-border-color);
}

.image-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
}

.image-caption {
  padding: 4px 8px;
  font-size: 12px;
  background: var(--n-color-modal);
  border-top: 1px solid var(--n-border-color);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-icon {
  margin-bottom: 12px;
}

.upload-text {
  display: block;
  font-size: 16px;
  margin-bottom: 4px;
}

.upload-hint {
  display: block;
  font-size: 14px;
}
</style>
