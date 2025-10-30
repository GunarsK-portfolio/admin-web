<template>
  <n-space vertical :size="16">
    <n-space justify="space-between">
      <SearchInput
        v-model="search"
        placeholder="Search by name, manufacturer, or type..."
        aria-label="Search paints"
      />
      <AddButton label="Add Paint" @click="openModal" />
    </n-space>

    <n-spin :show="loading">
      <n-data-table :columns="columns" :data="filteredPaints" :pagination="{ pageSize: 15 }" />
    </n-spin>
  </n-space>

  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="editing ? 'Edit Paint' : 'Add Paint'"
    :aria-label="editing ? 'Edit Paint' : 'Add Paint'"
    class="modal-medium"
  >
    <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
      <n-form-item label="Paint Name" path="name">
        <n-input v-model:value="form.name" placeholder="Enter paint name" />
      </n-form-item>

      <n-form-item label="Manufacturer" path="manufacturer">
        <n-input v-model:value="form.manufacturer" placeholder="Enter manufacturer name" />
      </n-form-item>

      <n-form-item label="Paint Type" path="paintType">
        <n-select
          v-model:value="form.paintType"
          :options="paintTypeOptions"
          placeholder="Select paint type"
        />
      </n-form-item>

      <n-form-item label="Color (Hex)" path="colorHex">
        <n-space align="center">
          <n-input
            v-model:value="form.colorHex"
            placeholder="#RRGGBB"
            maxlength="7"
            style="flex: 1"
          />
          <div class="color-preview" :style="{ backgroundColor: safeHexColor(form.colorHex) }" />
        </n-space>
      </n-form-item>
    </n-form>

    <template #footer>
      <ModalFooter :loading="saving" :editing="editing" @cancel="closeModal" @save="handleSave" />
    </template>
  </n-modal>
</template>

<script setup>
import { ref, h, onMounted } from 'vue'
import { PAINT_TYPE_OPTIONS, PAINT_TYPE_COLORS } from '@/constants/miniatures'
import {
  NSpace,
  NSpin,
  NDataTable,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
} from 'naive-ui'
import { CreateOutline, TrashOutline } from '@vicons/ionicons5'
import miniaturesService from '../../services/miniatures'
import { required, hexColor, validateForm } from '../../utils/validation'
import { createActionsRenderer, stringSorter } from '../../utils/tableHelpers'
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
const { data: paints, loading, search } = useDataState()

// Modal state
const { showModal, editing, form, formRef, openModal, closeModal, openEditModal, resetForm } =
  useModal({
    name: '',
    manufacturer: '',
    paintType: null,
    colorHex: '',
  })

// Saving state
const saving = ref(false)

// Use shared paint type options
const paintTypeOptions = PAINT_TYPE_OPTIONS

const rules = {
  name: [required('Paint name')],
  manufacturer: [required('Manufacturer')],
  paintType: [required('Paint type')],
  colorHex: [required('Color hex'), hexColor()],
}

// Validate hex color format to prevent CSS injection
const isValidHex = (hex) => {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

// Safe hex color - returns validated hex or safe fallback
const safeHexColor = (hex, fallback = '#ffffff') => {
  return isValidHex(hex) ? hex : fallback
}

const renderColorSwatch = (row) => {
  return h('div', {
    style: {
      width: '40px',
      height: '24px',
      backgroundColor: safeHexColor(row.colorHex, '#cccccc'),
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      display: 'inline-block',
    },
  })
}

const renderPaintType = (row) => {
  return h(
    NTag,
    { type: PAINT_TYPE_COLORS[row.paintType] || 'default', size: 'small' },
    { default: () => row.paintType }
  )
}

const filteredPaints = createSearchFilter(paints, search, ['name', 'manufacturer', 'paintType'])

const loadPaints = createDataLoader({
  loading,
  data: paints,
  service: miniaturesService.getAllPaints,
  entityName: 'paints',
  message,
})

function handleEdit(paint) {
  openEditModal(paint, (p) => ({
    name: p.name,
    manufacturer: p.manufacturer,
    paintType: p.paintType,
    colorHex: p.colorHex,
  }))
}

const handleSave = createSaveHandler({
  formRef,
  saving,
  editing,
  form,
  showModal,
  service: {
    create: miniaturesService.createPaint,
    update: miniaturesService.updatePaint,
  },
  entityName: 'Paint',
  message,
  onSuccess: loadPaints,
  resetForm: () => resetForm(),
  validateForm,
})

const handleDelete = createDeleteHandler({
  dialog,
  service: miniaturesService.deletePaint,
  entityName: 'Paint',
  message,
  onSuccess: loadPaints,
  getConfirmText: (paint) => `"${paint.name}" by ${paint.manufacturer}`,
})

const columns = [
  { title: 'Color', key: 'color', width: 80, render: renderColorSwatch },
  { title: 'Name', key: 'name', sorter: stringSorter('name') },
  { title: 'Manufacturer', key: 'manufacturer', sorter: stringSorter('manufacturer') },
  { title: 'Type', key: 'paintType', sorter: stringSorter('paintType'), render: renderPaintType },
  { title: 'Hex Code', key: 'colorHex' },
  {
    title: 'Actions',
    key: 'actions',
    render: createActionsRenderer([
      { icon: CreateOutline, onClick: handleEdit, label: 'Edit paint' },
      { icon: TrashOutline, onClick: handleDelete, type: 'error', label: 'Delete paint' },
    ]),
  },
]

onMounted(() => {
  loadPaints()
})
</script>

<style scoped>
.color-preview {
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
