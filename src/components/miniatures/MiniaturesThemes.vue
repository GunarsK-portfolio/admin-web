<template>
  <n-space vertical :size="16">
    <n-space justify="space-between">
      <SearchInput
        v-model="search"
        placeholder="Search themes..."
        aria-label="Search miniature themes"
      />
      <AddButton v-if="canEdit(Resource.MINIATURES)" label="Add Theme" @click="openModal" />
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
              <img
                :src="addSourceToFileUrl(currentCoverImage.fileUrl || currentCoverImage.url)"
                class="cover-preview"
                alt="Cover image preview"
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
            v-if="canEdit(Resource.MINIATURES)"
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
                Supported formats: JPEG, PNG, GIF, WebP (Max 10MB). Image will be cropped to 2:1
                ratio.
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
      <ModalFooter
        :loading="saving"
        :editing="editing"
        :can-save="canEdit(Resource.MINIATURES)"
        @cancel="closeModal"
        @save="handleSave"
      />
    </template>
  </n-modal>

  <ImageCropperModal
    v-model:show="showCropperModal"
    :image-src="selectedImageSrc"
    title="Crop Cover Image"
    confirm-text="Upload Cover Image"
    :aspect-ratio="2"
    @crop="handleCoverImageCrop"
    @cancel="handleCropperCancel"
  />
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
  NButton,
} from 'naive-ui'
import { CreateOutline, TrashOutline, CloudUploadOutline, EyeOutline } from '@vicons/ionicons5'
import miniaturesService from '../../services/miniatures'
import filesService from '../../services/files'
import { required, validateForm } from '../../utils/validation'
import { addSourceToFileUrl } from '../../utils/fileUrl'
import {
  formatFileSize,
  FILE_VALIDATION,
  createFileValidator,
  createFileDeleteHandler,
} from '../../utils/fileHelpers'
import { createActionsRenderer, stringSorter, numberSorter } from '../../utils/tableHelpers'
import { createSearchFilter } from '../../utils/filterHelpers'
import { createDataLoader, createSaveHandler, createDeleteHandler } from '../../utils/crudHelpers'
import { logger } from '../../utils/logger'
import { useViewServices } from '../../composables/useViewServices'
import { useModal } from '../../composables/useModal'
import { useDataState } from '../../composables/useDataState'
import { usePermissions } from '../../composables/usePermissions'
import SearchInput from '../shared/SearchInput.vue'
import AddButton from '../shared/AddButton.vue'
import ModalFooter from '../shared/ModalFooter.vue'
import ImageCropperModal from '../shared/ImageCropperModal.vue'

// Services
const { message, dialog } = useViewServices()
const { canRead, canEdit, canDelete, Resource } = usePermissions()

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

// Cropper state
const showCropperModal = ref(false)
const selectedImageSrc = ref('')

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

// Open cropper when image is selected
function handleCoverImageUpload({ file }) {
  const reader = new window.FileReader()
  reader.onload = (e) => {
    selectedImageSrc.value = e.target.result
    showCropperModal.value = true
  }
  reader.readAsDataURL(file.file)
  return { file }
}

// Handle cropped image upload
async function handleCoverImageCrop(croppedBlob) {
  if (!canEdit(Resource.MINIATURES)) {
    message.error('You do not have permission to upload images')
    return
  }
  uploadingCoverImage.value = true
  showCropperModal.value = false

  try {
    const croppedFile = new window.File([croppedBlob], 'cover.jpg', { type: 'image/jpeg' })
    const uploadResponse = await filesService.uploadFile(croppedFile, 'miniature-image')
    const fileData = uploadResponse.data

    form.value.coverImageId = fileData.id
    if (editing.value) {
      editing.value.coverImageFile = fileData
    } else {
      // For new entities, create temporary editing object to show the file preview
      editing.value = { coverImageFile: fileData }
    }

    logger.info('Cover image uploaded successfully', { fileId: fileData.id })
    message.success('Cover image uploaded successfully')
  } catch (error) {
    logger.error('Failed to upload cover image', {
      error: error.message,
      status: error.response?.status,
    })
    message.error('Failed to upload cover image')
  } finally {
    uploadingCoverImage.value = false
    selectedImageSrc.value = ''
    coverImageFileList.value = []
  }
}

function handleCropperCancel() {
  selectedImageSrc.value = ''
  coverImageFileList.value = []
}

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
  checkPermission: () => canEdit(Resource.MINIATURES),
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
  checkPermission: () => canEdit(Resource.MINIATURES),
})

const handleDelete = createDeleteHandler({
  dialog,
  service: miniaturesService.deleteTheme,
  entityName: 'Theme',
  message,
  onSuccess: loadThemes,
  getConfirmText: (theme) => `"${theme.name}"`,
  checkPermission: () => canDelete(Resource.MINIATURES),
})

const columns = computed(() => {
  const cols = [
    { title: 'Name', key: 'name', sorter: stringSorter('name') },
    { title: 'Description', key: 'description' },
    { title: 'Order', key: 'displayOrder', width: 100, sorter: numberSorter('displayOrder') },
  ]

  const actions = []
  if (canRead(Resource.MINIATURES) && !canEdit(Resource.MINIATURES)) {
    actions.push({ icon: EyeOutline, onClick: handleEdit, label: 'View theme' })
  }
  if (canEdit(Resource.MINIATURES)) {
    actions.push({ icon: CreateOutline, onClick: handleEdit, label: 'Edit theme' })
  }
  if (canDelete(Resource.MINIATURES)) {
    actions.push({
      icon: TrashOutline,
      onClick: handleDelete,
      type: 'error',
      label: 'Delete theme',
    })
  }
  if (actions.length > 0) {
    cols.push({
      title: 'Actions',
      key: 'actions',
      render: createActionsRenderer(actions),
    })
  }

  return cols
})

onMounted(() => {
  loadThemes()
})
</script>

<style scoped>
.cover-preview {
  width: 100%;
  max-width: 400px;
  height: auto;
  aspect-ratio: 2 / 1;
  object-fit: cover;
  border-radius: 4px;
}
</style>
