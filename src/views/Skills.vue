<template>
  <div class="page">
    <n-space vertical size="large" class="page-container">
      <BackButton />

      <n-page-header title="Skills Management" subtitle="Manage your skills and skill categories" />

      <n-tabs type="line" animated>
        <!-- Skills Tab -->
        <n-tab-pane name="skills" tab="Skills">
          <n-space vertical :size="16">
            <n-space justify="space-between">
              <SearchInput v-model="skillsSearch" placeholder="Search skills..." />
              <AddButton
                v-if="canEdit(Resource.SKILLS)"
                label="Add Skill"
                @click="openSkillModal"
              />
            </n-space>

            <n-spin :show="loadingSkills" aria-label="Loading skills">
              <n-data-table
                :columns="skillColumns"
                :data="filteredSkills"
                :pagination="skillsPagination"
                :bordered="false"
              />
            </n-spin>
          </n-space>
        </n-tab-pane>

        <!-- Skill Types Tab -->
        <n-tab-pane name="types" tab="Skill Types">
          <n-space vertical :size="16">
            <n-space justify="space-between">
              <SearchInput v-model="typesSearch" placeholder="Search skill types..." />
              <AddButton
                v-if="canEdit(Resource.SKILLS)"
                label="Add Skill Type"
                @click="openTypeModal"
              />
            </n-space>

            <n-spin :show="loadingTypes" aria-label="Loading skill types">
              <n-data-table
                :columns="typeColumns"
                :data="filteredTypes"
                :pagination="typesPagination"
                :bordered="false"
              />
            </n-spin>
          </n-space>
        </n-tab-pane>
      </n-tabs>
    </n-space>

    <!-- Add/Edit Skill Modal -->
    <n-modal
      v-model:show="showSkillModal"
      preset="card"
      :title="editingSkill ? 'Edit Skill' : 'Add Skill'"
      class="modal-small"
    >
      <n-form ref="skillFormRef" :model="skillForm" :rules="skillRules" label-placement="top">
        <n-collapse :default-expanded-names="['basic']">
          <!-- Skill Information Section -->
          <n-collapse-item title="Skill Information" name="basic">
            <n-form-item label="Skill Name" path="skill">
              <n-input v-model:value="skillForm.skill" placeholder="e.g., Vue.js" />
            </n-form-item>

            <n-form-item label="Skill Type" path="skillTypeId">
              <n-select
                v-model:value="skillForm.skillTypeId"
                :options="skillTypeOptions"
                placeholder="Select skill type"
                class="full-width"
              />
            </n-form-item>

            <n-form-item label="Visible" path="isVisible">
              <n-switch v-model:value="skillForm.isVisible" />
            </n-form-item>

            <n-form-item label="Display Order" path="displayOrder">
              <n-input-number
                v-model:value="skillForm.displayOrder"
                :min="0"
                placeholder="Order"
                class="full-width"
              />
            </n-form-item>
          </n-collapse-item>
        </n-collapse>
      </n-form>

      <template #footer>
        <ModalFooter
          :loading="savingSkill"
          :editing="editingSkill"
          :can-save="canEdit(Resource.SKILLS)"
          @cancel="closeSkillModal"
          @save="handleSaveSkill"
        />
      </template>
    </n-modal>

    <!-- Add/Edit Skill Type Modal -->
    <n-modal
      v-model:show="showTypeModal"
      preset="card"
      :title="editingType ? 'Edit Skill Type' : 'Add Skill Type'"
      class="modal-small"
    >
      <n-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-placement="top">
        <n-collapse :default-expanded-names="['basic']">
          <!-- Type Information Section -->
          <n-collapse-item title="Type Information" name="basic">
            <n-form-item label="Name" path="name">
              <n-input v-model:value="typeForm.name" placeholder="e.g., Frontend" />
            </n-form-item>

            <n-form-item label="Description" path="description">
              <n-input
                v-model:value="typeForm.description"
                type="textarea"
                placeholder="Brief description"
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </n-form-item>

            <n-form-item label="Display Order" path="displayOrder">
              <n-input-number
                v-model:value="typeForm.displayOrder"
                :min="0"
                placeholder="Order"
                class="full-width"
              />
            </n-form-item>
          </n-collapse-item>
        </n-collapse>
      </n-form>

      <template #footer>
        <ModalFooter
          :loading="savingType"
          :editing="editingType"
          :can-save="canEdit(Resource.SKILLS)"
          @cancel="closeTypeModal"
          @save="handleSaveType"
        />
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  NSpace,
  NPageHeader,
  NTabs,
  NTabPane,
  NDataTable,
  NSpin,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSwitch,
  NInputNumber,
  NCollapse,
  NCollapseItem,
} from 'naive-ui'
import { CreateOutline, TrashOutline, EyeOutline } from '@vicons/ionicons5'
import BackButton from '../components/shared/BackButton.vue'
import SearchInput from '../components/shared/SearchInput.vue'
import AddButton from '../components/shared/AddButton.vue'
import ModalFooter from '../components/shared/ModalFooter.vue'
import { useViewServices } from '../composables/useViewServices'
import { useModal } from '../composables/useModal'
import { usePermissions } from '../composables/usePermissions'
import skillsService from '../services/skills'
import { required, requiredNumber, validateForm } from '../utils/validation'
import { stringSorter, createActionsRenderer } from '../utils/tableHelpers'
import { createSearchFilter } from '../utils/filterHelpers'
import { createDataLoader, createSaveHandler, createDeleteHandler } from '../utils/crudHelpers'

const { message, dialog } = useViewServices()
const { canRead, canEdit, canDelete, Resource } = usePermissions()

// Skills state
const skills = ref([])
const loadingSkills = ref(false)
const skillsSearch = ref('')
const {
  showModal: showSkillModal,
  editing: editingSkill,
  form: skillForm,
  formRef: skillFormRef,
  openModal: openSkillModal,
  closeModal: closeSkillModal,
  openEditModal: openEditSkillModal,
  resetForm: resetSkillForm,
} = useModal({
  skill: '',
  skillTypeId: null,
  isVisible: true,
  displayOrder: 0,
})
const savingSkill = ref(false)

const skillRules = {
  skill: [required('Skill name')],
  skillTypeId: [requiredNumber('Skill type')],
}

// Skill Types state
const skillTypes = ref([])
const loadingTypes = ref(false)
const typesSearch = ref('')
const {
  showModal: showTypeModal,
  editing: editingType,
  form: typeForm,
  formRef: typeFormRef,
  openModal: openTypeModal,
  closeModal: closeTypeModal,
  openEditModal: openEditTypeModal,
  resetForm: resetTypeForm,
} = useModal({
  name: '',
  description: '',
  displayOrder: 0,
})
const savingType = ref(false)

const typeRules = {
  name: [required('Name')],
}

// Computed
const filteredSkills = createSearchFilter(skills, skillsSearch, ['skill', 'skillType.name'])

const filteredTypes = createSearchFilter(skillTypes, typesSearch, ['name', 'description'])

const skillTypeOptions = computed(() => {
  return skillTypes.value.map((type) => ({
    label: type.name,
    value: Number(type.id),
  }))
})

// Data loaders
const loadSkills = createDataLoader({
  loading: loadingSkills,
  data: skills,
  service: skillsService.getAllSkills,
  entityName: 'skills',
  message,
})

const loadSkillTypes = createDataLoader({
  loading: loadingTypes,
  data: skillTypes,
  service: skillsService.getAllSkillTypes,
  entityName: 'skill types',
  message,
})

function handleEditSkill(skill) {
  openEditSkillModal(skill, (s) => ({
    skill: s.skill,
    skillTypeId: Number(s.skillTypeId),
    isVisible: s.isVisible ?? true,
    displayOrder: s.displayOrder || 0,
  }))
}

const handleSaveSkill = createSaveHandler({
  formRef: skillFormRef,
  saving: savingSkill,
  editing: editingSkill,
  form: skillForm,
  showModal: showSkillModal,
  service: {
    create: skillsService.createSkill,
    update: skillsService.updateSkill,
  },
  entityName: 'Skill',
  message,
  onSuccess: loadSkills,
  resetForm: () => resetSkillForm(),
  validateForm,
  checkPermission: () => canEdit(Resource.SKILLS),
})

const handleDeleteSkill = createDeleteHandler({
  dialog,
  service: skillsService.deleteSkill,
  entityName: 'Skill',
  message,
  onSuccess: loadSkills,
  getConfirmText: (skill) => `"${skill.skill}"`,
  checkPermission: () => canDelete(Resource.SKILLS),
})

function handleEditType(type) {
  openEditTypeModal(type, (t) => ({
    name: t.name,
    description: t.description || '',
    displayOrder: t.displayOrder || 0,
  }))
}

const handleSaveType = createSaveHandler({
  formRef: typeFormRef,
  saving: savingType,
  editing: editingType,
  form: typeForm,
  showModal: showTypeModal,
  service: {
    create: skillsService.createSkillType,
    update: skillsService.updateSkillType,
  },
  entityName: 'Skill type',
  message,
  onSuccess: async () => {
    await loadSkillTypes()
    await loadSkills()
  },
  resetForm: () => resetTypeForm(),
  validateForm,
  checkPermission: () => canEdit(Resource.SKILLS),
})

const handleDeleteType = createDeleteHandler({
  dialog,
  service: skillsService.deleteSkillType,
  entityName: 'Skill type',
  message,
  onSuccess: async () => {
    await loadSkillTypes()
    await loadSkills()
  },
  getConfirmText: (type) => `"${type.name}"? This may affect existing skills`,
  checkPermission: () => canDelete(Resource.SKILLS),
})

// Skills table columns
const skillColumns = computed(() => {
  const cols = [
    {
      title: 'Skill',
      key: 'skill',
      sorter: stringSorter('skill'),
    },
    {
      title: 'Type',
      key: 'skillType',
      render: (row) => row.skillType?.name || 'N/A',
    },
    {
      title: 'Visible',
      key: 'isVisible',
      render: (row) => (row.isVisible ? 'Yes' : 'No'),
    },
    {
      title: 'Order',
      key: 'displayOrder',
    },
  ]

  const actions = []
  if (canRead(Resource.SKILLS) && !canEdit(Resource.SKILLS)) {
    actions.push({ icon: EyeOutline, onClick: handleEditSkill, label: 'View skill' })
  }
  if (canEdit(Resource.SKILLS)) {
    actions.push({ icon: CreateOutline, onClick: handleEditSkill, label: 'Edit skill' })
  }
  if (canDelete(Resource.SKILLS)) {
    actions.push({
      icon: TrashOutline,
      onClick: handleDeleteSkill,
      type: 'error',
      label: 'Delete skill',
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

// Skill Types table columns
const typeColumns = computed(() => {
  const cols = [
    {
      title: 'Name',
      key: 'name',
      sorter: stringSorter('name'),
    },
    {
      title: 'Description',
      key: 'description',
    },
    {
      title: 'Order',
      key: 'displayOrder',
    },
  ]

  const actions = []
  if (canRead(Resource.SKILLS) && !canEdit(Resource.SKILLS)) {
    actions.push({ icon: EyeOutline, onClick: handleEditType, label: 'View skill type' })
  }
  if (canEdit(Resource.SKILLS)) {
    actions.push({ icon: CreateOutline, onClick: handleEditType, label: 'Edit skill type' })
  }
  if (canDelete(Resource.SKILLS)) {
    actions.push({
      icon: TrashOutline,
      onClick: handleDeleteType,
      type: 'error',
      label: 'Delete skill type',
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

const skillsPagination = { pageSize: 10 }
const typesPagination = { pageSize: 10 }

onMounted(() => {
  loadSkillTypes()
  loadSkills()
})
</script>
