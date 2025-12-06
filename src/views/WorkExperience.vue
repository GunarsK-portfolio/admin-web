<template>
  <div class="page">
    <n-space vertical size="large" class="page-container">
      <BackButton />

      <n-page-header
        title="Work Experience Management"
        subtitle="Manage your professional work history"
      />

      <n-card>
        <n-space vertical size="large">
          <n-space justify="space-between">
            <SearchInput
              v-model="search"
              placeholder="Search by company, position, or description..."
            />
            <AddButton
              v-if="canEdit(Resource.EXPERIENCE)"
              label="Add Experience"
              @click="openModal"
            />
          </n-space>

          <n-spin :show="loading" aria-label="Loading work experience">
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
        <n-collapse :default-expanded-names="['basic']">
          <!-- Basic Information Section -->
          <n-collapse-item title="Basic Information" name="basic">
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
          </n-collapse-item>

          <!-- Timeline Section -->
          <n-collapse-item title="Timeline" name="timeline">
            <n-grid :cols="2" :x-gap="16">
              <n-form-item-gi label="Start Date" path="startDate">
                <n-date-picker
                  v-model:formatted-value="form.startDate"
                  type="month"
                  value-format="yyyy-MM"
                  class="full-width"
                />
              </n-form-item-gi>

              <n-form-item-gi label="End Date" path="endDate">
                <n-date-picker
                  v-model:formatted-value="form.endDate"
                  type="month"
                  value-format="yyyy-MM"
                  class="full-width"
                  :disabled="form.isCurrent"
                  clearable
                />
              </n-form-item-gi>
            </n-grid>

            <n-form-item path="isCurrent">
              <n-checkbox v-model:checked="form.isCurrent">Currently working here</n-checkbox>
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
import { ref, computed, h, onMounted, watch } from 'vue'
import {
  NSpace,
  NPageHeader,
  NCard,
  NDataTable,
  NSpin,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NDatePicker,
  NCheckbox,
  NCollapse,
  NCollapseItem,
  NGrid,
  NFormItemGi,
} from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'
import BackButton from '../components/shared/BackButton.vue'
import SearchInput from '../components/shared/SearchInput.vue'
import AddButton from '../components/shared/AddButton.vue'
import ModalFooter from '../components/shared/ModalFooter.vue'
import { useViewServices } from '../composables/useViewServices'
import { useDataState } from '../composables/useDataState'
import { useModal } from '../composables/useModal'
import { usePermissions } from '../composables/usePermissions'
import workExperienceService from '../services/work-experience'
import { required, dateAfter, validateForm } from '../utils/validation'
import { createActionsRenderer, createDateRangeRenderer, stringSorter } from '../utils/tableHelpers'
import { toMonthFormat, fromMonthFormat } from '../utils/dateHelpers'
import { createSearchFilter } from '../utils/filterHelpers'
import { createDataLoader, createSaveHandler, createDeleteHandler } from '../utils/crudHelpers'

const { message, dialog } = useViewServices()
const { canEdit, canDelete, Resource } = usePermissions()
const { data: experiences, loading, search } = useDataState()
const { showModal, editing, form, formRef, openModal, closeModal, openEditModal, resetForm } =
  useModal({
    company: '',
    position: '',
    description: '',
    startDate: null,
    endDate: null,
    isCurrent: false,
  })

const saving = ref(false)

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

const filteredExperience = createSearchFilter(experiences, search, [
  'company',
  'position',
  'description',
])

const loadExperience = createDataLoader({
  loading,
  data: experiences,
  service: workExperienceService.getAllWorkExperiences,
  entityName: 'work experience',
  message,
})

function handleEdit(experience) {
  openEditModal(experience, (exp) => ({
    company: exp.company,
    position: exp.position,
    description: exp.description || '',
    startDate: toMonthFormat(exp.startDate),
    endDate: toMonthFormat(exp.endDate),
    isCurrent: exp.isCurrent || false,
  }))
}

const handleSave = createSaveHandler({
  formRef,
  saving,
  editing,
  form,
  showModal,
  service: {
    create: workExperienceService.createWorkExperience,
    update: workExperienceService.updateWorkExperience,
  },
  entityName: 'Work experience',
  message,
  onSuccess: loadExperience,
  resetForm: () => resetForm(),
  validateForm,
  transformPayload: (formData) => ({
    ...formData,
    startDate: fromMonthFormat(formData.startDate),
    endDate: formData.isCurrent ? null : fromMonthFormat(formData.endDate),
  }),
  checkPermission: () => canEdit(Resource.EXPERIENCE),
})

const handleDelete = createDeleteHandler({
  dialog,
  service: workExperienceService.deleteWorkExperience,
  entityName: 'Work experience',
  message,
  onSuccess: loadExperience,
  getConfirmText: (exp) => `"${exp.position} at ${exp.company}"`,
  checkPermission: () => canDelete(Resource.EXPERIENCE),
})

const columns = computed(() => {
  const cols = [
    { title: 'Company', key: 'company', sorter: stringSorter('company') },
    { title: 'Position', key: 'position', sorter: stringSorter('position') },
    { title: 'Period', key: 'period', render: createDateRangeRenderer() },
    { title: 'Status', key: 'status', render: renderStatus },
  ]

  const actions = []
  if (canEdit(Resource.EXPERIENCE)) {
    actions.push({ icon: CreateOutline, onClick: handleEdit, label: 'Edit work experience' })
  }
  if (canDelete(Resource.EXPERIENCE)) {
    actions.push({
      icon: TrashOutline,
      onClick: handleDelete,
      type: 'error',
      label: 'Delete work experience',
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
