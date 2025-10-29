<template>
  <div class="page">
    <n-space vertical size="large" class="page-container">
      <n-button text @click="router.push('/dashboard')">
        <template #icon>
          <n-icon><ArrowBackOutline /></n-icon>
        </template>
        Back to Dashboard
      </n-button>

      <n-page-header title="Skills Management" subtitle="Manage your skills and skill categories" />

      <n-tabs type="line" animated>
        <!-- Skills Tab -->
        <n-tab-pane name="skills" tab="Skills">
          <n-space vertical :size="16">
            <n-space justify="space-between">
              <n-input
                v-model:value="skillsSearch"
                placeholder="Search skills..."
                clearable
                class="search-input"
              >
                <template #prefix>
                  <n-icon><SearchOutline /></n-icon>
                </template>
              </n-input>
              <n-button type="primary" @click="showSkillModal = true">
                <template #icon>
                  <n-icon><AddOutline /></n-icon>
                </template>
                Add Skill
              </n-button>
            </n-space>

            <n-spin :show="loadingSkills">
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
              <n-input
                v-model:value="typesSearch"
                placeholder="Search skill types..."
                clearable
                class="search-input"
              >
                <template #prefix>
                  <n-icon><SearchOutline /></n-icon>
                </template>
              </n-input>
              <n-button type="primary" @click="showTypeModal = true">
                <template #icon>
                  <n-icon><AddOutline /></n-icon>
                </template>
                Add Skill Type
              </n-button>
            </n-space>

            <n-spin :show="loadingTypes">
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
    <n-modal v-model:show="showSkillModal" preset="card" title="Skill" class="modal-small">
      <n-form ref="skillFormRef" :model="skillForm" :rules="skillRules">
        <n-form-item label="Skill Name" path="skill">
          <n-input v-model:value="skillForm.skill" placeholder="e.g., Vue.js" />
        </n-form-item>

        <n-form-item label="Skill Type" path="skillTypeId">
          <n-select
            v-model:value="skillForm.skillTypeId"
            :options="skillTypeOptions"
            placeholder="Select skill type"
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
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showSkillModal = false">Cancel</n-button>
          <n-button type="primary" :loading="savingSkill" @click="handleSaveSkill">
            {{ editingSkill ? 'Update' : 'Create' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Add/Edit Skill Type Modal -->
    <n-modal v-model:show="showTypeModal" preset="card" title="Skill Type" class="modal-small">
      <n-form ref="typeFormRef" :model="typeForm" :rules="typeRules">
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
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showTypeModal = false">Cancel</n-button>
          <n-button type="primary" :loading="savingType" @click="handleSaveType">
            {{ editingType ? 'Update' : 'Create' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NSpace,
  NPageHeader,
  NButton,
  NIcon,
  NTabs,
  NTabPane,
  NInput,
  NDataTable,
  NSpin,
  NModal,
  NForm,
  NFormItem,
  NSelect,
  NSwitch,
  NInputNumber,
  useMessage,
  useDialog,
} from 'naive-ui'
import {
  ArrowBackOutline,
  AddOutline,
  SearchOutline,
  CreateOutline,
  TrashOutline,
} from '@vicons/ionicons5'
import skillsService from '../services/skills'
import { logger } from '../utils/logger'
import { required, requiredNumber, validateForm } from '../utils/validation'
import { stringSorter, createActionsRenderer } from '../utils/tableHelpers'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

// Skills state
const skills = ref([])
const loadingSkills = ref(false)
const skillsSearch = ref('')
const showSkillModal = ref(false)
const editingSkill = ref(null)
const savingSkill = ref(false)
const skillFormRef = ref(null)

const skillForm = ref({
  skill: '',
  skillTypeId: null,
  isVisible: true,
  displayOrder: 0,
})

const skillRules = {
  skill: [required('Skill name')],
  skillTypeId: [requiredNumber('Skill type')],
}

// Skill Types state
const skillTypes = ref([])
const loadingTypes = ref(false)
const typesSearch = ref('')
const showTypeModal = ref(false)
const editingType = ref(null)
const savingType = ref(false)
const typeFormRef = ref(null)

const typeForm = ref({
  name: '',
  description: '',
  displayOrder: 0,
})

const typeRules = {
  name: [required('Name')],
}

// Computed
const filteredSkills = computed(() => {
  if (!skillsSearch.value) return skills.value
  const search = skillsSearch.value.toLowerCase()
  return skills.value.filter(
    (skill) =>
      skill.skill?.toLowerCase().includes(search) ||
      skill.skillType?.name?.toLowerCase().includes(search)
  )
})

const filteredTypes = computed(() => {
  if (!typesSearch.value) return skillTypes.value
  const search = typesSearch.value.toLowerCase()
  return skillTypes.value.filter(
    (type) =>
      type.name?.toLowerCase().includes(search) || type.description?.toLowerCase().includes(search)
  )
})

const skillTypeOptions = computed(() => {
  return skillTypes.value.map((type) => ({
    label: type.name,
    value: type.id,
  }))
})

// Skills table columns
const skillColumns = [
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
  {
    title: 'Actions',
    key: 'actions',
    render: createActionsRenderer([
      { icon: CreateOutline, onClick: handleEditSkill },
      { icon: TrashOutline, onClick: handleDeleteSkill, type: 'error' },
    ]),
  },
]

// Skill Types table columns
const typeColumns = [
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
  {
    title: 'Actions',
    key: 'actions',
    render: createActionsRenderer([
      { icon: CreateOutline, onClick: handleEditType },
      { icon: TrashOutline, onClick: handleDeleteType, type: 'error' },
    ]),
  },
]

const skillsPagination = { pageSize: 10 }
const typesPagination = { pageSize: 10 }

// Methods
async function loadSkills() {
  loadingSkills.value = true
  try {
    const response = await skillsService.getAllSkills()
    skills.value = response.data || []
  } catch (error) {
    logger.error('Failed to load skills', { error: error.message })
    message.error('Failed to load skills')
  } finally {
    loadingSkills.value = false
  }
}

async function loadSkillTypes() {
  loadingTypes.value = true
  try {
    const response = await skillsService.getAllSkillTypes()
    skillTypes.value = response.data || []
  } catch (error) {
    logger.error('Failed to load skill types', { error: error.message })
    message.error('Failed to load skill types')
  } finally {
    loadingTypes.value = false
  }
}

function handleEditSkill(skill) {
  editingSkill.value = skill
  skillForm.value = {
    skill: skill.skill,
    skillTypeId: skill.skillTypeId,
    isVisible: skill.isVisible ?? true,
    displayOrder: skill.displayOrder || 0,
  }
  showSkillModal.value = true
}

async function handleSaveSkill() {
  if (!(await validateForm(skillFormRef))) return

  savingSkill.value = true
  try {
    if (editingSkill.value) {
      await skillsService.updateSkill(editingSkill.value.id, skillForm.value)
      message.success('Skill updated successfully')
    } else {
      await skillsService.createSkill(skillForm.value)
      message.success('Skill created successfully')
    }

    showSkillModal.value = false
    resetSkillForm()
    await loadSkills()
  } catch (error) {
    logger.error('Failed to save skill', { error: error.message })
    message.error('Failed to save skill')
  } finally {
    savingSkill.value = false
  }
}

function handleDeleteSkill(skill) {
  dialog.warning({
    title: 'Delete Skill',
    content: `Are you sure you want to delete "${skill.skill}"?`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        await skillsService.deleteSkill(skill.id)
        message.success('Skill deleted successfully')
        await loadSkills()
      } catch (error) {
        logger.error('Failed to delete skill', { error: error.message })
        message.error('Failed to delete skill')
      }
    },
  })
}
function resetSkillForm() {
  editingSkill.value = null
  skillForm.value = {
    skill: '',
    skillTypeId: null,
    isVisible: true,
    displayOrder: 0,
  }
}

function handleEditType(type) {
  editingType.value = type
  typeForm.value = {
    name: type.name,
    description: type.description || '',
    displayOrder: type.displayOrder || 0,
  }
  showTypeModal.value = true
}

async function handleSaveType() {
  if (!(await validateForm(typeFormRef))) return

  savingType.value = true
  try {
    if (editingType.value) {
      await skillsService.updateSkillType(editingType.value.id, typeForm.value)
      message.success('Skill type updated successfully')
    } else {
      await skillsService.createSkillType(typeForm.value)
      message.success('Skill type created successfully')
    }

    showTypeModal.value = false
    resetTypeForm()
    await loadSkillTypes()
    await loadSkills()
  } catch (error) {
    logger.error('Failed to save skill type', { error: error.message })
    message.error('Failed to save skill type')
  } finally {
    savingType.value = false
  }
}

function handleDeleteType(type) {
  dialog.warning({
    title: 'Delete Skill Type',
    content: `Are you sure you want to delete "${type.name}"? This may affect existing skills.`,
    positiveText: 'Delete',
    negativeText: 'Cancel',
    onPositiveClick: async () => {
      try {
        await skillsService.deleteSkillType(type.id)
        message.success('Skill type deleted successfully')
        await loadSkillTypes()
        await loadSkills()
      } catch (error) {
        logger.error('Failed to delete skill type', { error: error.message })
        message.error('Failed to delete skill type')
      }
    },
  })
}

function resetTypeForm() {
  editingType.value = null
  typeForm.value = {
    name: '',
    description: '',
    displayOrder: 0,
  }
}

onMounted(() => {
  loadSkillTypes()
  loadSkills()
})
</script>
