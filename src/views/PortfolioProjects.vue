<template>
  <div class="page">
    <n-space vertical size="large" class="page-container">
      <BackButton />

      <n-page-header
        title="Portfolio Projects"
        subtitle="Manage your professional software development projects"
      />

      <n-card>
        <n-space vertical size="large">
          <n-space justify="space-between">
            <SearchInput
              v-model="search"
              placeholder="Search projects by title, category, role..."
              aria-label="Search portfolio projects"
            />
            <AddButton label="Add Project" @click="openModal" />
          </n-space>

          <n-spin :show="loading" aria-label="Loading projects">
            <n-data-table
              :columns="columns"
              :data="filteredProjects"
              :pagination="{ pageSize: 10 }"
            />
          </n-spin>
        </n-space>
      </n-card>
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
            <n-form-item label="Project Title" path="title">
              <n-input
                v-model:value="form.title"
                placeholder="Enter project title"
                maxlength="200"
                show-count
              />
            </n-form-item>

            <n-grid :cols="2" :x-gap="16">
              <n-form-item-gi label="Category" path="category">
                <n-select
                  v-model:value="form.category"
                  :options="categoryOptions"
                  placeholder="Select category"
                  clearable
                />
              </n-form-item-gi>

              <n-form-item-gi label="Role" path="role">
                <n-input
                  v-model:value="form.role"
                  placeholder="e.g., Full Stack Developer"
                  maxlength="100"
                />
              </n-form-item-gi>
            </n-grid>

            <n-form-item label="Short Description" path="description">
              <n-input
                v-model:value="form.description"
                type="textarea"
                placeholder="1-2 sentence summary (max 500 characters)"
                :autosize="{ minRows: 2, maxRows: 4 }"
                maxlength="500"
                show-count
              />
            </n-form-item>

            <n-form-item label="Detailed Description (Markdown)" path="longDescription">
              <n-input
                v-model:value="form.longDescription"
                type="textarea"
                placeholder="Detailed project description with markdown support"
                :autosize="{ minRows: 4, maxRows: 10 }"
              />
            </n-form-item>
          </n-collapse-item>

          <!-- Links & Media Section -->
          <n-collapse-item title="Links & Media" name="links">
            <n-grid :cols="2" :x-gap="16">
              <n-form-item-gi
                label="GitHub URL"
                path="githubUrl"
                :validation-status="getUrlValidation(form.githubUrl)"
              >
                <n-input v-model:value="form.githubUrl" placeholder="https://github.com/..." />
              </n-form-item-gi>

              <n-form-item-gi
                label="Live Demo URL"
                path="liveUrl"
                :validation-status="getUrlValidation(form.liveUrl)"
              >
                <n-input v-model:value="form.liveUrl" placeholder="https://..." />
              </n-form-item-gi>
            </n-grid>

            <n-form-item label="Project Image" path="imageFileId">
              <n-space vertical class="full-width">
                <div v-if="currentProjectImage">
                  <n-space vertical align="center">
                    <n-avatar
                      :size="120"
                      :src="
                        addSourceToFileUrl(currentProjectImage.fileUrl || currentProjectImage.url)
                      "
                    />
                    <n-text depth="3" class="file-info">
                      {{ currentProjectImage.fileName }} ({{
                        formatFileSize(currentProjectImage.fileSize)
                      }})
                    </n-text>
                    <n-button
                      size="small"
                      type="error"
                      :loading="deletingImage"
                      @click="handleRemoveImage"
                    >
                      <template #icon>
                        <n-icon><TrashOutline /></n-icon>
                      </template>
                      Remove Image
                    </n-button>
                  </n-space>
                </div>
                <n-upload
                  v-model:file-list="imageFileList"
                  :custom-request="handleImageUpload"
                  :before-upload="createFileValidator(FILE_VALIDATION.IMAGE, message)"
                  :show-file-list="false"
                  :max="1"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  :disabled="uploadingImage"
                >
                  <n-upload-dragger>
                    <div class="upload-icon">
                      <n-icon size="48" :depth="3">
                        <CloudUploadOutline />
                      </n-icon>
                    </div>
                    <n-text class="upload-text">
                      {{
                        currentProjectImage
                          ? 'Click or drag to replace image'
                          : 'Click or drag image to this area to upload'
                      }}
                    </n-text>
                    <n-text depth="3" class="upload-hint">
                      Supported formats: JPEG, PNG, GIF, WebP (Max 10MB)
                    </n-text>
                  </n-upload-dragger>
                </n-upload>
              </n-space>
            </n-form-item>
          </n-collapse-item>

          <!-- Timeline Section -->
          <n-collapse-item title="Timeline" name="timeline">
            <n-grid :cols="3" :x-gap="16">
              <n-form-item-gi label="Start Date" path="startDate">
                <n-date-picker
                  v-model:formatted-value="form.startDate"
                  type="date"
                  value-format="yyyy-MM-dd"
                  class="full-width"
                  clearable
                />
              </n-form-item-gi>

              <n-form-item-gi label="End Date" path="endDate">
                <n-date-picker
                  v-model:formatted-value="form.endDate"
                  type="date"
                  value-format="yyyy-MM-dd"
                  class="full-width"
                  :disabled="form.isOngoing"
                  clearable
                />
              </n-form-item-gi>

              <n-form-item-gi label="Ongoing" path="isOngoing">
                <n-switch v-model:value="form.isOngoing" />
              </n-form-item-gi>
            </n-grid>
          </n-collapse-item>

          <!-- Project Metadata Section -->
          <n-collapse-item title="Metadata" name="metadata">
            <n-form-item label="Technologies" path="technologies">
              <n-select
                v-model:value="form.technologies"
                :options="skillOptions"
                placeholder="Select technologies used"
                multiple
                filterable
                tag
              />
            </n-form-item>

            <n-grid :cols="3" :x-gap="16">
              <n-form-item-gi label="Team Size" path="teamSize">
                <n-input-number
                  v-model:value="form.teamSize"
                  :min="1"
                  :style="{ width: '150px' }"
                  placeholder="Number of team members"
                  clearable
                />
              </n-form-item-gi>

              <n-form-item-gi label="Display Order" path="displayOrder">
                <n-input-number
                  v-model:value="form.displayOrder"
                  :min="0"
                  :style="{ width: '150px' }"
                  placeholder="Order"
                />
              </n-form-item-gi>

              <n-form-item-gi label="Featured" path="featured">
                <n-switch v-model:value="form.featured" />
              </n-form-item-gi>
            </n-grid>
          </n-collapse-item>

          <!-- Project Details Section -->
          <n-collapse-item title="Project Details" name="details">
            <n-form-item label="Key Features" path="features">
              <n-dynamic-input
                v-model:value="form.features"
                :on-create="() => ''"
                placeholder="Add a key feature"
              />
            </n-form-item>

            <n-form-item label="Technical Challenges" path="challenges">
              <n-dynamic-input
                v-model:value="form.challenges"
                :on-create="() => ''"
                placeholder="Add a technical challenge"
              />
            </n-form-item>

            <n-form-item label="Learnings & Takeaways" path="learnings">
              <n-dynamic-input
                v-model:value="form.learnings"
                :on-create="() => ''"
                placeholder="Add a learning or takeaway"
              />
            </n-form-item>
          </n-collapse-item>
        </n-collapse>
      </n-form>

      <template #footer>
        <ModalFooter :loading="saving" :editing="editing" @cancel="closeModal" @save="handleSave" />
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  NSpace,
  NPageHeader,
  NCard,
  NDataTable,
  NSpin,
  NModal,
  NForm,
  NFormItem,
  NFormItemGi,
  NGrid,
  NInput,
  NInputNumber,
  NSelect,
  NDatePicker,
  NSwitch,
  NDynamicInput,
  NUpload,
  NUploadDragger,
  NIcon,
  NText,
  NAvatar,
  NButton,
  NCollapse,
  NCollapseItem,
} from 'naive-ui'
import { CreateOutline, TrashOutline, CloudUploadOutline } from '@vicons/ionicons5'
import BackButton from '../components/shared/BackButton.vue'
import SearchInput from '../components/shared/SearchInput.vue'
import AddButton from '../components/shared/AddButton.vue'
import ModalFooter from '../components/shared/ModalFooter.vue'
import portfolioProjectsService from '../services/portfolioProjects'
import skillsService from '../services/skills'
import filesService from '../services/files'
import { required, validateForm } from '../utils/validation'
import { addSourceToFileUrl } from '../utils/fileUrl'
import {
  formatFileSize,
  FILE_VALIDATION,
  createFileValidator,
  createFileUploadHandler,
  createFileDeleteHandler,
} from '../utils/fileHelpers'
import { createActionsRenderer, stringSorter, numberSorter } from '../utils/tableHelpers'
import { toDateFormat } from '../utils/dateHelpers'
import { createSearchFilter } from '../utils/filterHelpers'
import { createDataLoader, createSaveHandler, createDeleteHandler } from '../utils/crudHelpers'
import { logger } from '../utils/logger'
import { useViewServices } from '../composables/useViewServices'
import { useModal } from '../composables/useModal'
import { useDataState } from '../composables/useDataState'

// Services
const { message, dialog } = useViewServices()

// Data state
const { data: projects, loading, search } = useDataState()

// Skills data for technologies selector
const skills = ref([])
const loadingSkills = ref(false)

// Modal state
const { showModal, editing, form, formRef, openModal, closeModal, openEditModal, resetForm } =
  useModal({
    title: '',
    category: null,
    description: '',
    longDescription: '',
    githubUrl: '',
    liveUrl: '',
    imageFileId: null,
    startDate: null,
    endDate: null,
    isOngoing: false,
    teamSize: null,
    role: '',
    featured: false,
    features: [],
    challenges: [],
    learnings: [],
    technologies: [],
    displayOrder: 0,
  })

// Saving state
const saving = ref(false)

// Image upload state
const uploadingImage = ref(false)
const deletingImage = ref(false)
const imageFileList = ref([])
const currentProjectImage = computed(() => editing.value?.imageFile || null)

// Computed
const skillOptions = computed(() =>
  skills.value.map((skill) => ({
    label: skill.skill,
    value: Number(skill.id),
  }))
)

// URL validation helper
function getUrlValidation(url) {
  if (!url || url.trim() === '') return undefined
  try {
    new URL(url)
    return 'success'
  } catch {
    return 'error'
  }
}

const categoryOptions = [
  { label: 'Web Application', value: 'Web Application' },
  { label: 'Mobile Application', value: 'Mobile Application' },
  { label: 'CLI Tool', value: 'CLI Tool' },
  { label: 'Library/Package', value: 'Library/Package' },
  { label: 'API/Backend Service', value: 'API/Backend Service' },
  { label: 'Desktop Application', value: 'Desktop Application' },
  { label: 'DevOps/Infrastructure', value: 'DevOps/Infrastructure' },
  { label: 'Data Engineering', value: 'Data Engineering' },
  { label: 'Machine Learning', value: 'Machine Learning' },
  { label: 'Other', value: 'Other' },
]

const rules = {
  title: [required('Project title')],
}

const filteredProjects = createSearchFilter(projects, search, [
  'title',
  'category',
  'description',
  'role',
])

const loadProjects = createDataLoader({
  loading,
  data: projects,
  service: portfolioProjectsService.getAllProjects,
  entityName: 'projects',
  message,
})

const loadSkills = createDataLoader({
  loading: loadingSkills,
  data: skills,
  service: skillsService.getAllSkills,
  entityName: 'skills',
  message,
})

function handleEdit(project) {
  openEditModal(project, (p) => ({
    title: p.title,
    category: p.category ?? null,
    description: p.description ?? '',
    longDescription: p.longDescription ?? '',
    githubUrl: p.githubUrl ?? '',
    liveUrl: p.liveUrl ?? '',
    imageFileId: p.imageFileId ?? null,
    startDate: toDateFormat(p.startDate),
    endDate: toDateFormat(p.endDate),
    isOngoing: p.isOngoing ?? false,
    teamSize: p.teamSize ?? null,
    role: p.role ?? '',
    featured: p.featured ?? false,
    features: p.features ?? [],
    challenges: p.challenges ?? [],
    learnings: p.learnings ?? [],
    technologies: p.technologies?.map((t) => Number(t.id)) ?? [],
    displayOrder: p.displayOrder ?? 0,
  }))
}

// Clear endDate when isOngoing is toggled on
watch(
  () => form.value.isOngoing,
  (isOngoing) => {
    if (isOngoing) {
      form.value.endDate = null
    }
  }
)

const handleImageUpload = createFileUploadHandler({
  uploading: uploadingImage,
  fileList: imageFileList,
  form,
  editing,
  service: filesService.uploadFile,
  message,
  fileType: 'portfolio-image',
  fileIdField: 'imageFileId',
  fileObjectField: 'imageFile',
  logger,
})

const handleRemoveImage = createFileDeleteHandler({
  deleting: deletingImage,
  form,
  editing,
  service: filesService.deleteFile,
  message,
  fileIdField: 'imageFileId',
  fileObjectField: 'imageFile',
  entityName: 'image',
  logger,
})

const handleSave = createSaveHandler({
  formRef,
  saving,
  editing,
  form,
  showModal,
  service: {
    create: portfolioProjectsService.createProject,
    update: portfolioProjectsService.updateProject,
  },
  entityName: 'Project',
  message,
  onSuccess: loadProjects,
  resetForm: () => resetForm(),
  validateForm,
  transformPayload: (formData) => ({
    title: formData.title,
    category: formData.category ?? undefined,
    description: formData.description ?? undefined,
    longDescription: formData.longDescription ?? undefined,
    githubUrl: formData.githubUrl ?? undefined,
    liveUrl: formData.liveUrl ?? undefined,
    imageFileId: formData.imageFileId ?? undefined,
    startDate: formData.startDate ?? undefined,
    endDate: formData.isOngoing ? undefined : (formData.endDate ?? undefined),
    isOngoing: formData.isOngoing,
    teamSize: formData.teamSize ?? undefined,
    role: formData.role ?? undefined,
    featured: formData.featured,
    features: formData.features?.filter((f) => f && f.trim()) ?? [],
    challenges: formData.challenges?.filter((c) => c && c.trim()) ?? [],
    learnings: formData.learnings?.filter((l) => l && l.trim()) ?? [],
    technologies: formData.technologies ?? [],
    displayOrder: formData.displayOrder ?? 0,
  }),
})

const handleDelete = createDeleteHandler({
  dialog,
  service: portfolioProjectsService.deleteProject,
  entityName: 'Project',
  message,
  onSuccess: loadProjects,
  getConfirmText: (project) => `"${project.title}"`,
})

const columns = [
  { title: 'Title', key: 'title', sorter: stringSorter('title'), width: 200 },
  { title: 'Category', key: 'category', width: 150 },
  { title: 'Role', key: 'role', width: 150 },
  {
    title: 'Period',
    key: 'period',
    width: 150,
    render: (row) => {
      const start = toDateFormat(row.startDate, 'N/A')
      const end = row.isOngoing ? 'Present' : toDateFormat(row.endDate, 'N/A')
      return `${start} - ${end}`
    },
  },
  {
    title: 'Featured',
    key: 'featured',
    width: 90,
    render: (row) => (row.featured ? '⭐' : '—'),
  },
  { title: 'Order', key: 'displayOrder', width: 80, sorter: numberSorter('displayOrder') },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    render: createActionsRenderer([
      { icon: CreateOutline, onClick: handleEdit, label: 'Edit project' },
      { icon: TrashOutline, onClick: handleDelete, type: 'error', label: 'Delete project' },
    ]),
  },
]

onMounted(() => {
  loadProjects()
  loadSkills()
})
</script>

<style scoped>
.upload-icon {
  margin-bottom: 8px;
}

.upload-text {
  font-size: 16px;
}

.upload-hint {
  font-size: 12px;
  margin-top: 8px;
  display: block;
}
</style>
