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

    <n-spin :show="loading">
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
import { ref, onMounted } from 'vue'
import { NSpace, NSpin, NDataTable, NModal, NForm, NFormItem, NInput, NInputNumber } from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'
import miniaturesService from '../../services/miniatures'
import { required, validateForm } from '../../utils/validation'
import { createActionsRenderer, stringSorter, numberSorter } from '../../utils/tableHelpers'
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
const { data: themes, loading, search } = useDataState()

// Modal state
const { showModal, editing, form, formRef, openModal, closeModal, openEditModal, resetForm } =
  useModal({
    name: '',
    description: '',
    displayOrder: 0,
  })

// Saving state
const saving = ref(false)

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
    displayOrder: t.displayOrder || 0,
  }))
}

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
    ...formData,
    description: formData.description || undefined,
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

<style scoped>
.full-width {
  width: 100%;
}
</style>
