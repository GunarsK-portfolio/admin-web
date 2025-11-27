<template>
  <div class="page">
    <n-space vertical size="large" class="page-container">
      <BackButton />

      <n-page-header
        title="Certifications Management"
        subtitle="Manage your professional certifications and credentials"
      />

      <n-card>
        <n-space vertical size="large">
          <n-space justify="space-between">
            <SearchInput
              v-model="search"
              placeholder="Search by name, issuer, or credential ID..."
              aria-label="Search certifications"
            />
            <AddButton label="Add Certification" @click="openModal" />
          </n-space>

          <n-spin :show="loading" aria-label="Loading certifications">
            <n-data-table
              :columns="columns"
              :data="filteredCertifications"
              :pagination="{ pageSize: 10 }"
            />
          </n-spin>
        </n-space>
      </n-card>
    </n-space>

    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="editing ? 'Edit Certification' : 'Add Certification'"
      class="modal-medium"
    >
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-collapse :default-expanded-names="['basic']">
          <!-- Basic Information Section -->
          <n-collapse-item title="Basic Information" name="basic">
            <n-form-item label="Certification Name" path="name">
              <n-input v-model:value="form.name" placeholder="Enter certification name" />
            </n-form-item>

            <n-form-item label="Issuer" path="issuer">
              <n-input v-model:value="form.issuer" placeholder="Enter issuing organization" />
            </n-form-item>

            <n-grid :cols="2" :x-gap="16">
              <n-form-item-gi label="Issue Date" path="issueDate">
                <n-date-picker
                  v-model:formatted-value="form.issueDate"
                  type="date"
                  value-format="yyyy-MM-dd"
                  class="full-width"
                />
              </n-form-item-gi>

              <n-form-item-gi label="Expiry Date" path="expiryDate">
                <n-date-picker
                  v-model:formatted-value="form.expiryDate"
                  type="date"
                  value-format="yyyy-MM-dd"
                  class="full-width"
                  clearable
                />
              </n-form-item-gi>
            </n-grid>
          </n-collapse-item>

          <!-- Credential Details Section -->
          <n-collapse-item title="Credential Details" name="credential">
            <n-form-item label="Credential ID" path="credentialId">
              <n-input
                v-model:value="form.credentialId"
                placeholder="Enter credential or reference ID (optional)"
              />
            </n-form-item>

            <n-form-item label="Credential URL" path="credentialUrl">
              <n-input
                v-model:value="form.credentialUrl"
                placeholder="Enter URL to verify credential (optional)"
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
import { ref, h, onMounted } from 'vue'
import {
  NSpace,
  NPageHeader,
  NButton,
  NIcon,
  NCard,
  NDataTable,
  NSpin,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NDatePicker,
  NCollapse,
  NCollapseItem,
  NGrid,
  NFormItemGi,
} from 'naive-ui'
import { CreateOutline, TrashOutline, LinkOutline } from '@vicons/ionicons5'
import certificationsService from '../services/certifications'
import { required, dateAfter, url, validateForm, isValidHttpUrl } from '../utils/validation'
import { createActionsRenderer, stringSorter, dateSorter } from '../utils/tableHelpers'
import { toDateFormat } from '../utils/dateHelpers'
import { createSearchFilter } from '../utils/filterHelpers'
import { createDataLoader, createSaveHandler, createDeleteHandler } from '../utils/crudHelpers'
import { useViewServices } from '../composables/useViewServices'
import { useModal } from '../composables/useModal'
import { useDataState } from '../composables/useDataState'
import BackButton from '../components/shared/BackButton.vue'
import SearchInput from '../components/shared/SearchInput.vue'
import AddButton from '../components/shared/AddButton.vue'
import ModalFooter from '../components/shared/ModalFooter.vue'

// Services
const { message, dialog } = useViewServices()

// Data state
const { data: certifications, loading, search } = useDataState()

// Modal state
const { showModal, editing, form, formRef, openModal, closeModal, openEditModal, resetForm } =
  useModal({
    name: '',
    issuer: '',
    issueDate: null,
    expiryDate: null,
    credentialId: '',
    credentialUrl: '',
  })

// Saving state
const saving = ref(false)

const rules = {
  name: [required('Certification name')],
  issuer: [required('Issuer')],
  issueDate: [required('Issue date')],
  expiryDate: [dateAfter(() => form.value.issueDate)],
  credentialUrl: [url()],
}

const renderExpiryStatus = (row) => {
  if (!row.expiryDate) {
    return h(NTag, { type: 'default', size: 'small' }, { default: () => 'No Expiry' })
  }

  // Normalize dates to noon local time to avoid timezone edge cases
  const expiryDate = new Date(row.expiryDate)
  expiryDate.setHours(12, 0, 0, 0)

  const now = new Date()
  now.setHours(12, 0, 0, 0)

  const isExpired = expiryDate < now

  return h(
    NTag,
    { type: isExpired ? 'error' : 'success', size: 'small' },
    { default: () => (isExpired ? 'Expired' : 'Valid') }
  )
}

const renderCredentialLink = (row) => {
  if (!row.credentialUrl || !isValidHttpUrl(row.credentialUrl)) {
    return null
  }

  return h(
    NButton,
    {
      text: true,
      tag: 'a',
      href: row.credentialUrl,
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
      type: 'info',
      size: 'small',
    },
    {
      icon: () => h(NIcon, null, { default: () => h(LinkOutline) }),
      default: () => 'Verify',
    }
  )
}

const filteredCertifications = createSearchFilter(certifications, search, [
  'name',
  'issuer',
  'credentialId',
])

const loadCertifications = createDataLoader({
  loading,
  data: certifications,
  service: certificationsService.getAllCertifications,
  entityName: 'certifications',
  message,
})

function handleEdit(certification) {
  openEditModal(certification, (cert) => ({
    name: cert.name,
    issuer: cert.issuer,
    issueDate: toDateFormat(cert.issueDate),
    expiryDate: toDateFormat(cert.expiryDate),
    credentialId: cert.credentialId || '',
    credentialUrl: cert.credentialUrl || '',
  }))
}

const handleSave = createSaveHandler({
  formRef,
  saving,
  editing,
  form,
  showModal,
  service: {
    create: certificationsService.createCertification,
    update: certificationsService.updateCertification,
  },
  entityName: 'Certification',
  message,
  onSuccess: loadCertifications,
  resetForm: () => resetForm(),
  validateForm,
  transformPayload: (formData) => ({
    ...formData,
    credentialId: formData.credentialId || undefined,
    credentialUrl: formData.credentialUrl || undefined,
    expiryDate: formData.expiryDate || undefined,
  }),
})

const handleDelete = createDeleteHandler({
  dialog,
  service: certificationsService.deleteCertification,
  entityName: 'Certification',
  message,
  onSuccess: loadCertifications,
  getConfirmText: (cert) => `"${cert.name}"`,
})

const columns = [
  { title: 'Name', key: 'name', sorter: stringSorter('name') },
  { title: 'Issuer', key: 'issuer', sorter: stringSorter('issuer') },
  {
    title: 'Issue Date',
    key: 'issueDate',
    sorter: dateSorter('issueDate'),
    render: (row) => toDateFormat(row.issueDate),
  },
  {
    title: 'Expiry Date',
    key: 'expiryDate',
    sorter: dateSorter('expiryDate'),
    render: (row) => toDateFormat(row.expiryDate, 'N/A'),
  },
  { title: 'Status', key: 'status', render: renderExpiryStatus },
  { title: 'Credential', key: 'credential', render: renderCredentialLink },
  {
    title: 'Actions',
    key: 'actions',
    render: createActionsRenderer([
      { icon: CreateOutline, onClick: handleEdit, label: 'Edit certification' },
      { icon: TrashOutline, onClick: handleDelete, type: 'error', label: 'Delete certification' },
    ]),
  },
]

onMounted(() => {
  loadCertifications()
})
</script>
