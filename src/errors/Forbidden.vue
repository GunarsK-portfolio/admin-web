<template>
  <n-space vertical align="center" justify="center" :size="32" class="error-page">
    <n-icon size="120" class="error-icon" :color="themeVars.errorColor">
      <LockClosedOutline />
    </n-icon>

    <n-space vertical align="center" :size="16">
      <h1 class="error-code" :style="{ color: themeVars.errorColor }">403</h1>
      <h2 class="error-title">Access Forbidden</h2>
      <n-text class="error-message"> You don't have permission to access this resource. </n-text>
    </n-space>

    <n-space :size="16">
      <n-button type="primary" size="large" @click="$router.push('/dashboard')">
        <template #icon>
          <n-icon><HomeOutline /></n-icon>
        </template>
        Back to Dashboard
      </n-button>
    </n-space>
  </n-space>
</template>

<script setup>
import { NSpace, NIcon, NText, NButton, useThemeVars } from 'naive-ui'
import { LockClosedOutline, HomeOutline } from '@vicons/ionicons5'

const themeVars = useThemeVars()
</script>

<style scoped>
.error-page {
  min-height: calc(100vh - 64px);
  padding: 40px 20px;
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  margin: 0;
  transition: color 0.3s;
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
}

.error-message {
  font-size: 18px;
  text-align: center;
  max-width: 500px;
  opacity: 0.8;
}
</style>
