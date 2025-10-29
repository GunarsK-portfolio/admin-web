<template>
  <n-input
    :model-value="modelValue"
    :placeholder="placeholder"
    :aria-label="ariaLabel"
    class="search-input"
    clearable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prefix>
      <n-icon><SearchOutline /></n-icon>
    </template>
  </n-input>
</template>

<script setup>
import { NInput, NIcon } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Search...',
  },
  ariaLabel: {
    type: String,
    default: 'Search',
  },
})

defineEmits(['update:modelValue'])
</script>
