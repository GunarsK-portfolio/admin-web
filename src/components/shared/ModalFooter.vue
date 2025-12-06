<template>
  <n-space justify="end">
    <n-button @click="$emit('cancel')">{{ canSave ? 'Cancel' : 'Close' }}</n-button>
    <n-button v-if="canSave" type="primary" :loading="loading" @click="$emit('save')">
      {{ editing ? 'Update' : 'Create' }}
    </n-button>
  </n-space>
</template>

<script setup>
import { NSpace, NButton } from 'naive-ui'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  editing: {
    type: [Object, null],
    default: null,
  },
  canSave: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['cancel', 'save'])
</script>
