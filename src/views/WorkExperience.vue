<template>
  <div class="page">
    <n-space vertical size="large" class="page-container">
      <n-button text @click="router.push('/dashboard')">
        <template #icon>
          <n-icon><ArrowBackOutline /></n-icon>
        </template>
        Back to Dashboard
      </n-button>

      <n-page-header
        title="Work Experience Management"
        subtitle="Manage your professional work history"
      />

      <n-card>
        <n-space vertical size="large">
          <n-space justify="space-between">
            <n-input
              v-model:value="search"
              placeholder="Search by company, position, or description..."
              class="search-input"
              clearable
            >
              <template #prefix>
                <n-icon><SearchOutline /></n-icon>
              </template>
            </n-input>
            <n-button type="primary" @click="handleAdd">
              <template #icon>
                <n-icon><AddOutline /></n-icon>
              </template>
              Add Experience
            </n-button>
          </n-space>

          <n-spin :show="loading">
            <n-data-table
              :columns="columns"
              :data="filteredExperience"
              :pagination="{ pageSize: 10 }"
            />
          </n-spin>
        </n-space>
      </n-card>
    </n-space>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editing ? 'Edit Work Experience' : 'Add Work Experience'"
      class="modal-medium"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-form-item label="Company" path="company">
          <n-input v-model:value="form.company" placeholder="Enter company name" />
        </n-form-item>

        <n-form-item label="Position" path="position">
          <n-input v-model:value="form.position" placeholder="Enter job position" />
        </n-form-item>

        <n-form-item label="Description" path="description">
          <n-input
            v-model:value="form.description"
            type="textarea"
            placeholder="Describe your responsibilities and achievements (Markdown supported)"
            :autosize="{ minRows: 4, maxRows: 10 }"
          />
        </n-form-item>

        <n-space class="date-fields">
          <n-form-item label="Start Date" path="startDate" class="date-field">
            <n-date-picker
              v-model:formatted-value="form.startDate"
              type="month"
              value-format="yyyy-MM"
              class="date-picker-full"
            />
          </n-form-item>

          <n-form-item label="End Date" path="endDate" class="date-field">
            <n-date-picker
              v-model:formatted-value="form.endDate"
              type="month"
              value-format="yyyy-MM"
              class="date-picker-full"
              :disabled="form.isCurrent"
              clearable
            />
          </n-form-item>
        </n-space>

        <n-form-item path="isCurrent">
          <n-checkbox v-model:checked="form.isCurrent">Currently working here</n-checkbox>
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="handleCancel">Cancel</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">
            {{ editing ? 'Update' : 'Create' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, h, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpace,
  NPageHeader,
  NButton,
  NIcon,
  NCard,
  NInput,
  NDataTable,
  NSpin,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NDatePicker,
  NCheckbox,
  useMessage,
  useDialog,
} from 'naive-ui'
import {
  AddOutline,
  CreateOutline,
  TrashOutline,
  SearchOutline,
  ArrowBackOutline,
} from '@vicons/ionicons5'
import workExperienceService from '../services/work-experience'
import { logger } from '../utils/logger'
import { required, dateAfter, validateForm } from '../utils/validation'
import { createActionsRenderer, createDateRangeRenderer, stringSorter } from '../utils/tableHelpers'
import { toMonthFormat, fromMonthFormat } from '../utils/dateHelpers'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const experiences = ref([])
const loading = ref(false)
const search = ref('')
const showModal = ref(false)
const editing = ref(null)
const saving = ref(false)
const formRef = ref(null)

const form = ref({
  company: '',
  position: '',
  description: '',
  startDate: null,
  endDate: null,
  isCurrent: false,
})

const rules = {
  company: [required('Company')],
  position: [required('Position')],
  startDate: [required('Start date')],
  endDate: [dateAfter(() => form.value.startDate)],
}

const renderStatus = (row) =>
  h(
    NTag,
    { type: row.isCurrent ? 'success' : 'default', size: 'small' },
    { default: () => (row.isCurrent ? 'Current' : 'Past') }
  )

const columns = [
  { title: 'Company', key: 'company', sorter: stringSorter('company') },
  { title: 'Position', key: 'position', sorter: stringSorter('position') },
  { title: 'Period', key: 'period', render: createDateRangeRenderer() },
  { title: 'Status', key: 'status', render: renderStatus },
  {
    title: 'Actions',
    key: 'actions',
    render: createActionsRenderer([
      { icon: CreateOutline, onClick: handleEdit, label: 'Edit work experience' },
      { icon: TrashOutline, onClick: handleDelete, type: 'error', label: 'Delete work experience' },
    ]),
  },
]

const filteredExperience = computed(() => {
  if (!search.value) return experiences.value
  const searchLower = search.value.toLowerCase()
  return experiences.value.filter(
    (exp) =>
      exp.company?.toLowerCase().includes(searchLower) ||
      exp.position?.toLowerCase().includes(searchLower) ||
      exp.description?.toLowerCase().includes(searchLower)
  )
})

async function loadExperience() {
  loading.value = true
  try {
    const response = await workExperienceService.getAllWorkExperience()
    experiences.value = response.data || []
    logger.info('Work experience loaded', { count: experiences.value.length })
  } catch (error) {
    logger.error('Failed to load work experience', { error: error.message })
    message.error('Failed to load work experience')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  resetForm()
  showModal.value = true
}

function handleEdit(experience) {
  editing.value = experience
  form.value = {
    company: experience.company,
    position: experience.position,
    description: experience.description || '',
    startDate: toMonthFormat(experience.startDate),
    endDate: toMonthFormat(experience.endDate),
    isCurrent: experience.isCurrent || false,
  }
  showModal.value = true
}

async function handleSave() {
  if (!(await validateForm(formRef))) return

  saving.value = true
  try {
    const payload = {
      ...form.value,
      startDate: fromMonthFormat(form.value.startDate),
      endDate: form.value.isCurrent ? null : fromMonthFormat(form.value.endDate),
    }

    if (editing.value) {
      await workExperienceService.updateWorkExperience(editing.value.id, payload)
      message.success('Work experience updated successfully')
      logger.info('Work experience updated', { id: editing.value.id })
    } else {
      const response = await workExperienceService.createWorkExperience(payload)
      message.success('Work experience created successfully')
      logger.info('Work experience created', { id: response.data?.id })
    }

    showModal.value = false
    resetForm()
    await loadExperience()
  } catch (error) {
    logger.error('Failed to save work experience', { error: error.message })
    message.error('Failed to save work experience')
  } finally {
    saving.value = false
  }
}

function handleDelete(experience) {
  dialog.warning({
    title: 'Delete Work Experience',
    content: `Are you sure you want to delete "${experience.position} at ${experience.company}"?`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        await workExperienceService.deleteWorkExperience(experience.id)
        message.success('Work experience deleted successfully')
        logger.info('Work experience deleted', { id: experience.id })
        await loadExperience()
      } catch (error) {
        logger.error('Failed to delete work experience', { error: error.message })
        message.error('Failed to delete work experience')
      }
    },
  })
}

function handleCancel() {
  showModal.value = false
  resetForm()
}

function resetForm() {
  editing.value = null
  form.value = {
    company: '',
    position: '',
    description: '',
    startDate: null,
    endDate: null,
    isCurrent: false,
  }
  nextTick(() => {
    formRef.value?.restoreValidation()
  })
}

// Clear end date when "Currently working here" is checked
watch(
  () => form.value.isCurrent,
  (isCurrent) => {
    if (isCurrent) {
      form.value.endDate = null
    }
  }
)

onMounted(() => {
  loadExperience()
})
</script>

<style scoped>
.date-fields {
  display: flex;
  gap: 16px;
}

.date-field {
  flex: 1;
}

.date-picker-full {
  width: 100%;
}
</style>
