<template>
  <n-config-provider :theme="theme">
    <n-layout style="min-height: 100vh">
      <router-view />
    </n-layout>
  </n-config-provider>
</template>

<script setup>
import { NConfigProvider, NLayout } from 'naive-ui'

const theme = null
</script>
