<template>
  <n-button text @click="router.push(to)">
    <template #icon>
      <n-icon><ArrowBackOutline /></n-icon>
    </template>
    {{ label }}
  </n-button>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'

const router = useRouter()

defineProps({
  to: {
    type: String,
    default: '/dashboard',
  },
  label: {
    type: String,
    default: 'Back to Dashboard',
  },
})
</script>
