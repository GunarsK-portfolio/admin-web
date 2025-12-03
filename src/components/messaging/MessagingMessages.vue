<template>
  <n-space vertical :size="16">
    <SearchInput v-model="search" placeholder="Search messages..." aria-label="Search messages" />

    <n-spin :show="loading" aria-label="Loading messages">
      <n-data-table :columns="columns" :data="filteredMessages" :pagination="{ pageSize: 10 }" />
    </n-spin>
  </n-space>

  <n-modal v-model:show="showViewModal" preset="card" title="Message Details" class="modal-medium">
    <template v-if="selectedMessage">
      <n-descriptions
        :column="1"
        label-placement="left"
        bordered
        :label-style="{ minWidth: '100px' }"
      >
        <n-descriptions-item label="Subject">
          {{ selectedMessage.subject }}
        </n-descriptions-item>
        <n-descriptions-item label="From">
          {{ selectedMessage.name }} &lt;{{ selectedMessage.email }}&gt;
        </n-descriptions-item>
        <n-descriptions-item label="Status">
          <n-tag :type="getStatusType(selectedMessage.status)" size="small">
            {{ selectedMessage.status }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="Created">
          {{ toDateTimeFormat(selectedMessage.createdAt) }}
        </n-descriptions-item>
        <n-descriptions-item v-if="selectedMessage.sentAt" label="Sent At">
          {{ toDateTimeFormat(selectedMessage.sentAt) }}
        </n-descriptions-item>
        <n-descriptions-item v-if="selectedMessage.attempts > 0" label="Attempts">
          {{ selectedMessage.attempts }}
        </n-descriptions-item>
        <n-descriptions-item v-if="selectedMessage.lastError" label="Last Error">
          <n-text type="error">{{ selectedMessage.lastError }}</n-text>
        </n-descriptions-item>
      </n-descriptions>

      <n-divider />

      <n-card title="Message Content" size="small">
        <pre class="message-content">{{ selectedMessage.message }}</pre>
      </n-card>
    </template>

    <template #footer>
      <n-button @click="showViewModal = false">Close</n-button>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, h, onMounted } from 'vue'
import {
  NSpace,
  NSpin,
  NDataTable,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NCard,
  NDivider,
  NButton,
  NText,
} from 'naive-ui'
import { EyeOutline } from '@vicons/ionicons5'
import messagingService from '../../services/messaging'
import { stringSorter, dateSorter, createActionsRenderer } from '../../utils/tableHelpers'
import { toDateFormat, toDateTimeFormat } from '../../utils/dateHelpers'
import { createSearchFilter } from '../../utils/filterHelpers'
import { createDataLoader } from '../../utils/crudHelpers'
import { useViewServices } from '../../composables/useViewServices'
import { useDataState } from '../../composables/useDataState'
import SearchInput from '../shared/SearchInput.vue'

const { message } = useViewServices()

const { data: messages, loading, search } = useDataState()

const showViewModal = ref(false)
const selectedMessage = ref(null)

const statusType = {
  pending: 'default',
  queued: 'info',
  sent: 'success',
  failed: 'error',
}

function getStatusType(status) {
  return statusType[status] || 'default'
}

const filteredMessages = createSearchFilter(messages, search, ['subject', 'name', 'email'])

const loadMessages = createDataLoader({
  loading,
  data: messages,
  service: messagingService.getAllMessages,
  entityName: 'messages',
  message,
})

function handleView(msg) {
  selectedMessage.value = msg
  showViewModal.value = true
}

const columns = [
  {
    title: 'Subject',
    key: 'subject',
    sorter: stringSorter('subject'),
    ellipsis: { tooltip: true },
  },
  {
    title: 'From',
    key: 'from',
    render: (row) => `${row.name} <${row.email}>`,
    ellipsis: { tooltip: true },
  },
  {
    title: 'Status',
    key: 'status',
    width: 100,
    render: (row) =>
      h(NTag, { type: getStatusType(row.status), size: 'small' }, { default: () => row.status }),
  },
  {
    title: 'Sent At',
    key: 'sentAt',
    width: 120,
    sorter: dateSorter('sentAt'),
    render: (row) => toDateFormat(row.sentAt, '—'),
  },
  {
    title: 'Created',
    key: 'createdAt',
    width: 120,
    sorter: dateSorter('createdAt'),
    render: (row) => toDateFormat(row.createdAt),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 80,
    render: createActionsRenderer([
      { icon: EyeOutline, onClick: handleView, label: 'View message' },
    ]),
  },
]

onMounted(() => {
  loadMessages()
})
</script>

<style scoped>
.message-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}
</style>
