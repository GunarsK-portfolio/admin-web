<template>
  <router-link v-slot="{ navigate, href }" :to="to" custom>
    <n-button text tag="a" :href="href" @click="navigate">
      <template #icon>
        <n-icon><ArrowBackOutline /></n-icon>
      </template>
      {{ label }}
    </n-button>
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowBackOutline } from '@vicons/ionicons5'

defineProps({
  to: {
    type: [String, Object],
    default: '/dashboard',
  },
  label: {
    type: String,
    default: 'Back to Dashboard',
  },
})
</script>
