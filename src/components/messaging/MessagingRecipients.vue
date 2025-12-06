<template>
  <n-space vertical :size="16">
    <n-space justify="space-between">
      <SearchInput
        v-model="search"
        placeholder="Search recipients..."
        aria-label="Search recipients"
      />
      <AddButton v-if="canEdit(Resource.RECIPIENTS)" label="Add Recipient" @click="openModal" />
    </n-space>

    <n-spin :show="loading" aria-label="Loading recipients">
      <n-data-table :columns="columns" :data="filteredRecipients" :pagination="{ pageSize: 10 }" />
    </n-spin>
  </n-space>

  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="editing ? 'Edit Recipient' : 'Add Recipient'"
    class="modal-small"
  >
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
      <n-form-item label="Email" path="email">
        <n-input v-model:value="form.email" placeholder="recipient@example.com" />
      </n-form-item>

      <n-form-item label="Name" path="name">
        <n-input v-model:value="form.name" placeholder="Optional display name" />
      </n-form-item>

      <n-form-item label="Active" path="isActive">
        <n-switch v-model:value="form.isActive" />
      </n-form-item>
    </n-form>

    <template #footer>
      <ModalFooter :loading="saving" :editing="editing" @cancel="closeModal" @save="handleSave" />
    </template>
  </n-modal>
</template>

<script setup>
import { ref, computed, h, onMounted } from 'vue'
import {
  NSpace,
  NSpin,
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSwitch,
  NTag,
} from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'
import messagingService from '../../services/messaging'
import { required, email, validateForm } from '../../utils/validation'
import { createActionsRenderer, stringSorter, dateSorter } from '../../utils/tableHelpers'
import { toDateFormat } from '../../utils/dateHelpers'
import { createSearchFilter } from '../../utils/filterHelpers'
import { createDataLoader, createSaveHandler, createDeleteHandler } from '../../utils/crudHelpers'
import { useViewServices } from '../../composables/useViewServices'
import { useModal } from '../../composables/useModal'
import { useDataState } from '../../composables/useDataState'
import { usePermissions } from '../../composables/usePermissions'
import SearchInput from '../shared/SearchInput.vue'
import AddButton from '../shared/AddButton.vue'
import ModalFooter from '../shared/ModalFooter.vue'

const { message, dialog } = useViewServices()
const { canEdit, canDelete, Resource } = usePermissions()

const { data: recipients, loading, search } = useDataState()

const { showModal, editing, form, formRef, openModal, closeModal, openEditModal, resetForm } =
  useModal({
    email: '',
    name: '',
    isActive: true,
  })

const saving = ref(false)

const rules = {
  email: [required('Email'), email()],
  name: [{ max: 100, message: 'Name must be 100 characters or less', trigger: 'blur' }],
}

const filteredRecipients = createSearchFilter(recipients, search, ['email', 'name'])

const loadRecipients = createDataLoader({
  loading,
  data: recipients,
  service: messagingService.getAllRecipients,
  entityName: 'recipients',
  message,
})

function handleEdit(recipient) {
  openEditModal(recipient, (r) => ({
    email: r.email,
    name: r.name || '',
    isActive: r.isActive ?? true,
  }))
}

const handleSave = createSaveHandler({
  formRef,
  saving,
  editing,
  form,
  showModal,
  service: {
    create: messagingService.createRecipient,
    update: messagingService.updateRecipient,
  },
  entityName: 'Recipient',
  message,
  onSuccess: loadRecipients,
  resetForm,
  validateForm,
})

const handleDelete = createDeleteHandler({
  dialog,
  service: messagingService.deleteRecipient,
  entityName: 'Recipient',
  message,
  onSuccess: loadRecipients,
  getConfirmText: (recipient) => `"${recipient.email}"`,
})

const columns = computed(() => {
  const cols = [
    {
      title: 'Email',
      key: 'email',
      sorter: stringSorter('email'),
    },
    {
      title: 'Name',
      key: 'name',
      render: (row) => row.name || '—',
    },
    {
      title: 'Status',
      key: 'isActive',
      render: (row) =>
        h(
          NTag,
          { type: row.isActive ? 'success' : 'warning', size: 'small' },
          { default: () => (row.isActive ? 'Active' : 'Inactive') }
        ),
    },
    {
      title: 'Created',
      key: 'createdAt',
      sorter: dateSorter('createdAt'),
      render: (row) => toDateFormat(row.createdAt),
    },
  ]

  const actions = []
  if (canEdit(Resource.RECIPIENTS)) {
    actions.push({ icon: CreateOutline, onClick: handleEdit, label: 'Edit recipient' })
  }
  if (canDelete(Resource.RECIPIENTS)) {
    actions.push({
      icon: TrashOutline,
      onClick: handleDelete,
      type: 'error',
      label: 'Delete recipient',
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
  loadRecipients()
})
</script>
