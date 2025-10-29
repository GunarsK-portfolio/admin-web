<template>
  <n-button type="primary" @click="$emit('click')">
    <template #icon>
      <n-icon><AddOutline /></n-icon>
    </template>
    {{ label }}
  </n-button>
</template>

<script setup>
import { NButton, NIcon } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

defineProps({
  label: {
    type: String,
    required: true,
  },
})

defineEmits(['click'])
</script>
