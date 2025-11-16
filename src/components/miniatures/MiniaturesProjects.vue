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

    <n-spin :show="loading">
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
} from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'
import miniaturesService from '../../services/miniatures'
import { required, validateForm } from '../../utils/validation'
import { createActionsRenderer, stringSorter, numberSorter } from '../../utils/tableHelpers'
import { toDateFormat } from '../../utils/dateHelpers'
import { createSearchFilter } from '../../utils/filterHelpers'
import { createDataLoader, createSaveHandler, createDeleteHandler } from '../../utils/crudHelpers'
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
