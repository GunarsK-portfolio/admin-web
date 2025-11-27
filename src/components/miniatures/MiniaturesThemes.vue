<template>
  <n-space vertical :size="16">
    <n-space justify="space-between">
      <SearchInput
        v-model="search"
        placeholder="Search themes..."
        aria-label="Search miniature themes"
      />
      <AddButton label="Add Theme" @click="openModal" />
    </n-space>

    <n-spin :show="loading" aria-label="Loading themes">
      <n-data-table :columns="columns" :data="filteredThemes" :pagination="{ pageSize: 10 }" />
    </n-spin>
  </n-space>

  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="editing ? 'Edit Theme' : 'Add Theme'"
    class="modal-medium"
  >
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
      <n-form-item label="Theme Name" path="name">
        <n-input v-model:value="form.name" placeholder="Enter theme name" />
      </n-form-item>

      <n-form-item label="Description" path="description">
        <n-input
          v-model:value="form.description"
          type="textarea"
          placeholder="Enter theme description"
          :autosize="{ minRows: 3, maxRows: 6 }"
        />
      </n-form-item>

      <n-form-item label="Cover Image" path="coverImageId">
        <n-space vertical class="full-width">
          <div v-if="currentCoverImage">
            <n-space vertical align="center">
              <n-avatar
                :size="120"
                :src="addSourceToFileUrl(currentCoverImage.fileUrl || currentCoverImage.url)"
              />
              <n-text depth="3" class="file-info">
                {{ currentCoverImage.fileName }} ({{ formatFileSize(currentCoverImage.fileSize) }})
              </n-text>
              <n-button
                size="small"
                type="error"
                :loading="deletingCoverImage"
                @click="handleRemoveCoverImage"
              >
                <template #icon>
                  <n-icon><TrashOutline /></n-icon>
                </template>
                Remove Image
              </n-button>
            </n-space>
          </div>
          <n-upload
            v-model:file-list="coverImageFileList"
            :custom-request="handleCoverImageUpload"
            :before-upload="validateCoverImage"
            :show-file-list="false"
            :max="1"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            :disabled="uploadingCoverImage"
          >
            <n-upload-dragger>
              <div class="upload-icon">
                <n-icon size="48" :depth="3">
                  <CloudUploadOutline />
                </n-icon>
              </div>
              <n-text class="upload-text">
                {{
                  currentCoverImage
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

      <n-form-item label="Display Order" path="displayOrder">
        <n-input-number
          v-model:value="form.displayOrder"
          :min="0"
          placeholder="Order (0 = first)"
          class="full-width"
        />
      </n-form-item>
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
  NUpload,
  NUploadDragger,
  NIcon,
  NText,
  NAvatar,
  NButton,
} from 'naive-ui'
import { CreateOutline, TrashOutline, CloudUploadOutline } from '@vicons/ionicons5'
import miniaturesService from '../../services/miniatures'
import filesService from '../../services/files'
import { required, validateForm } from '../../utils/validation'
import { addSourceToFileUrl } from '../../utils/fileUrl'
import {
  formatFileSize,
  FILE_VALIDATION,
  createFileValidator,
  createFileUploadHandler,
  createFileDeleteHandler,
} from '../../utils/fileHelpers'
import { createActionsRenderer, stringSorter, numberSorter } from '../../utils/tableHelpers'
import { createSearchFilter } from '../../utils/filterHelpers'
import { createDataLoader, createSaveHandler, createDeleteHandler } from '../../utils/crudHelpers'
import { logger } from '../../utils/logger'
import { useViewServices } from '../../composables/useViewServices'
import { useModal } from '../../composables/useModal'
import { useDataState } from '../../composables/useDataState'
import SearchInput from '../shared/SearchInput.vue'
import AddButton from '../shared/AddButton.vue'
import ModalFooter from '../shared/ModalFooter.vue'

// Services
const { message, dialog } = useViewServices()

// Data state
const { data: themes, loading, search } = useDataState()

// Modal state
const { showModal, editing, form, formRef, openModal, closeModal, openEditModal, resetForm } =
  useModal({
    name: '',
    description: '',
    coverImageId: null,
    displayOrder: 0,
  })

// Saving state
const saving = ref(false)

// Cover image upload state
const uploadingCoverImage = ref(false)
const deletingCoverImage = ref(false)
const coverImageFileList = ref([])
const currentCoverImage = computed(() => editing.value?.coverImageFile || null)

const rules = {
  name: [required('Theme name')],
}

const filteredThemes = createSearchFilter(themes, search, ['name', 'description'])

const loadThemes = createDataLoader({
  loading,
  data: themes,
  service: miniaturesService.getAllThemes,
  entityName: 'themes',
  message,
})

function handleEdit(theme) {
  openEditModal(theme, (t) => ({
    name: t.name,
    description: t.description || '',
    coverImageId: t.coverImageId ?? null,
    displayOrder: t.displayOrder || 0,
  }))
}

const handleCoverImageUpload = createFileUploadHandler({
  uploading: uploadingCoverImage,
  fileList: coverImageFileList,
  form,
  editing,
  service: filesService.uploadFile,
  message,
  fileType: 'miniature-image',
  fileIdField: 'coverImageId',
  fileObjectField: 'coverImageFile',
  logger,
})

const handleRemoveCoverImage = createFileDeleteHandler({
  deleting: deletingCoverImage,
  form,
  editing,
  service: filesService.deleteFile,
  message,
  fileIdField: 'coverImageId',
  fileObjectField: 'coverImageFile',
  entityName: 'cover image',
  logger,
})

const validateCoverImage = createFileValidator(FILE_VALIDATION.IMAGE, message)

const handleSave = createSaveHandler({
  formRef,
  saving,
  editing,
  form,
  showModal,
  service: {
    create: miniaturesService.createTheme,
    update: miniaturesService.updateTheme,
  },
  entityName: 'Theme',
  message,
  onSuccess: loadThemes,
  resetForm: () => resetForm(),
  validateForm,
  transformPayload: (formData) => ({
    name: formData.name,
    description: formData.description || undefined,
    coverImageId: formData.coverImageId ?? undefined,
    displayOrder: formData.displayOrder || 0,
  }),
})

const handleDelete = createDeleteHandler({
  dialog,
  service: miniaturesService.deleteTheme,
  entityName: 'Theme',
  message,
  onSuccess: loadThemes,
  getConfirmText: (theme) => `"${theme.name}"`,
})

const columns = [
  { title: 'Name', key: 'name', sorter: stringSorter('name') },
  { title: 'Description', key: 'description' },
  { title: 'Order', key: 'displayOrder', width: 100, sorter: numberSorter('displayOrder') },
  {
    title: 'Actions',
    key: 'actions',
    render: createActionsRenderer([
      { icon: CreateOutline, onClick: handleEdit, label: 'Edit theme' },
      { icon: TrashOutline, onClick: handleDelete, type: 'error', label: 'Delete theme' },
    ]),
  },
]

onMounted(() => {
  loadThemes()
})
</script>
